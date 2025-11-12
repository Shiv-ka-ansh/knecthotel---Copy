const SwimmingPoolRate = require("../../models/services/SwimmingPoolRate");
const SwimmingPoolBooking = require("../../models/services/SwimmingPoolBooking");
const ServiceRequest = require("../../models/services/ServiceRequest");
const { default: mongoose } = require("mongoose");
const { validateAndApplyCoupon } = require("../../utils/couponUtils");
const { createOrder } = require("../../utils/cashfreeServices");
const generateUniqueId = require("../../utils/idGenerator");
const Transaction = require("../../models/Transaction");
const Bookings = require("../../models/Bookings");
const { notifyNewServiceRequest } = require("../../service/notificationService");
const SwimmingPoolSlots = require("../../models/services/SwimmingPoolSlots");
const ApiError = require("../../utils/ApiError");

/* ────────── Admin: Set / Update hotel price per slot ────────── */
exports.setSwimmingPoolRate = async (req, res) => {
  try {
    const { pricePerSlot } = req.body;
    const hotelId = req.user.HotelId;

    if (!pricePerSlot || pricePerSlot <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Valid pricePerSlot is required" });
    }

    const updated = await SwimmingPoolRate.findOneAndUpdate(
      { HotelId: hotelId },
      { pricePerSlot },
      { new: true, upsert: true }
    );

    return res.json({
      success: true,
      message: "Swimming pool rate updated",
      data: updated,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

/* ────────── Guest: Get available slots for a date ────────── */
// returns array of {startTime, endTime, price, available: bool}
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date, hotelId } = req.query; // e.g. '2025-05-21'

    if (!date) {
      return res
        .status(400)
        .json({
          success: false,
          message: "date query param is required (YYYY-MM-DD)",
        });
    }

    const rate = await SwimmingPoolRate.findOne({ HotelId: hotelId });
    if (!rate) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Swimming pool rates not set for this hotel",
        });
    }

    // Generate time slots between startTime and endTime every slotDurationMinutes
    const slots = [];
    const start = rate.startTime;
    const end = rate.endTime;
    const duration = rate.slotDurationMinutes;

    // Helper: convert 'HH:mm' to minutes
    function toMinutes(t) {
      const [hh, mm] = t.split(":").map(Number);
      return hh * 60 + mm;
    }

    // Helper: convert minutes back to 'HH:mm'
    function toHHmm(m) {
      const hh = String(Math.floor(m / 60)).padStart(2, "0");
      const mm = String(m % 60).padStart(2, "0");
      return `${hh}:${mm}`;
    }

    const startMins = toMinutes(start);
    const endMins = toMinutes(end);

    for (let t = startMins; t + duration <= endMins; t += duration) {
      slots.push({ startTime: toHHmm(t), endTime: toHHmm(t + duration) });
    }

    // Fetch bookings for the date
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    const bookings = await SwimmingPoolBooking.find({
      HotelId: hotelId,
      bookingDate: { $gte: dateStart, $lte: dateEnd },
      status: { $ne: "cancelled" }, // exclude cancelled bookings
    });

    // Mark each slot as available or not
    const availableSlots = slots.map((slot) => {
      const conflict = bookings.some(
        (b) => b.startTime === slot.startTime && b.endTime === slot.endTime
      );
      return {
        ...slot,
        price: rate.pricePerSlot,
        available: !conflict,
      };
    });

    return res.json({ success: true, date, slots: availableSlots });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

