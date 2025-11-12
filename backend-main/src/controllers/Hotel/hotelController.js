const bcrypt = require('bcrypt');
const moment = require("moment-timezone");
const { default: mongoose } = require("mongoose");

const ApiError = require("../../utils/ApiError");
const { validateAndApplyCoupon } = require("../../utils/couponUtils");
const {
  sendSubscriptionConfirmation,
  sendRejectionEmail,
} = require("../../utils/mailService");
// const { generatePaymentLink } = require("../../utils/cashfreeServices");
const { generateRandomPassword } = require("../../utils/password");

const Hotel = require('../../models/Hotel');
const Admin = require("../../models/SuperAdmin/Admin")
const PendingHotel = require('../../models/PendingHotel');
const Subscription = require("../../models/Subscription");

const {
  validateHotelData,
  checkEmailExists,
  validateHotelType,
  validateSubscription,
  processCoupon,
  createHotelAdmin,
  createHotelRecord,
  updateParentHotel,
  finalizeCouponApplication,
} = require("../../service/hotelServices");

const generateUniqueId = require('../../utils/idGenerator');
const Transaction = require("../../models/Transaction");
const Bookings = require('../../models/Bookings');
const { generatePaymentLink } = require('../../utils/cashfreeServices');

exports.addHotel = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // Validate core hotel data
      const validationError = validateHotelData(req.body);
      if (validationError) throw validationError;

      // Check email existence
      await checkEmailExists(req.body.email, session);

      // Validate hotel type and parent relationships
      const parentHotelDoc = await validateHotelType(req.body, session);

      
      // Process subscription and coupons
      const { subscription, finalPrice, couponDetails, subscriptionEndDate} =
        await validateSubscription(req.body, session);
      const password = generateRandomPassword();
      req.body.password = password;
      // Create admin user
      const newAdmin = await createHotelAdmin(req.body, session);

      // Create hotel record
      const hotel = await createHotelRecord(
        req.body,
        newAdmin,
        subscription,
        couponDetails,
        finalPrice,
        parentHotelDoc,
        session,
        subscriptionEndDate
      );

      // Update admin with hotel ID
      newAdmin.HotelId = hotel._id;
      await newAdmin.save({ session });

      // Update parent hotel if needed
      if (parentHotelDoc) {
        await updateParentHotel(parentHotelDoc, hotel, session);
      }

      // Final coupon application
      if (req.body.couponCode) {
        await finalizeCouponApplication(
          req.body.couponCode,
          hotel,
          finalPrice,
          session
        );
      }
      const transactionId = await generateUniqueId(
        "Transaction",
        "transactionId",
        "TXN"
      );
      // Generate payment link
      const payment_link = await generatePaymentLink(
        {
          customer_name: req.body.name,
          customer_phone: req.body.phoneNo,
          customer_email: req.body.email,
        },
        finalPrice,
        transactionId
      );

      // Create transaction record
      const transaction = await Transaction.create(
        [
          {
            transactionId,
            transactionType: 'SubscriptionPayment',
            hotel: hotel._id,
            subscription: subscription._id,
            amount: finalPrice,
            paymentLink: payment_link,
            status: "created",
            coupon: couponDetails?.coupon?._id,
            discountAmount: couponDetails?.discountAmount,
            gstPercentage: req.body.gstPercentage,
            metadata: {
              hotelName: req.body.name,
              subscriptionPlan: subscription.planName,
            },
          },
        ],
        { session }
      ).then((transactions) => transactions[0]);

      hotel.subscriptionPaymentStatus = "pending";
      // Add transaction to hotel
      hotel.transaction = transaction._id;
      await hotel.save({ session });

      // Send confirmation email (non-blocking)
      sendConfirmationEmail(
        req.body,
        hotel,
        couponDetails,
        payment_link,
        subscription
      );

      // Send success response
      res.status(201).json({
        status: true,
        message: "Hotel created successfully",
        hotel: formatHotelResponse(hotel),
        loginDetails: {
          email: req.body.email,
          password: newAdmin.password,
        },
      });
    });
  } catch (error) {
    // The transaction will be automatically aborted if an error occurs
   return next(error);
  } finally {
    await session.endSession();
  }
};

