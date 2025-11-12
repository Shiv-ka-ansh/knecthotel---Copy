const mongoose = require("mongoose");
const Bookings = require("../../models/Bookings");
const Guest = require("../../models/Guest");
const Transaction = require("../../models/Transaction");
const { createOrder } = require("../../utils/cashfreeServices");
const generateUniqueId = require("../../utils/idGenerator");
const ApiError = require("../../utils/ApiError");
const { sendNotificationToDevice } = require("../../service/firebaseNotification");
const { sendNotificationForServices } = require("../../../socket");
const { assertValidObjectId, sanitizeUpdates, formatTime } = require("../../utils/bookingHelpers");
const { sendGuestBooking } = require("../../utils/mailService");
const Hotel = require("../../models/Hotel");

exports.addBooking = async (req, res, next) => {
  try {
    const HotelId = req.user?.HotelId;
    if (!HotelId) throw new ApiError(403, "Invalid Permission");
    
    const hotelData = await Hotel.findById(HotelId).select('name')
    const body = req.body || {};
    const {
      countryCode,
      country,          
      phoneNumber,
      firstName,
      lastName,
      email,
      address,
      state,
      sources,
      city,
      pincode,
      checkIn,
      checkOut,
      assignedRoomNumber,
      roomTariffDue,
      receivedAmt,
      paymentMode,
      wifi,
      adultGuestsCount,
      childrenGuestsCount,
      infantGuestsCount,
      guests,
      gst,
      gstIn,
      businessName,
      roomTariff,
      roomCategory,
      paymentStatus,
      gender,
      idProof,          // for main guest if not in Guest collection
    } = body;

    // Required fields
    const requiredFields = [
      "phoneNumber",
      "firstName",
      "lastName",
      "address",
      "state",
      "city",
      "country",
      "pincode",
      "adultGuestsCount",
      "checkIn",
      "roomCategory",
      "roomTariff",
    ];

    const missingFields = requiredFields.filter((f) => !body[f]);
    if (missingFields.length > 0) {
      throw new ApiError(400, `Missing required fields: ${missingFields.join(", ")}`);
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    if (isNaN(checkInDate)) throw new ApiError(400, "Invalid checkIn datetime");
    let checkOutDate = null;
    if (checkOut) {
      checkOutDate = new Date(checkOut);
      if (isNaN(checkOutDate)) throw new ApiError(400, "Invalid checkOut datetime");
      if (checkOutDate < checkInDate) {
        throw new ApiError(400, "checkOut must be after checkIn");
      }
    }

    // Find existing guest
    const existingGuest = await Guest.findOne({ phoneNumber });
    // Prepare guests array (main guest first)
    const guestsArr = [];

    if (existingGuest) {
      guestsArr.push({
        guestType: "adult",
        firstName: existingGuest.firstName,
        lastName: existingGuest.lastName,
        phoneNumber: existingGuest.phoneNumber,
        countryCode: existingGuest.countryCode || countryCode || "+91",
        gender: existingGuest.gender || gender || undefined,
        idProof: existingGuest.idProof || {},
      });
    } else {
      guestsArr.push({
        guestType: "adult",
        firstName,
        lastName,
        phoneNumber,
        countryCode: countryCode || "+91",
        gender: gender || undefined,
        idProof: idProof || {},
      });
    }

    if (Array.isArray(guests)) {
      for (const g of guests) {
        guestsArr.push({
          guestType: g.guestType, // "adult" | "children" | "infant"
          firstName: g.firstName,
          lastName: g.lastName,
          phoneNumber: g.phoneNumber,
          countryCode: g.countryCode,
          gender: g.gender,
          idProof: g.idProof || {},
        });
      }
    }

    // Validate guest counts (uploaded counts must not exceed declared counts)
    const actualAdultCount = guestsArr.filter((g) => g.guestType === "adult").length;
    const actualChildrenCount = guestsArr.filter((g) => g.guestType === "children").length;
    const actualInfantCount = guestsArr.filter((g) => g.guestType === "infant").length;

    if (actualAdultCount > Number(adultGuestsCount)) {
      throw new ApiError(400, `adultGuestsCount (${adultGuestsCount}) is less than uploaded adult guests (${actualAdultCount})`);
    }
    if (actualChildrenCount > Number(childrenGuestsCount)) {
      throw new ApiError(400, `childrenGuestsCount (${childrenGuestsCount}) is less than uploaded children guests (${actualChildrenCount})`);
    }
    if (actualInfantCount > Number(infantGuestsCount)) {
      throw new ApiError(400, `infantGuestsCount (${infantGuestsCount}) is less than uploaded infant guests (${actualInfantCount})`);
    }

    // Collect id proofs
    const idProofsArr = [];
    for (const g of guestsArr) {
      if (g.idProof && g.idProof.url) idProofsArr.push(g.idProof);
    }

    // Build booking payload (normalize times)
    const bookingData = {
      countryCode: countryCode || "+91",
      country,
      firstName: existingGuest && existingGuest.firstName ? existingGuest.firstName : firstName,
      lastName: existingGuest && existingGuest.lastName ? existingGuest.lastName : lastName,
      email: existingGuest && existingGuest.email ? existingGuest.email : email,
      phoneNumber,
      address,
      state,
      sources,
      city,
      pincode,
      assignedRoomNumber: assignedRoomNumber || null,
      status: assignedRoomNumber ? "Confirmed" : "Pending",
      HotelId,
      guest: existingGuest ? existingGuest._id : null,
      roomTariffDue,
      receivedAmt,
      paymentMode,
      paymentStatus:paymentMode === "cash"?"pay-later":"pending",
      wifi,
      adultGuestsCount,
      childrenGuestsCount,
      infantGuestsCount,
      guests: guestsArr,
      gst,
      roomTariff,
      roomCategory,
      idProofs: idProofsArr,
      paymentStatus,
      gstIn,
      businessName,
      checkInDate,
      checkInTime: formatTime(checkInDate),
      ...(checkOutDate
        ? { checkOutDate, checkOutTime: formatTime(checkOutDate) }
        : {}),
    };

    // Add a “due” service line if dueAmt > 0
    if (Number(roomTariffDue) > 0) {
      bookingData.services = [
        { amount: Number(roomTariffDue), serviceRequestId: null, requestName: "Room Reservation Due" },
      ];
    }
    const booking = new Bookings(bookingData);
    await booking.save();

    // Notify existing guest
    if (existingGuest?.fcmToken && checkInDate instanceof Date) {
      const dd = String(checkInDate.getDate()).padStart(2, "0");
      const mm = String(checkInDate.getMonth() + 1).padStart(2, "0"); // month 0-based
      const yyyy = checkInDate.getFullYear();
      // await sendNotificationToDevice(
      //   existingGuest.fcmToken,
      //   "Booking Created",
      //   `You have a new booking for ${dd}-${mm}-${yyyy}`
      // );
    }     
    // await sendGuestBooking(email, hotelData.name)
    return res.status(201).json({
      success: true,
      message: "Booking Created",
      booking,
    });
  } catch (e) {
    // Bubble ApiError or wrap unknowns
    if (e.name === "ValidationError") {
      const messages = Object.values(e.errors || {}).map((err) => err.message);
      return next(new ApiError(400, messages.join(", ")));
    }
    return next(e instanceof ApiError ? e : new ApiError(500, e.message || "Internal Server Error"));
  }
};


exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Bookings.find().populate('HotelId').sort({createdAt:-1});
    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (e) {
    console.log(e);

    return res.status(500).json({
      message: "Internal Server Error!",
      error: e.message || e,
    });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Bookings.findById(id).lean();
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not Found!",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Booking Found!",
      booking,
    });
  } catch (e) {
    console.log(e);

    return res.status(500).json({
      message: "Internal Server Error!",
      error: e.message || e,
    });
  }
};