/* ────────── Guest: Book a slot ────────── */
exports.createSwimmingPoolBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const {
      slotId,
      requestDetail,
      couponCode = null,
      gst,
      paymentMode = "cashfree",
      additionalGuests = 0,
      bookingDate
    } = req.body;

    const guest = req.guest;
    const guestId = req.guest._id;
    const HotelId = req.guest.HotelId;

    // Validate payment mode
    const validPaymentModes = ["cashfree", "cash"];
    if (!validPaymentModes.includes(paymentMode)) {
      throw new ApiError(400, "Invalid payment mode. Allowed: cashfree, cash");
    }

    // Validate required fields
    if (!slotId || !bookingDate) {
      throw new ApiError(400, "slotId and bookingDate are required");
    }

    // Find pool details and slot
    const poolDetails = await SwimmingPoolSlots.findOne({ HotelId }).session(session);
    if (!poolDetails) {
      throw new ApiError(404, "Swimming pool details not found for this hotel");
    }
    const slot = poolDetails.slots.id(slotId);
    if (!slot) {
      throw new ApiError(404, "Slot not found");
    }

    // Validate bookingDate matches slot.dayOfWeek
    const bookingDay = new Date(bookingDate).toLocaleString("en-US", { weekday: "long" });
    if (bookingDay !== slot.dayOfWeek) {
      throw new ApiError(400, `Slot is only available on ${slot.dayOfWeek}, but bookingDate is a ${bookingDay}`);
    }
    
    // Calculate total guests
    const totalGuests = Number(additionalGuests) + 1;
    const conflictingBooking = await SwimmingPoolBooking.findOne({
      HotelId,
      "slot._id": slotId,
      bookingDate: { $gte: new Date(bookingDate).setHours(0,0,0,0), $lte: new Date(bookingDate).setHours(23,59,59,999) },
      status: { $ne: "cancelled" },
    }).session(session);

    if (conflictingBooking) {
      return res.status(409).json({
        success: false,
        message: "Slot already booked",
      });
    }
    // Check capacity
    if (slot.currentCapacity < totalGuests) {
      throw new ApiError(409, `Only ${slot.currentCapacity} slots available`);
    }

    // Atomically decrement capacity
    const updated = await SwimmingPoolSlots.findOneAndUpdate(
      {
        HotelId,
        "slots._id": slotId,
        "slots.currentCapacity": { $gte: totalGuests },
      },
      { $inc: { "slots.$.currentCapacity": -totalGuests } }
    ).session(session);

    if (!updated) {
      throw new ApiError(400, "Slot no longer available");
    }

    // Calculate subtotal based on total guests
    let subtotal = slot.price * totalGuests;
    let discount = 0;
    let appliedCoupon = null;

    // Coupon logic
    if (couponCode) {
      const context = {
        applicableFor: "guest_purchase",
        userId: guestId,
        userModel: "Guest",
        hotelId: HotelId,
        amount: subtotal,
      };

      const couponResult = await validateAndApplyCoupon(
        couponCode,
        context,
        true,
        session
      );

      if (!couponResult.valid) {
        // Rollback capacity decrement
        await SwimmingPoolSlots.findOneAndUpdate(
          {
            HotelId,
            "slots._id": slotId,
          },
          { $inc: { "slots.$.currentCapacity": totalGuests } }
        ).session(session);
        await session.abortTransaction();
        throw new ApiError(400, couponResult.message);
      }

      appliedCoupon = couponResult.coupon;

      if (appliedCoupon.discountType === "fixed") {
        discount = appliedCoupon.value;
      } else if (appliedCoupon.discountType === "percentage") {
        discount = (appliedCoupon.value / 100) * subtotal;
      }
    }

    let finalAmount = Math.max(subtotal - discount, 0);
    let gstAmount = 0;
    if (gst) {
      gstAmount = (finalAmount * gst) / 100;
      finalAmount += gstAmount;
    }

    // Store full slot object in booking
    const serviceRequest = new SwimmingPoolBooking({
      guest: guestId,
      bookingDate: new Date(bookingDate),
      startTime: slot.startTime,
      endTime: slot.endTime,
      requestDetail,
      status: "pending",
      serviceType: "SwimmingPoolBooking",
      HotelId,
      paymentMode: paymentMode === "cash" ? "pay-later" : "cashfree",
      paymentStatus:paymentMode === "cash"?"pay-later":"pending",
      amount: {
        subtotal,
        discount,
        gstAmount,
        finalAmount,
      },
      coupon: appliedCoupon
        ? {
            code: appliedCoupon.code,
            type: appliedCoupon.discountType,
            value: appliedCoupon.value,
          }
        : undefined,
      slot: {
        _id: slot._id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        price: slot.price,
        maxCapacity: slot.maxCapacity,
        currentCapacity: slot.currentCapacity - totalGuests,
      },
      additionalGuests: Number(additionalGuests),
      gst,
    });

    await serviceRequest.save({ session });

    let paymentResponse = null;
    let transactionId = await generateUniqueId(
      "Transaction",
      "transactionId",
      "TXO"
    );
    let activeRoomBooking = null;

    // Payment processing based on mode
    if (paymentMode === "cashfree") {
      paymentResponse = await createOrder(transactionId, finalAmount, HotelId, {
        customer_id: guestId,
        customer_name: guest.firstName,
        customer_email: guest?.email,
        customer_phone: guest.phoneNumber,
      });

    } else {
      // Cash payment flow - Get active booking from guest's currentBooking reference
      activeRoomBooking = await Bookings.findById(guest.currentBooking).session(
        session
      );
      if (!activeRoomBooking) {
        await session.abortTransaction();
        throw new ApiError(400, "No active room booking found for cash payment");
      }

      // Update due amount on room booking
      activeRoomBooking.serviceDue = (activeRoomBooking.serviceDue || 0) + finalAmount;
      activeRoomBooking.services.push({
         amount: finalAmount,
         serviceRequestId: serviceRequest._id,
       });
      await activeRoomBooking.save({ session });
    }

    // Create transaction record
    const transaction = new Transaction({
      transactionId,
      transactionType: 'ServicePayment',
      hotel: HotelId,
      guest: guestId,
      subscription: null,
      amount: finalAmount,
      paymentMode: paymentMode === "cash" ? "pay-later" : "cashfree",
      status: paymentMode === "cashfree" ? "created" : "pending",
      paymentGateway: paymentMode,
      paymentLink:
        paymentMode === "cashfree"
          ? paymentResponse?.data?.payment_session_id
          : undefined,
      serviceRequestId: serviceRequest._id,
      metadata: {
        bookingDate: new Date(bookingDate),
        startTime: slot.startTime,
        endTime: slot.endTime,
      },
      gatewayResponse: paymentMode === "cashfree" ? paymentResponse?.data : null,
      coupon: appliedCoupon,
      discountAmount: discount,
    });

    await transaction.save({ session });
    serviceRequest.transaction = transaction._id;
    await serviceRequest.save({ session });

    await session.commitTransaction();
    await notifyNewServiceRequest(serviceRequest);

    // Prepare response
    const responseData = {
      success: true,
      message: "Swimming pool slot booked",
      data: serviceRequest,
    };

    // Add payment session ID only for cashfree
    if (paymentMode === "cashfree") {
      responseData.payment_session_id = paymentResponse.payment_session_id;
    }

    return res.status(201).json(responseData);
  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    next(error instanceof ApiError ? error : new ApiError(500, error.message || "Something went wrong"));
  } finally {
    session.endSession();
  }
};