// Helper functions
function sendConfirmationEmail(body, hotel, couponDetails, payment_link, subscription) {
  try {
    sendSubscriptionConfirmation(body.email, {
      hotelName: body.name,
      adminEmail: body.email,
      adminPassword: body.password,
      subscriptionPlan: subscription.planName,
      subscriptionPrice: subscription.cost,
      address: body.address,
      HotelId: hotel.HotelId,
      subscriptionStartDate: hotel.subscriptionStartDate,
      subscriptionEndDate: hotel.subscriptionEndDate,
      validity: subscription.planDuration,
      ...(couponDetails ? {
        couponCode: couponDetails.code,
        discountAmount: couponDetails.discountAmount,
        finalPrice: couponDetails.finalPrice
      } : {}),
      payment_link
    });
  } catch (emailError) {
    console.error("Email sending failed:", emailError);
  }
}

function formatHotelResponse(hotel) {
  return {
    id: hotel._id,
    HotelId: hotel.HotelId,
    name: hotel.name,
    email: hotel.email,
    status: hotel.status,
    subscriptionPlan: hotel.subscriptionPlan,
    subscriptionPrice: hotel.subscriptionPrice,
    city: hotel.city,
    country: hotel.country
  };
}

exports.updateHotel = async (req, res) => {
  let { hotelId } = req.params;
  if (req.user.scope !== 'Platform') {
    hotelId = req.user.HotelId;
  }
  try {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    // Update top-level fields
    const AllowedFields = [
      "name",
      "address",
      "email",
      "phoneNo",
      "gst",
      "subscriptionPlan",
      "status",
      "hotelCategory",
      "city",
      "country",
      "state",
      "pincode",
      "images",
      "logo",
      "internetConnectivity",
      "softwareCompatibility",
      "rooms",
      "wifi",
      "about",
      "servingDepartment",
      "hotelLicenseAndCertification",
      "legalAndBusinessLicense",
      "touristLicense",
      "panNumber",
      "dataPrivacyAndGDPRCompliance",
      "gstImage"
    ];

    const updatePayload = {};
    AllowedFields.forEach((key) => {
      if (req.body[key] !== undefined) {
        updatePayload[key] = req.body[key];
      }
    });

    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({ message: "No updatable fields provided." });
    }

    // ---------- 2. Run the update ----------
    const updatedHotel = await Hotel.findOneAndUpdate(
      { _id: hotelId }, // searchable by custom HotelId
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    if (!updatedHotel) {
      return res.status(404).json({ message: "Hotel not found." });
    }

  

    return res.status(200).json({
      status: true,
      message: "Hotel updated successfully",
      hotel:updatedHotel,
    });
  } catch (error) {
    console.error("Error updating hotel:", error);
    return res
      .status(500)
      .json({ message: "Error updating hotel", error: error.message });
  }
};

const ALLOWED_KEYS = [
  "images",
  "checkInTime",
  "checkOutTime",
  "servingDepartment",
  "totalStaff",
  "numberOfRooms",
  "logo",
  "gst",
  "rooms",
  "hotelLicenseAndCertification",
  "legalAndBusinessLicense",
  "touristLicense",
  "panNumber",
  "dataPrivacyAndGDPRCompliance",
  "internetConnectivity",
  "softwareCompatibility",
  "about",
  "wifi",
  "gstImage"
];

exports.updateHotelProfile = async (req, res, next) => {
  try {
    const  HotelId  = req.user.HotelId;

    if (!HotelId)
      throw new ApiError(404, 'Hotel Id is missing!')
    // ---------- 1. Build a pared-down update object ----------
    const updatePayload = {};
    ALLOWED_KEYS.forEach((key) => {
      if (req.body[key] !== undefined) {
        updatePayload[key] = req.body[key];
      }
    });

    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({ message: "No updatable fields provided." });
    }

    // ---------- 2. Run the update ----------
    const updatedHotel = await Hotel.findOneAndUpdate(
      { _id:HotelId }, // searchable by custom HotelId
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    if (!updatedHotel) {
      return res.status(404).json({ message: "Hotel not found." });
    }

    return res.status(200).json({
      message: "Hotel updated successfully.",
      data: updatedHotel,
    });
  } catch (err) {
    next(err);
  }
};