exports.getHotelBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const HotelId = req.user.HotelId;
    if (!HotelId) {
      return res.status(403).json({
        success: false,
        message: "Invalid Permission: Get Hotel Bookings",
      });
    }
    const total = await Bookings.countDocuments({HotelId})
    const bookings = await Bookings.find({ HotelId })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      bookings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (e) {
    console.log(e);

    return res.status(500).json({
      message: "Internal Server Error!",
      error: e.message || e,
    });
  }
};

exports.getHotelBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    const HotelId = req.user.HotelId;
    if (!HotelId) {
      return res.status(403).json({
        success: false,
        message: "Invalid Permission",
      });
    }
    const booking = await Bookings.findOne({ _id: id, HotelId })
      .populate("services.serviceRequestId", "__t uniqueId")
      .populate("guest")
      .lean();
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not Found!",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Booking Found!",
      booking,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Internal Server Error!",
      error: e.message || e,
    });
  }
};

exports.updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    assertValidObjectId(id, "Invalid Booking Id");

    const HotelId = req.user?.HotelId;
    if (!HotelId) throw new ApiError(403, "Invalid Permission");

    let { updates } = req.body;
    if (!updates || typeof updates !== "object") {
      throw new ApiError(400, "No updates provided");
    }

    const prevBooking = await Bookings.findOne({ _id: id, HotelId }).lean();
    if (!prevBooking) throw new ApiError(404, `Booking not found with Id ${id}`);

    const nonEditableFields = [
      "phoneNumber",
      "HotelId",
      "email",
      "firstName",
      "lastName",
      "guest",
      "city",
      "state",
    ];
    updates = sanitizeUpdates(updates, nonEditableFields);

    // Normalize assignedRoomNumber
    if ("assignedRoomNumber" in updates && updates.assignedRoomNumber === "") {
      updates.assignedRoomNumber = null;
    }

    // Handle check-in/out transformations
    if (updates.checkIn) {
      const checkInDate = new Date(updates.checkIn);
      if (isNaN(checkInDate)) throw new ApiError(400, "Invalid checkIn datetime");
      updates.checkInDate = checkInDate;
      updates.checkInTime = formatTime(checkInDate);
      delete updates.checkIn; // keep normalized fields only
    }
    if (updates.checkOut) {
      const checkOutDate = new Date(updates.checkOut);
      if (isNaN(checkOutDate)) throw new ApiError(400, "Invalid checkOut datetime");
      updates.checkOutDate = checkOutDate;
      updates.checkOutTime = formatTime(checkOutDate);
      delete updates.checkOut;
    }
    
    let isCheckingOut = false;
    if (updates.status === "Checked-Out") {
      isCheckingOut = true;
      const roomTariffDue = "roomTariffDue" in updates ? updates.roomTariffDue : prevBooking.roomTariffDue;
      const serviceDue = "serviceDue" in updates ? updates.serviceDue : prevBooking.serviceDue; 
      const dueAmt = roomTariffDue + serviceDue;
      if (dueAmt > 0) {
        throw new ApiError(400, `Cannot Check-Out. Pending amount of ₹${dueAmt} must be cleared first.`);
      }
    }
    // Update booking
    const updatedBooking = await Bookings.findOneAndUpdate(
      { _id: id, HotelId },
      { $set: updates },
      { new: true }
    );
    if (!updatedBooking) throw new ApiError(404, "Booking not found!");

    let guestDoc = null;
    if (updatedBooking.guest) {
      guestDoc = await Guest.findById(updatedBooking.guest);
    } else {
      guestDoc = await Guest.findOne({ phoneNumber: updatedBooking.phoneNumber });
      if (guestDoc) {
        updatedBooking.guest = guestDoc._id;
        await updatedBooking.save();
      }
    }

    // Room change side-effects
    const roomChanged =
      "assignedRoomNumber" in updates &&
      updates.assignedRoomNumber !== prevBooking.assignedRoomNumber;

    if (roomChanged && guestDoc) {
      // Optional transaction (uncomment if you want atomicity)
      
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        guestDoc.assignedRoomNumber = updates.assignedRoomNumber;
        await guestDoc.save({ session });

        await session.commitTransaction();
      } catch (err) {
        await session.abortTransaction();
        throw err;
      } finally {
        session.endSession();
      }
      
      // Notify guest about room change
      if (guestDoc.fcmToken && roomChanged) {
        await sendNotificationToDevice(
          guestDoc.fcmToken,
          "Room Upgraded",
          `Your room has been changed to ${updates.assignedRoomNumber}. Please relaunch the app.`,
          { assignedRoomNumber: updates.assignedRoomNumber }
        );
      }
    }

    // Booking confirmation notification
    const newlyConfirmed =
      prevBooking?.status !== "Confirmed" &&
      updatedBooking.status === "Confirmed";

    if (newlyConfirmed && guestDoc?.fcmToken && updates.assignedRoomNumber) {
      await sendNotificationToDevice(
        guestDoc.fcmToken,
        "Booking Confirmed ✅",
        `Your booking is now confirmed. You can Check In to Room Number: ${updates.assignedRoomNumber}.`,
        { assignedRoomNumber: updates.assignedRoomNumber }
      );
    }
    
    if (isCheckingOut && guestDoc && guestDoc?.fcmToken) {
      await sendNotificationToDevice(
        guestDoc.fcmToken,
        "Checked Out Successfully ✅",
        `You have successfully checked out. We hope you had a great stay!`,
        null
      );
      guestDoc.currentBooking = null;
      guestDoc.HotelId = null;
      await guestDoc.save();
    }

    return res.status(200).json({
      success: true,
      message: "Booking Updated!",
      booking: updatedBooking,
    });
  } catch (e) {
    return next(e instanceof ApiError ? e : new ApiError(500, e.message || "Internal Server Error"));
  }
};