/* ────────── List / Get / Update ────────── */
// Similar to previous modules

exports.getAllSwimmingPoolBookings = async (req, res) => {
  try {
    const query = {};
    if (req.guest) query.guest = req.guest._id;
    if (req.user?.HotelId) query.HotelId = req.user.HotelId;

    if (req.query.status) query.status = req.query.status;
    if (req.query.guest) query.guest = req.query.guest;

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.max(1, parseInt(req.query.limit || "20", 10));
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      SwimmingPoolBooking.countDocuments(query),
      SwimmingPoolBooking.find(query)
        .populate("assignedTo", "firstName lastName mobileNumber")
        .populate("guest", "firstName lastName email phoneNumber")
        .sort({ requestTime: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    return res.json({
      success: true,
      page,
      pages: Math.ceil(total / limit),
      total,
      data,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

exports.getSwimmingPoolBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await SwimmingPoolBooking.findOne({
      $or: [{ _id: id }, { id }],
    })
      .populate("assignedTo", "firstName lastName mobileNumber")
      .populate("guest", "firstName lastName email phoneNumber");

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (
      req.guest &&
      booking.guest._id.toString() !== req.guest._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    return res.json({ success: true, data: booking });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

exports.updateSwimmingPoolBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const booking = await SwimmingPoolBooking.findOne({
      $or: [{ _id: id }, { id }],
    });

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (req.guest && booking.guest.toString() !== req.guest._id.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    Object.assign(booking, updates);
    await booking.save();

    return res.json({ success: true, message: "Booking updated", data: booking });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};