// searchHotel (Only accessible by Super Admin)
exports.searchHotelByHotelId = async (req, res, next) => {
  try {
    const HotelId = req.params.HotelId
    if (!HotelId) {
      throw new ApiError(400, "HotelId is missing")
    }
    const hotel = await Hotel.findOne({HotelId})
      .select("HotelId name email phoneNumber")

    if (!hotel) {
      throw new ApiError(404, "Hotel not found!")
    }
    return res.status(200).json({
      status: true,
      hotel,
    });
  } catch (error) {
    console.error("Error fetching hotels:", error);
    return next(error);
  }
};

// Get all hotels (Only accessible by Super Admin)
exports.getAllHotels = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination metadata
    const totalHotels = await Hotel.countDocuments();

    const hotels = await Hotel.find()
      .select("-password -gst -gstImage -panNumber -dataPrivacyAndGDPRCompliance -legalAndBusinessLicense -touristLicense -hotelLicenseAndCertification -images -logo -reviews -serviceAvailability -rooms")
      .populate("subscriptionPlan", "planName planType cost duration")
      .populate("coupon", "code discountType value")
      .skip(skip)
      .sort({
        createdAt: -1,
      })
      .limit(limit);

    return res.status(200).json({
      status: true,
      hotels,
      totalHotels,
      currentPage: page,
      totalPages: Math.ceil(totalHotels / limit),
    });
  } catch (error) {
    console.error("Error fetching hotels:", error);
    return res.status(500).json({ message: "Error fetching hotels", error });
  }
};

exports.getSubHotels = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination metadata
    const totalHotels = await Hotel.countDocuments();

    const hotels = await Hotel.find({ chainHotel: true })
      .populate("parentHotel", "name phoneNo email HotelId ")
      .populate("subscriptionPlan", "planName planType cost duration")
      .populate("coupon", "code discountType value")
      .select("-password -gst")
      .lean()
      .skip(skip)
      .sort({
        name:-1, createdAt:-1
      })
      .limit(limit);

    return res.status(200).json({
      status: true,
      hotels,
      totalHotels,
      currentPage: page,
      totalPages: Math.ceil(totalHotels / limit),
    });
  } catch (error) {
    console.error("Error fetching hotels:", error);
    return res.status(500).json({ message: "Error fetching hotels", error });
  }
};


