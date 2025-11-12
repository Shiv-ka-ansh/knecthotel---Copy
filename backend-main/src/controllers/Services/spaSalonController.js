const SpaSalonProduct = require("../../models/services/SpaSalonProduct");
const SpaSalonBooking = require("../../models/services/SpaSalonBooking");
const SpaSalonSlot = require("../../models/services/SpaSalonSlot");
const mongoose = require("mongoose");
const { validateAndApplyCoupon } = require("../../utils/couponUtils");
const ApiError = require("../../utils/ApiError");
const Transaction = require("../../models/Transaction");
const generateUniqueId = require("../../utils/idGenerator");
const { createOrder } = require("../../utils/cashfreeServices");
const Hotel = require("../../models/Hotel");
const Bookings = require("../../models/Bookings");
const { notifyNewServiceRequest } = require("../../service/notificationService");

/* ───────────── Admin: Add / Update SpaSalon Product ───────────── */

exports.addSpaSalonProduct = async (req, res) => {
  try {
    const {
      serviceType,
      productCategory,
      productName,
      price,
      description,
      imageUrl,
      additionalServices = [],
      visibility,
    } = req.body;

    const HotelId = req.user.HotelId;

    const newProduct = new SpaSalonProduct({
      HotelId,
      serviceType,
      productCategory,
      productName,
      price,
      description,
      imageUrl,
      visibility,
      additionalServices,
    });

    await newProduct.save();

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: newProduct,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

exports.updateSpaSalonProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const HotelId = req.user.HotelId;

    const product = await SpaSalonProduct.findOne({ _id: id, HotelId: HotelId });
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    Object.assign(product, updates);
    await product.save();

    return res.json({ success: true, message: "Product updated", data: product });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

/* ───────────── Admin: List Products ───────────── */

exports.getSpaSalonProducts = async (req, res) => {
  try {
    let HotelId
    if (req.user) {
      HotelId = req.user.HotelId;
    } else if (req.query.HotelId) HotelId = req.query.HotelId;
    const { serviceType, productCategory } = req.body;

    const filter = { HotelId };
    if (serviceType) filter.serviceType = serviceType;
    if (productCategory) filter.productCategory = productCategory;
    const products = await SpaSalonProduct.find(filter).sort({
      productCategory: 1,
      productName: 1,
    });
    let productCategories = [];
    if (serviceType && !productCategory) {
      productCategories = await SpaSalonProduct.distinct("productCategory", {
        HotelId,
        serviceType,
      });
    }

    return res.status(200).json({ success: true, productCategories, data: products });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};  

/* ───────────── Guest: Create Booking ───────────── */

exports.createSpaSalonBooking = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const {
      spaSalonProduct,
      slotId, 
      bookingDate,
      description,
      couponCode,
      gst,
      paymentMode = "cashfree",
      additionalGuests = 0,
    } = req.body;

    const guest = req.guest;
    const guestId = req.guest._id;
    const HotelId = req.guest.HotelId;
    if (!HotelId) {
      throw new ApiError(400, "Guest not checked into any hotel");
     }
    // Validate payment mode
    const validPaymentModes = ["cashfree", "cash"];
    if (!validPaymentModes.includes(paymentMode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment mode. Allowed: cashfree, cash",
      });
    }

    if (!spaSalonProduct || !bookingDate || !slotId || !HotelId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Check product belongs to HotelId
    const product = await SpaSalonProduct.findOne({
      _id: spaSalonProduct,
      HotelId,
    }).session(session);
    if (!product) throw new ApiError(404, "Product Not Found!");

    // Fetch slot and validate
    const slot = await SpaSalonSlot.findOne({
      _id: slotId,
      HotelId,
    }).session(session);
    if (!slot) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Slot not found" });
    }
    
    // Validate bookingDate matches slot.dayOfWeek
    const bookingDay = new Date(bookingDate).toLocaleString("en-US", { weekday: "long" });
    if (bookingDay !== slot.dayOfWeek) {
      throw new ApiError(400, `Slot is only available on ${slot.dayOfWeek}, but bookingDate is a ${bookingDay}`);
    }
    const totalGuests = Number(additionalGuests) + 1;
    if (slot.currentCapacity < totalGuests) {
      throw new ApiError(409, `Only ${slot.currentCapacity} slots available`);
    }
    
    // Atomically decrement capacity
    const updated = await SpaSalonSlot.findOneAndUpdate(
      {
          _id: slotId,
          HotelId,
      },
          { $inc: { "slots.$.currentCapacity": -totalGuests } }
        ).session(session);
    
        if (!updated) {
          throw new ApiError(400, "Slot no longer available");
    }
    const subtotal = product.price * totalGuests;
    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const context = {
        applicableFor: "guest_purchase",
        userId: guestId,
        userModel: "Guest",
        hotelId: HotelId,
        amount: subtotal,
      };

      const result = await validateAndApplyCoupon(
        couponCode,
        context,
        true,
        session
      );

      if (!result.valid) {
        await SpaSalonSlot.findOneAndUpdate(
          {
            _id: slotId,
            HotelId,
          },
          { $inc: { "slots.$.currentCapacity": totalGuests } }
        ).session(session);
        await session.abortTransaction();
        return res
          .status(400)
          .json({ success: false, message: result.message });
      }

      appliedCoupon = result.coupon;

      if (appliedCoupon.discountType === "fixed") {
        discount = appliedCoupon.value;
      } else if (appliedCoupon.discountType === "percentage") {
        discount = (appliedCoupon.value / 100) * subtotal;
      }
    }

    let finalAmount = subtotal - discount;
    let gstAmount = 0;
    if (gst) {
      gstAmount = (finalAmount * gst) / 100;
      finalAmount += gstAmount;
    }

    // Create booking with full slot object
    const serviceRequest = new SpaSalonBooking({
      guest: guestId,
      HotelId,
      spaSalonProduct,
      slot: {
        _id: slot._id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        price: slot.price,
        maxCapacity: slot.maxCapacity,
        currentCapacity: slot.currentCapacity - totalGuests,
      },
      bookingDate,
      bookingTime: slot.startTime,
      description,
      status: "pending",
      serviceType: "SpaSalonBooking",
      amount: {
        subtotal,
        gstAmount,
        discount,
        finalAmount,
      },
      paymentMode: paymentMode === "cash" ? "pay-later" : "cashfree",
      paymentStatus:paymentMode === "cash"?"pay-later":"pending",
      coupon: appliedCoupon
        ? {
            code: appliedCoupon.code,
            type: appliedCoupon.discountType,
            value: appliedCoupon.value,
          }
        : undefined,
      gst
    });

    await serviceRequest.save({ session });

    let paymentResponse = null;
    let transactionId = await generateUniqueId(
      "Transaction",
      "transactionId",
      "TXO"
    );
    let activeRoomBooking = null;

    if (paymentMode === "cashfree") {
      // Cashfree payment flow
      paymentResponse = await createOrder(transactionId, finalAmount, HotelId, {
        customer_id: req.guest._id,
        customer_name: guest.firstName,
        customer_email: guest?.email,
        customer_phone: guest.phoneNumber,
      });

      
    } else {
      // Cash payment flow
      activeRoomBooking = await Bookings.findById(guest.currentBooking).session(
        session
      );

      if (!activeRoomBooking) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "No active room booking found for cash payment",
        });
      }

      // Update due amount and add service
      activeRoomBooking.serviceDue = (activeRoomBooking.serviceDue || 0) + finalAmount;
      activeRoomBooking.services.push({
        amount: finalAmount,
        serviceRequestId: serviceRequest._id,
      });

      await activeRoomBooking.save({ session });

      transactionId = await generateUniqueId(
        "Transaction",
        "transactionId",
        "TXC"
      );
    }

    // Create transaction record
    const transaction = new Transaction({
      transactionId,
      transactionType: 'ServicePayment',
      hotel: HotelId,
      guest: req.guest._id,
      subscription: null,
      amount: finalAmount,
      status: paymentMode === "cashfree" ? "created" : "pending",
      paymentGateway: paymentMode,
      paymentLink:
        paymentMode === "cashfree"
          ? paymentResponse?.data?.payment_session_id
          : undefined,
      coupon: appliedCoupon,
      discountAmount: discount,
      serviceRequestId: serviceRequest._id,
      metadata: {},
      gatewayResponse:
        paymentMode === "cashfree" ? paymentResponse?.data : null,
    });

    await transaction.save({ session });
    serviceRequest.transaction = transaction._id;
    await serviceRequest.save({ session });

    await session.commitTransaction();
    notifyNewServiceRequest(serviceRequest);

    // Prepare response
    const responseData = {
      success: true,
      message: "Booking created",
      data: serviceRequest,
    };

    // Add payment session ID only for cashfree
    if (paymentMode === "cashfree") {
      responseData.payment_session_id = paymentResponse.payment_session_id;
    }

    return res.status(201).json(responseData);
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    console.error(error);
    return res.status(error.statusCode ? error.statusCode : 500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong",
    });
  } finally {
    session.endSession();
  }
};

/* ───────────── List / Get Booking by ID ───────────── */

exports.getSpaSalonBookings = async (req, res) => {
  try {
    const HotelId = req.user ? req.user.HotelId : null;
    const guestId = req.guest ? req.guest._id : null;

    const filter = {};
    if (HotelId) filter.HotelId = HotelId;
    if (guestId) filter.guest = guestId;
    if (req.query.status) filter.status = req.query.status;

    const bookings = await SpaSalonBooking.find(filter)
      .populate("guest", "firstName lastName email phoneNumber")
      .populate("assignedTo", "firstName lastName mobileNumber")
      .populate("spaSalonProduct")
      .sort({ requestTime: -1 });

    return res.json({ success: true, data: bookings });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

exports.getSpaSalonBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await SpaSalonBooking.findById(id)
      .populate("guest", "firstName lastName email phoneNumber")
      .populate("assignedTo", "firstName lastName mobileNumber")
      .populate("spaSalonProduct");

    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    // Restrict guests to their own bookings only
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

/* ───────────── Update Booking ───────────── */

exports.updateSpaSalonBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const booking = await SpaSalonBooking.findById(id);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

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