exports.getPendingPreCheckInCount = async (req, res) => {
  try {
    const HotelId = req.user.HotelId;
    if (!HotelId) {
      return res.status(403).json({
        success: false,
        message: "Invalid Permission: Get Hotel Bookings",
      });
    }
    const count = await Bookings.countDocuments({
      HotelId,
      preCheckIn: true,
      preCheckInStatus: { $in: ["Pending", "ALLOW", "Rejected"] },
     });
    res.status(200).json({ status: true, count });
  } catch (error) {
    console.error("Error fetching pending preCheckIn count:", error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

exports.approvePreCheckIn = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedRoomNumber } = req.body; 
    const HotelId = req.user.HotelId;
    // Validate hotel permissions
    if (!HotelId) {
      return res.status(403).json({
        success: false,
        message: "Invalid permissions",
      });
    }
    // Find the booking
    const booking = await Bookings.findOne({
      _id: id,
      HotelId,
      preCheckIn: true,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Pre-checkin request not found or already processed",
      });
    }
    const guest = await Guest.findOne({ phoneNumber: booking.phoneNumber });
    if (!booking.guest) {
      if (guest) {
        booking.guest = guest._id;
      }
    }
    
    
    // Update booking with rejection details
    if (assignedRoomNumber) {
      booking.assignedRoomNumber = assignedRoomNumber;
    }
    booking.status = "Confirmed"
    booking.preCheckInStatus = "Approved";
    
    await booking.save();
    // Notify guest via FCM if available
    const fcmToken = guest?.fcmToken; // Assuming guest has a  
    // Notify guest via socket if available
    if (booking.guest && fcmToken) {
      await sendNotificationToDevice(
        fcmToken,
        "Pre-checkIn Approved",
        `You can now checkIn at Room- ${assignedRoomNumber}`,
        { assignedRoomNumber },
        null
      );
    }

    return res.status(200).json({
      success: true,
      message: "Pre-checkin Approved",
      booking,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.allowPreCheckIn = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedRoomNumber } = req.body;
    const HotelId = req.user.HotelId;

    // Validate hotel permissions
    if (!HotelId) {
      return res.status(403).json({
        success: false,
        message: "Invalid permissions",
      });
    }

    // Find the booking
    const booking = await Bookings.findOne({
      _id: id,
      HotelId,
      preCheckIn: true,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Pre-checkin request not found or already processed",
      });
    }
   
    // Update booking with rejection details
    if (assignedRoomNumber) {
      if (assignedRoomNumber) {
      booking.assignedRoomNumber = assignedRoomNumber;
    }
    }
    booking.preCheckInStatus = "ALLOW";

    await booking.save();

    let guest = await Guest.findOne({ phoneNumber: booking.phoneNumber });

    if (!booking.guest) {
      if (guest) {
        booking.guest = guest._id;
      }
    }
   await booking.save();
   // Notify guest via FCM if available
   const fcmToken = guest?.fcmToken; // Assuming guest has a
   // Notify guest via socket if available
   if (booking.guest && fcmToken) {
     await sendNotificationToDevice(
       fcmToken,
       "Pre-checkIn Allowed",
       `Text for Allow PreCheckIn.`,
       null
     );
   }

    return res.status(200).json({
      success: true,
      message: "Pre-checkin Allowed",
      booking,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};


exports.rejectPreCheckIn = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionMessage } = req.body; // Get rejection message from request body
    const HotelId = req.user.HotelId;

    // Validate hotel permissions
    if (!HotelId) {
      return res.status(403).json({
        success: false,
        message: "Invalid permissions",
      });
    }

    // Find the booking
    const booking = await Bookings.findOne({
      _id: id,
      HotelId,
      preCheckIn: true,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Pre-checkin request not found or already processed",
      });
    }

    // Update booking with rejection details
    booking.preCheckInRejectionMessage = rejectionMessage;
    booking.preCheckInStatus = 'Rejected'
    await booking.save();

    const guest = await Guest.findOne({ phoneNumber: booking.phoneNumber });
    
    const fcmToken = guest?.fcmToken; // Assuming guest has a
    // Notify guest via socket if available
    if (booking.guest && fcmToken) {
      await sendNotificationToDevice(
        fcmToken,
        "Pre-checkIn Rejected",
        `Rejection Reason: ${rejectionMessage}.`,
        null
      );
    }

    return res.status(200).json({
      success: true,
      message: "Pre-checkin rejected",
      booking,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getGuestBookings = async (req, res, next) => {
  try {
    const guest = req.guest;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to midnight

    const phoneNumber = guest.phoneNumber;

    const pastFilter = {
      phoneNumber,
      $or: [
        { status: { $in: ['Checked-Out', 'Cancelled', 'No-Show'] } },
        { checkOutDate: { $lt: today } }
      ]
    };

    const upcomingFilter = {
      phoneNumber,
      status: { $nin: ['Checked-Out', 'Cancelled', 'No-Show'] }, // exclude past statuses
      checkOutDate: { $gte: today } // only future-or-today dates
    };


    const [pastBookings, upcomingBookings] = await Promise.all([
      Bookings.find(pastFilter)
        .lean()
        .populate("HotelId", "name images")
        .sort({ checkOutDate: -1 }),
      Bookings.find(upcomingFilter)
        .lean()
        .populate("HotelId", "name images")
        .sort({ checkInDate: 1 }),
    ]);

    // Format time for each booking
    const formatBookingTimes = (bookings) => {
      return bookings.map((booking) => {
        let checkInTime = null;
        let checkOutTime = null;

        if (booking.checkInDate) {
          checkInTime = new Date(booking.checkInDate).toLocaleTimeString(
            "en-US",
            {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
              timeZone: "Asia/Kolkata",
            }
          );
        }

        if (booking.checkOutDate) {
          checkOutTime = new Date(booking.checkOutDate).toLocaleTimeString(
            "en-US",
            {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
              timeZone: "Asia/Kolkata",
            }
          );
        }

        return { ...booking, checkInTime, checkOutTime };
      });
    };

    return res.status(200).json({
      success: true,
      message: "Bookings fetched for Guest",
      upcomingBookings: formatBookingTimes(upcomingBookings),
      pastBookings: formatBookingTimes(pastBookings),
    });
  } catch (error) {
    return next(error);
  }
};


exports.getGuestBookingById = async (req, res, next) => {
  try {
    const bookingId = req.params.bookingId;
    const phoneNumber = req.guest.phoneNumber;

    const booking = await Bookings.findOne({ _id: bookingId, phoneNumber })
      .lean()
      .populate("HotelId", "name images");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found for this guest",
      });
    }

    const { checkInDate, checkOutDate } = booking;

    let checkInTime = null;
    let checkOutTime = null;

    if (checkInDate) {
      const checkIn = new Date(checkInDate);
      checkInTime = checkIn.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });
    }

    if (checkOutDate) {
      const checkOut = new Date(checkOutDate);
      checkOutTime = checkOut.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking fetched for guest",
      booking: { ...booking, checkInTime, checkOutTime },
    });
  } catch (error) {
    return next(error);
  }
};