exports.getHotelById = async (req, res) => {
  try {
    const HotelId = req.params.HotelId
    
    if (req.user.scope !== "Platform") {
      if (req.user.HotelId?.toString() !== HotelId) {
        return res.status(403).json({ message: "Invalid Permission!" });
      }
    }
    
    const hotelDetails = await Hotel.findById(HotelId)
      .select("-password -gst")// Don't return password
      .populate("subscriptionPlan", "planName planType cost duration")
      .populate("coupon", "code discountType value").lean();
    return res.status(200).json({
      status: true,
      hotel: hotelDetails,
    });
  } catch (error) {
    console.error("Error fetching hotels:", error);
    return res.status(500).json({ message: "Error fetching hotels", error });
  }
};
// Delete a hotel (Only accessible by Super Admin)
exports.deleteHotel = async (req, res) => {
  const { hotelId } = req.params;

  try {
    const hotel = await Hotel.findByIdAndDelete(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    return res.status(200).json({
      status: true,
      message: 'Hotel deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    return res.status(500).json({ message: 'Error deleting hotel', error });
  }
};
exports.submitJoinRequest = async (req, res) => {
  try {
    const { hotelDetails } = req.body;

    // === 1. BASIC FIELD VALIDATION ===
    const requiredFields = [
      "name",
      "address",
      "email",
      "phoneNo",
      "hotelCategory",
      "city",
      "country",
      "state",
      "pincode",
      "checkInTime",
      "checkOutTime",
      "totalStaff",
      
    ];

    const missingFields = requiredFields.filter(
      (field) => !hotelDetails[field]
    );
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // === 2. EMAIL VALIDATION ===
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(hotelDetails.email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // === 3. UNIQUE CHECKS ===
    const [existingHotel, existingAdmin, existingRequest] = await Promise.all([
      Hotel.findOne({ email: hotelDetails.email }),
      Admin.findOne({ email: hotelDetails.email }),
    ]);

    if (existingHotel || existingAdmin || existingRequest) {
      return res.status(409).json({
        message: "Email already exists in system",
        existsIn: existingHotel
          ? "Hotel"
          : existingAdmin
            ? "Admin"
            : "PendingRequests",
      });
    }

    // === 4. HOTEL TYPE VALIDATION ===
    if (hotelDetails.brandedHotel && hotelDetails.chainHotel) {
      return res.status(400).json({
        message: "Cannot be both branded and chain hotel",
      });
    }

    // === 5. CHAIN HOTEL VALIDATION ===
    if (!hotelDetails.brandedHotel && hotelDetails.chainHotel) {
      if (!hotelDetails.parentHotel) {
        return res.status(400).json({
          message: "Parent hotel required for chain hotels",
        });
      }

      const parentExists = await Hotel.exists({
        HotelId: hotelDetails.parentHotel,
      });

      if (!parentExists) {
        return res.status(404).json({
          message: "Parent hotel not found in system",
        });
      }
      hotelDetails.parentHotel = parentExists._id
      
    }
    // // === 6. ROOM VALIDATION ===
    // if (hotelDetails.rooms && hotelDetails.rooms.length > 0) {
    //   const validRoomTypes = [
    //     "Single",
    //     "Double",
    //     "Twin",
    //     "Deluxe",
    //     "Studio Room /Apartments",
    //     "Junior Suits",
    //     "Suite",
    //     "Presidential Suite",
    //     "Connecting Suite",
    //     "Rooms with a View",
    //   ];

    //   for (const [index, room] of hotelDetails.rooms.entries()) {
    //     if (!validRoomTypes.includes(room.roomType)) {
    //       return res.status(400).json({
    //         message: `Invalid roomType at index ${index}: ${room.roomType}`,
    //       });
    //     }
    //   }
    // }

    // === 7. GST VALIDATION ===
    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(hotelDetails.gst)) {
      return res.status(400).json({
        message: "Invalid GST format",
      });
    }

    // === 8. LICENSE VALIDATION ===
    const licenseFields = [
      "hotelLicenseAndCertification",
      "legalAndBusinessLicense",
      "touristLicense",
      "panNumber",
      "dataPrivacyAndGDPRCompliance",
      "gstImage"
    ];

    for (const field of licenseFields) {
      if (!hotelDetails[field]?.imageUrl) {
        return res.status(400).json({
          message: `Missing image URL for ${field}`,
        });
      }
    }

    // === 9. CREATE PENDING REQUEST ===
    const pendingRequest = await PendingHotel.create(
      [
        {
          hotelData: hotelDetails,
          status: "Pending",
        },
      ]
    );


    return res.status(201).json({
      status: true,
      message: "Join request submitted successfully",
      requestId: pendingRequest[0]._id,
    });
  } catch (error) {
    console.error("Request submission error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: Object.values(error.errors).map((e) => e.message),
      });
    }

    return res.status(500).json({
      message: "Error submitting request",
      error: error.message,
    });
  } 
};
exports.getJoinDetailsFromEmail = async (req, res, next) => {
  try {
    const { email } = req.body
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    const isExists = await PendingHotel.findOne({ "hotelData.email": email }).lean()
    if (isExists)
      return res.status(200).json({ success: true, message: 'Submitted Details found!', data: isExists })
    
    return (
      res.
      status(404).json({
        success: true,
        message: "No Details found!",
       })
    );
  } catch (error) {
    return next(error)
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const totalRequests = await PendingHotel.countDocuments({
      status: "Pending",
    });

    const requests = await PendingHotel.find({
      status: { $in: ["Pending", "Rejected"] },
    })
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    return res.json({
      status: "success",
      count: totalRequests,
      requests,
      currentPage: page,
      totalPages: Math.ceil(totalRequests / limit),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching requests",
      error: error.message,
    });
  }
};

exports.getPendingRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await PendingHotel.findById(id)
    if (!request) {
      return res.status(404).json({
        message: 'Request not found'
      })
    }

    return res.json({
      status: "success",
      request,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching requests",
      error: error.message,
    });
  }
};

exports.approveHotelRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { requestId, subscriptionPlan, couponCode, subscriptionStartDate, gstPercentage=18 } =
      req.body;
    
    // 1. Fetch the pending hotel request
    const request = await PendingHotel.findById(requestId).session(session);
    if (!request ) {
      throw new ApiError(404, "Invalid or already approved request");
    }
    
    let hotelData = request.hotelData;
    hotelData.gstPercentage = gstPercentage
    
    const validationError = validateHotelData(hotelData);
    if (validationError) throw validationError;
    // 2. Check for duplicate email
    await checkEmailExists(hotelData.email, session);

    // 3. Validate hotel type and parentHotel logic
    const parentHotelDoc = await validateHotelType(hotelData, session);

    // 4. Validate subscription and coupon
    const { subscription, finalPrice, couponDetails, subscriptionEndDate } =
      await validateSubscription(
        {
          subscriptionPlan,
          subscriptionStartDate,
          couponCode,
          gstPercentage
        },
        session
      );

    const password = generateRandomPassword()
    hotelData.password = password

    // 6. Create admin user
    const admin = await createHotelAdmin(
      hotelData,
      session
    );
    // 7. Create hotel record
    const hotel = await createHotelRecord(
      {
        ...hotelData,
        subscriptionPlan,
        couponDetails,
        subscriptionStartDate,
        gstPercentage
      },
      admin,
      subscription,
      finalPrice,
      parentHotelDoc,
      session,
      subscriptionEndDate
    );

    // 8. Link admin to hotel
    admin.HotelId = hotel._id;
    await admin.save({ session });

    // 9. Update parentHotel with subHotel if needed
    if (parentHotelDoc) {
      await updateParentHotel(parentHotelDoc, hotel, session);
    }

    // 10. Finalize coupon application
    if (couponCode) {
      await finalizeCouponApplication(couponCode, hotel, finalPrice, session);
    }

    // 11. Generate transaction ID
    const transactionId = await generateUniqueId(
      "Transaction",
      "transactionId",
      "TXN"
    );

    // 12. Generate payment link
    const paymentLink = await generatePaymentLink(
      {
        customer_name: hotel.name,
        customer_phone: hotel.phoneNo,
        customer_email: hotel.email,
      },
      finalPrice,
      transactionId
    );

    // 13. Create transaction record
    const transaction = await Transaction.create(
      [
        {
          transactionId,
          transactionType:'SubscriptionPayment',
          hotel: hotel._id,
          subscription: subscription._id,
          amount: finalPrice,
          paymentLink,
          status: "created",
          coupon: couponDetails?.coupon?._id,
          discountAmount: couponDetails?.discountAmount,
          metadata: {
            hotelName: hotel.name,
            subscriptionPlan: subscription.planName,
          },
        },
      ],
      { session }
    ).then((res) => res[0]);

    hotel.subscriptionPaymentStatus = "pending";
    hotel.transaction = transaction._id;
    await hotel.save({ session });

    // 14. Update pending request status
    await PendingHotel.findByIdAndUpdate(
      requestId,
      {
        status: "Approved",
        approvalDate: new Date(),
        reviewedBy: req.user.id,
        subscriptionPlan,
        couponCode,
      },
      { session }
    );

    // 15. Commit transaction
    await session.commitTransaction();

    // 16. Send confirmation email (non-blocking)
    sendConfirmationEmail(
      hotelData,
      hotel,
      couponDetails,
      paymentLink,
      subscription
    );

    // 17. Send success response
    return res.status(201).json({
      success: true,
      message: "Hotel approved and created successfully",
      hotel: formatHotelResponse(hotel),
      loginDetails: {
        email: admin.email,
        password,
      },
      paymentLink,
    });
  } catch (error) {
    console.error("Approval failed:", error);
    await session.abortTransaction();
    return res.status(500).json({
      status: false,
      message: "Approval failed",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};

exports.rejectHotelRequest = async (req, res, next) => {
  try {
    const adminId = req.user._id
    const { requestId, message } = req.body
    const request = await PendingHotel.findByIdAndUpdate(requestId, {
      status: "Rejected",
      reviewedBy: adminId,
      adminNotes: message
    });
    if (!request) {
      throw new ApiError(404, 'Invalid requestId !')
    }
    const hotelData = request.hotelData;
    const email = hotelData.email
    const hotelName = hotelData.name
    sendRejectionEmail(email, hotelName, message)
    
    return res.status(200).json({
      success: 200,
      message: "Hotel Rejected!"
    })
  } catch (error) {
   return next(error)
  }
}

exports.getHotelForGuests = async (req, res) => {
  try {
    const HotelId = req.params.HotelId;
    const hotel = await Hotel.findOne({
      _id: HotelId,
      status: "Active",
    }).select(
      "name email phoneNo city state  address logo HotelId images servingDepartment reviews about"
    ).populate('reviews.givenBy', 'firstName lastName'); // Don't return password
    return res.status(200).json({
      status: true,
      hotel,
    });
  } catch (error) {
    console.error("Error fetching hotels:", error);
    return res.status(500).json({ message: "Error fetching hotels", error });
  }
};

exports.calculateNetPrice = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction()
    const { subscriptionPlan, couponCode, gstPercentage } = req.body;

    const { finalPrice } = await validateSubscription(
      { subscriptionPlan, couponCode, gstPercentage },
      session
    );
    await session.commitTransaction()
    return res.status(200).json({ success: true, message:'Valid Coupon and subscription', netPrice: finalPrice});
    
  } catch (error) {
    console.log(error)
    await session.abortTransaction()
    return next(error)
  }
  finally {
    await session.endSession();
  }
}