exports.createPreCheckInRequest = async (req, res, next) => {
  try {
    const guest = req.guest
    const guestId = req.guest._id
    const bookingId = req.params.bookingId
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message:'bookingId is required!'
      })
    }
       
    const booking = await Bookings.findOne({ _id: bookingId, phoneNumber:guest.phoneNumber})
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "No Booking Found!",
      })
    }
    if (booking.preCheckIn)
       return res.status(400).json({
         success: false,
         message: "Pre Checking Already Sent!",
       });
    if (booking.assignedRoomNumber) {
      return res.status(400).json({
        success: false,
        message: "Booking is Already Confirmed"
      })
    }
    const today = new Date();
    
    let EarliestCheckInDate = new Date(booking.checkInDate)
    
    
    EarliestCheckInDate.setDate(EarliestCheckInDate.getDate()-3)
    
    if (today < EarliestCheckInDate) {
      throw new ApiError(400, 'Pre check-in is only allowed within 3 days before your check-in date.')
    }
    // check for guest count
    if (booking.adultGuestsCount > 1 || booking.childrenGuestsCount > 0) {
      const totalGuestRequired = booking.adultGuestsCount + booking.childrenGuestsCount - 1
      if (totalGuestRequired > booking.guests.length) {
        throw new ApiError(400, 'Please Add Guests before applying for pre check In! ')
      }
    }
    console.log(booking.guests)
    
    booking.specialRequest = req.body.specialRequest;
    booking.preCheckInStatus = 'Pending';
    booking.preCheckIn = true;
    
    await booking.save()
    
    await sendNotificationForServices(
      "guest-management",
      booking.HotelId.toString(),
      "notification:services",
      `Pre CheckIn Request for Booking ID: ${booking.uniqueId}`,
      `/hotel-panel/guest-management/pending/view/${booking._id}`
    );
    
    return res.status(200).json({
      success: true,
      message:'Pre CheckIn Request Sent!'
    })
  } catch (error) {
    return next(error)
  }
}