exports.getWifiDetails = async (req, res, next) => {
  try {
    const bookingId = req.guest.currentBooking;
    if (!bookingId) {
      return res.status(404).json({
        message:
        'bookingId not found in guest booking!, Check In!'
      })
    }
    const booking = await Bookings.findById(bookingId).select('wifi');
    if (!booking) { 
      return res.status(404).json({
        message: "Invalid bookingID found in guest booking! Check In!",
      });
    }
    return res.status(200).json({message:'wifi Details', wifi: booking.wifi})
    
  } catch (error) {
    return next(error)
  }
}

exports.submitReview = async (req, res, next) => {
  try {
    const bookingId = req.params.bookingId;
    const { review } = req.body
    if (review.length < 3 || review.length > 1000) {
      throw new ApiError(400, 'Invalid Review length! 3 < review < 1000')
    }
    const guest = req.guest
    const booking = await Bookings.findOne({ _id: bookingId, phoneNumber: guest.phoneNumber })
    if (!booking) {
      throw new ApiError(404, 'Invalid booking Id')
    }
    const hotel = await Hotel.findById(booking.HotelId)
    if (!hotel) {
      throw new ApiError(400, "Invalid Request! No Hotel Found!");
    }
    hotel.reviews.push({review, givenBy: guest._id})
    hotel.save()
    return res.status(201).json({success:true, message:'Review Added Successfully.'})
  } catch (error) {
    return next(error)
  }
}

const serviceDepartments = [
  "reception",
  "housekeeping",
  "inroomdining",
  "gym",
  "spa",
  "swimmingpool",
  "conciergeservice",
  "in_room_control",
  "ordermanagement",
  "payment",
  "sos",
  "chat",
];

const dayOfWeekEnum = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
exports.updateServiceAvailability = async (req, res, next) => {
  try {
    const hotelId = req.user.HotelId;
    if (!hotelId) {
      throw new ApiError(403, "HotelId not Found! Access Denied");
    }

    const { serviceAvailability: updates } = req.body;

    // Validate input structure
    if (!Array.isArray(updates)) {
      return res.status(400).json({
        error: "serviceAvailability must be an array",
      });
    }

    // Get current hotel data
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }

    // Create a copy of existing services
    const existingServices = hotel.serviceAvailability || [];

    // Prepare a map for existing services for quick lookup
    const serviceMap = new Map();
    existingServices.forEach((service) => {
      serviceMap.set(service.service, service);
    });
     // Validate and merge updates
    for (const update of updates) {
      if (!update.service || !update.schedules) { 
        return res.status(400).json({
          error: "Each entry must have service and schedules",
        });
      }

      // Validate service name
      if (!serviceDepartments.includes(update.service)) {
        return res.status(400).json({
          error: `Invalid service: ${update.service}`,
        });
      }

      // Validate schedules
      for (const schedule of update.schedules) {
        if (!dayOfWeekEnum.includes(schedule.day)) {
          return res.status(400).json({
            error: `Invalid day: ${schedule.day}`,
          });
        }

        // Validate time format (HH:mm)
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (
          !timeRegex.test(schedule.startTime) ||
          !timeRegex.test(schedule.endTime)
        ) {
          return res.status(400).json({
            error: "Time must be in HH:mm format (24-hour)",
          });
        }

        // Validate time range
        const start = moment(schedule.startTime, "HH:mm");
        const end = moment(schedule.endTime, "HH:mm");

        if (end.isSameOrBefore(start)) {
          return res.status(400).json({
            error: "End time must be after start time",
          });
        }
      }

      // Update existing service or add new one
      if (serviceMap.has(update.service)) {
        // Update schedules for existing service
        const existing = serviceMap.get(update.service);
        existing.schedules = update.schedules;
      } else {
        // Add new service
        existingServices.push(update);
        serviceMap.set(update.service, update);
      }
    }

    // Update hotel with merged services
    hotel.serviceAvailability = existingServices;
    await hotel.save();

    res.json(hotel.serviceAvailability);
  } catch (error) {
   return next(error);
  }
};
exports.getServiceAvailability = async (req, res, next) => {
  try {
    const hotelId = req.user.HotelId;

    const hotel = await Hotel.findById(hotelId)
      .select("serviceAvailability timezone servingDepartment")
      .lean();

    if (!hotel) {
      throw new ApiError(404, "Hotel not found");
    }

    // Set default timezone for India if not specified
    const timezone = hotel.timezone || "Asia/Kolkata";
    const now = new Date();
    const currentDay = moment(now).tz(timezone).format("dddd");
    const currentTime = moment(now).tz(timezone).format("HH:mm");

    const availabilityWithStatus = (hotel.serviceAvailability || []).map(
      (service) => {
        const isActive = service.schedules?.some((schedule) => {
          return (
            schedule.day === currentDay &&
            currentTime >= schedule.startTime &&
            currentTime <= schedule.endTime
          );
        });

        return {
          ...service,
          isActive,
        };
      }
    );

    res.status(200).json({
      success: true,
      data: {
        timezone,
        currentDay,
        currentTime,
        servingDepartments: hotel.servingDepartment || [],
        services: availabilityWithStatus,
      },
    });
  } catch (error) {
   return next(error);
  }
};

exports.getServiceAvailabilityByDepartment = async (req, res, next) => {
  try {
    const hotelId = req.user.HotelId;
    const serviceName = req.params.serviceName; // Get service name from URL parameter

    // Validate service name
    const validServices = [
      "reception",
      "housekeeping",
      "inroomdining",
      "gym",
      "spa",
      "swimmingpool",
      "conciergeservice",
      "in_room_control",
      "ordermanagement",
      "payment",
      "sos",
      "chat",
    ];

    if (!validServices.includes(serviceName)) {
      throw new ApiError(400, "Invalid service department name");
    }

    const hotel = await Hotel.findById(hotelId)
      .select("serviceAvailability timezone")
      .lean();

    if (!hotel) {
      throw new ApiError(404, "Hotel not found");
    }

    // Set default timezone
    const timezone = hotel.timezone || "Asia/Kolkata";
    const now = new Date();
    const currentDay = moment(now).tz(timezone).format("dddd");
    const currentTime = moment(now).tz(timezone).format("HH:mm");

    // Find the specific service
    const service = hotel.serviceAvailability?.find(
      (s) => s.service === serviceName
    );

    if (!service) {
      return res.status(200).json({
        success: true,
        data: {
          service: serviceName,
          schedules: [],
          isActive: false,
          message: "No schedules configured for this service",
        },
      });
    }

    // Calculate active status
    const isActive = service.schedules?.some((schedule) => {
      return (
        schedule.day === currentDay &&
        currentTime >= schedule.startTime &&
        currentTime <= schedule.endTime
      );
    });

    // Prepare response
    const response = {
      ...service,
      isActive,
    };

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
   return next(error);
  }
};


exports.getCheckIn_CheckOutTime = async (req, res, next) => {
  try {
    const HotelId = req.user.HotelId
    const hotel = await Hotel.findById(HotelId)
    const checkInTime = hotel.checkInTime
    const checkOutTime = hotel.checkOutTime
    
    return res.status(200).json({
      success: true,
      checkInTime,
      checkOutTime
    })
  } catch (error) {
    console.log(error)
   return next(error)
  }
}