exports.getPreCheckInRequests = async (req, res, next) => {
  try {
    const HotelId = req.user.HotelId;
    if (!HotelId) {
      return res.status(403).json({
        success: false,
        message: "Invalid Permission: Get Hotel Bookings",
      });
    }
    const bookings = await Bookings.find({
      HotelId,
      preCheckIn: true,
      preCheckInStatus: { $in: ["Pending", "ALLOW", "Rejected"] },
    }).sort({createdAt : -1});
    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (e) {
    console.log(e);

    return res.status(500).json({
      message: "Internal Server Error!",
      error: e.message || e,
    });
  }
}

exports.checkInForGuests = async (req, res, next) => {
  try{
    const bookingId = req.params.bookingId
    const specialRequest = req.body.specialRequest
    if (!bookingId) {
      throw new ApiError(404, 'bookingId is required!')
    }
    const booking = await Bookings.findOne({
      _id: bookingId,
      phoneNumber: req.guest.phoneNumber,
    }).populate(
      "HotelId",
      "name address phoneNo city about reviews images logo servingDepartment"
    );
    if (!booking) {
      throw new ApiError(404, 'No booking found!')

    }
    
    if (["Checked-Out", "Cancelled", "No-Show"].includes(booking.status))
      throw new ApiError(409, "Booking Already "+ booking.status+" !")
    

    if (booking.status === "Pending" || !booking.assignedRoomNumber) {
      return res.status(400).json({success:false, message:'Booking Not Confirmed Yet!'})
    }
    
    const totalGuestRequired = booking.adultGuestsCount + booking.childrenGuestsCount - 1;
    if (booking.guests.length < totalGuestRequired) {
      throw new ApiError(400, `Please Add all Guests before Check In! Total Guests Required: ${totalGuestRequired}`);
    }
    let EarliestCheckInDate = new Date(booking.checkInDate)

    const today = new Date();

    EarliestCheckInDate.setDate(EarliestCheckInDate.getDate() - 3)

    if (today < EarliestCheckInDate) {
      throw new ApiError(400, 'Check-in is only allowed within 3 days before your check-in date.')
    }

    booking.status = 'Checked-In'
    booking.specialRequest = specialRequest
    const guest = await Guest.findByIdAndUpdate(req.guest._id, {
      assignedRoomNumber: booking.assignedRoomNumber,
      HotelId: booking.HotelId,
      currentBooking: bookingId
    })
    await booking.save()
    
    await sendNotificationForServices('guest-management', booking.HotelId._id.toString(), 'notification:services', `Guest Checked In At Hotel for Booking ID: ${booking.uniqueId}`, `/hotel-panel/guest-management/view/${booking._id}`)
    
    return res.status(200).json({
      success: true,
      booking,
      message: "Successfully CheckedIn",
      HotelId: booking.HotelId,
      bookingThrough: booking.sources,
      guest: {
        firstName: guest.firstName,
        lastName: guest.lastName,
        phoneNumber: guest.phoneNumber,
        email: guest.email,
        assignedRoomNumber: booking.assignedRoomNumber,
        language: guest.language,
      },
    });
  } catch (error) {
    return next(error)
  }
}

exports.checkOutForGuests = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
  const guest = req.guest;
    const guestId = req.guest._id;
    const bookingId = req.params.bookingId;
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "bookingId is required!",
      });
    }
    const booking = await Bookings.findOne({
      _id: bookingId
    });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "No Booking Found!",
      });
    }
    
    const dueAmt = booking.roomTariffDue + booking.serviceDue;
    let payment_session_id;
    
    if (dueAmt > 0) {
      const transactionId = await generateUniqueId(
        "Transaction",
        "transactionId",
        "TXO"
      );
          const response = await createOrder(transactionId, dueAmt, booking.HotelId, {
            customer_id: req.guest._id,
            customer_name: guest.firstName,
            customer_email: guest?.email,
            customer_phone: guest.phoneNumber,
          });
          const payment_session_id = response.payment_session_id;
          if (response.status !== 200 || !payment_session_id) {
            new ApiError(response.status, response);
          }
          const transaction = new Transaction({
            transactionId,
            transactionType:'DuePayment',
            hotel: booking.HotelId,
            guest: req.guest._id,
            booking:booking._id,
            subscription: null,
            amount: dueAmt,
            status: "created",
            paymentGateway: "cashfree",
            paymentLink: "  x",
            coupon: null,
            discount:0,
            metadata: {
            },
            gatewayResponse: response.data,
          });
      
      await transaction.save({ session });
      
      await booking.save()
      await session.commitTransaction();
      return res.status(402).json({
        success: false,
        message: "Clear All you dues before CheckOut",
        payment_session_id,
      });
    }
    booking.status = "Checked-Out";
    booking.save()
    guest.assignedRoomNumber = null;
    guest.HotelId = undefined;
    await Guest.findByIdAndUpdate(
      guest._id,
      { assignedRoomNumber: null, HotelId: null },
      { session }
    );
    await session.commitTransaction();
    
    await sendNotificationForServices('guest-management',
      booking.HotelId.toString(),
      'notification:services',
      `Guest Checked Out from Room ${booking.assignedRoomNumber}. Booking ID: ${booking.uniqueId}`,
      `/hotel-panel/guest-management/view/${booking._id}`
    )

    return res.status(200).json({
      success: true,
      message: "CheckOut Successful!",
    });
  } catch (error) {
    await session.abortTransaction();

    return next(error);
  } finally {
      session.endSession();
    }
};

// controllers/bookingController.js
exports.deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userHotelId = req.user?.HotelId;

    // --- 1. Authentication & Hotel scope check ------------------------------
    if (!userHotelId) {
      return res.status(403).json({
        success: false,
        message: "Invalid Permission ⟩ HotelId missing in token",
      });
    }

    // --- 2. Look up the booking --------------------------------------------
    const booking = await Bookings.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // --- 3. Authorisation: ensure booking belongs to same hotel -------------
    if (booking.HotelId.toString() !== userHotelId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorised to delete this booking",
      });
    }

    // --- 4. Delete (hard delete) -------------------------------------------
    await booking.deleteOne();           // or booking.remove(); in older Mongoose

    return res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
      bookingId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting booking",
      error: error.message,
    });
  }
};

exports.searchBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const { searchTerm } = req.query;
    
    if (!searchTerm || searchTerm.trim() === "") {
      throw new ApiError(400, 'Search term is required!');
    }

    // Create case-insensitive regex pattern
    const searchRegex = new RegExp(searchTerm.trim(), "i");

    const total = await Bookings.countDocuments({
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { phoneNumber: searchRegex },
        { uniqueId: searchRegex },
      ],
      HotelId: req.user.HotelId,
    });
    const results = await Bookings.find({
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { phoneNumber: searchRegex },
        { uniqueId: searchRegex },
      ],
      HotelId: req.user.HotelId,
    })
      .select("-services")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();
      ;
    // Optional population

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page >
          
          
          
          
          1,
      },
    });
  } catch (error) {
    return next(error)
  }
};

exports.getGSTIn = async  (req, res, next) => {
  try {
    const guest = req.guest;
    const bookingId = req.params.bookingId;
    if (!bookingId) {
      throw new ApiError(400, 'Booking ID is required');
    }
    const booking = await Bookings.findOne({ _id: bookingId, phoneNumber: guest.phoneNumber}).select('gstIn businessName').lean();
    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }
    if (!booking.gstIn) {
      return res.status(404).json({
        success: true,
        message: 'GSTIN not provided for this booking',
        gstIn: null,
        businessName: null,
      });
    }
    return res.status(200).json({
      success: true,
      gstIn: booking.gstIn || null,
      businessName: booking.businessName || null,
    });
  } catch (error) {
    return next(error)
  }
}

exports.updateGSTIn = async (req, res, next) => {
  try {
    const bookingId = req.params.bookingId;
    const { gstIn, businessName } = req.body;
    if (!bookingId) {
      throw new ApiError(400, 'Booking ID is required');
    }
    const booking = await Bookings.findByIdAndUpdate(bookingId, { gstIn, businessName }, { new: true });
    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }
    return res.status(200).json({
      success: true,
      message: 'GSTIN updated successfully',
      updatedGST: booking.gstIn,
    });
  }
  catch (error) {
    return next(error)
  }
};                      