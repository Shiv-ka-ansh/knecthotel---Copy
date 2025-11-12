const FacilityItem = require("../../models/services/FacilityItem");
const FacilityRequest = require("../../models/services/FacilityRequest");
const mongoose = require('mongoose');
const { createOrder } = require("../../utils/cashfreeServices");
const Guest = require("../../models/Guest");
const Transaction = require("../../models/Transaction");
const generateUniqueId = require("../../utils/idGenerator");
const Bookings = require("../../models/Bookings");
const { notifyNewServiceRequest } = require("../../service/notificationService");
const ApiError = require("../../utils/ApiError");
const { validateAndApplyCoupon } = require("../../utils/couponUtils");
/* ──────────── Add Facility (Enforce one per type) ──────────── */
exports.addFacilityService = async (req, res) => {
  try {
    const { facilityType, name, images = [], slots = [] } = req.body;

    // Check if facility type already exists for this hotel
    const existing = await FacilityItem.findOne({
      HotelId: req.user.HotelId,
      facilityType,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `${facilityType} already exists for this hotel`,
      });
    }

    // Process slots to set currentCapacity to maxCapacity
    const processedSlots = slots.map((slot) => ({
      ...slot,
      currentCapacity: slot.maxCapacity,
    }));

    // Validate maxCapacity for all slots
    if (processedSlots.some((s) => !s.maxCapacity || s.maxCapacity <= 0)) {
      return res.status(400).json({
        success: false,
        message: "Each slot must have a positive maxCapacity",
      });
    }

    const item = await FacilityItem.create({
      facilityType,
      name,
      images,
      slots: processedSlots,
      HotelId: req.user.HotelId,
    });

    return res.status(201).json({
      success: true,
      message: "Facility added",
      data: item,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Facility type already exists for this hotel",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

/* ──────────── Create Facility Request (Store full slot) ──────────── */
exports.createFacilityRequest = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const {
      facilityType,
      slotId,
      requestDetail,
      gst,
      couponCode = null,
      paymentMode = "cashfree",
      additionalGuests = 0,
      bookingDate
    } = req.body;
    const guest = req.guest;
    const guestId = req.guest._id;
    const HotelId = req.guest.HotelId; // Always use from req.guest
    if (!HotelId) {
      throw new ApiError(400, "Guest not checked into any hotel");
    }
    // Validate payment mode
    const validPaymentModes = ["cashfree", "cash"];
    if (!validPaymentModes.includes(paymentMode)) {
      throw new ApiError(400, "Invalid payment mode. Allowed: cashfree, cash");
    }

    // Find facility and slot
    const facility = await FacilityItem.findOne({
      facilityType,
      HotelId,
    }).session(session);

    if (!facility) {
      throw new ApiError(404, "Facility or slot not found");
    }

    const slot = facility.slots.id(slotId);
    if (!slot) {
      throw new ApiError(404, "Slot not found");
    }

    // Validate bookingDate matches slot.dayOfWeek
    if (!bookingDate) {
      throw new ApiError(400, "bookingDate is required");
    }
    const bookingDay = new Date(bookingDate).toLocaleString("en-US", { weekday: "long" });
    if (bookingDay !== slot.dayOfWeek) {
      throw new ApiError(400, `Slot is only available on ${slot.dayOfWeek}, but bookingDate is a ${bookingDay}`);
    }

    // Calculate total guests
    const totalGuests = Number(additionalGuests) + 1;

    // Check capacity
    if (slot.currentCapacity < totalGuests) {
      throw new ApiError(409, `Only ${slot.currentCapacity} slots available`);
    }

    // Atomically decrement capacity
    const updated = await FacilityItem.findOneAndUpdate(
      {
        facilityType,
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

    // Coupon logic (similar to swimming pool)
    if (couponCode) {
      const context = {
        applicableFor: "guest_purchase",
        userId: req.guest._id,
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
        await FacilityItem.findOneAndUpdate(
          {
            facilityType,
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
    let gstAmount;
    let finalAmount = Math.max(subtotal - discount, 0);
    if (gst) {
      gstAmount = (finalAmount * gst) / 100;
      finalAmount += gstAmount;
    }

    // Create request with FULL slot data
    const serviceRequest = new FacilityRequest({
      facilityType: facility.facilityType,
      facility: facility._id,
      slot: {
        _id: slot._id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        price: slot.price,
        maxCapacity: slot.maxCapacity,
        currentCapacity: slot.currentCapacity - totalGuests,
      },
      guest: guestId,
      requestDetail,
      status: "pending",
      serviceType: "FacilityRequest",
      HotelId,
      paymentMode: paymentMode === "cash" ? "pay-later" : "cashfree",
      paymentStatus:paymentMode === "cash"?"pay-later":"pending",
      bookingDate: new Date(bookingDate),
      additionalGuests: Number(additionalGuests),
      amount: {
        subtotal,
        gstAmount,
        discount,
        finalAmount,
      },
      coupon: appliedCoupon
        ? {
            code: appliedCoupon.code,
            type: appliedCoupon.discountType,
            value: appliedCoupon.value,
          }
        : undefined,
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
        customer_id: req.guest._id,
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
      transactionType:'ServicePayment',
      hotel: HotelId,
      guest: req.guest._id,
      subscription: null,
      amount: finalAmount,
      status: paymentMode === "cashfree" ? "created" : "pending",
      paymentMode: paymentMode === "cash" ? "pay-later" : "cashfree",
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

    await notifyNewServiceRequest(serviceRequest);

    // Prepare response
    const responseData = {
      success: true,
      message: "Facility request created",
      data: serviceRequest,
    };

    // Add payment session ID only for cashfree
    if (paymentMode === "cashfree") {
      responseData.payment_session_id = paymentResponse.payment_session_id;
    }
    await session.commitTransaction();

    return res.status(201).json(responseData);
  } catch (error) {
    console.error(error);

    await session.abortTransaction();
    console.error(error);
    next(error instanceof ApiError ? error : new ApiError(500, error.message || "Something went wrong"));
  } finally {
    session.endSession();
  }
};

/* ──────────── Get All Facility Items (for hotel staff) ──────────── */
exports.getAllFacilityItems = async (req, res) => {
  try {
    const query = {};

    // Filter by HotelId
    if (req.user?.HotelId) {
      query.HotelId = req.user.HotelId;
    } else {
      query.HotelId = req.query.HotelId;
    }

    // Filter by facility type
    if (req.query.facilityType) {
      query.facilityType = req.query.facilityType;
    }

    // Pagination
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.max(1, parseInt(req.query.limit || "20", 10));
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      FacilityItem.countDocuments(query),
      FacilityItem.find(query).sort({ _id: -1 }).skip(skip).limit(limit),
    ]);

    // Group slots by dayOfWeek for each facility
    const groupedItems = items.map(item => {
      const slotsByDay = {};
      
      item.slots.forEach(slot => {
        const day = slot.dayOfWeek;
        if (!slotsByDay[day]) {
          slotsByDay[day] = [];
        }
        slotsByDay[day].push(slot);
      });
      
      return {
        ...item.toObject(),
        slotsByDay
      };
    });

    return res.json({
      success: true,
      page,
      pages: Math.ceil(total / limit),
      total,
      data: groupedItems,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};



/* ──────────── Get All Facility Requests ──────────── */
exports.getAllFacilityRequests = async (req, res) => {
  try {
    const query = {};
    if (req.guest) query.guest = req.guest._id;
    if (req.user?.HotelId) query.HotelId = req.user.HotelId;
    if (req.query.status) query.status = req.query.status;
    if (req.query.facilityType) query.facilityType = req.query.facilityType;
    if (req.query.guest) query.guest = req.query.guest;

    // Pagination
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.max(1, parseInt(req.query.limit || "20", 10));
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      FacilityRequest.countDocuments(query),
      FacilityRequest.find(query)
        .sort({ requestTime: -1 })
        .skip(skip)
        .limit(limit)
        .populate("guest", "firstName lastName email phoneNumber")
        .populate("assignedTo", "firstName lastName mobileNumber"),
    ]);

    return res.json({
      success: true,
      page,
      pages: Math.ceil(total / limit),
      total,
      data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

;exports.getFacilityRequestById = async (req, res) => {
  try {
    const { id } = req.params
    const data = await FacilityRequest.findById(id)
      .populate("guest", "firstName lastName phoneNumber")
      .populate("assignedTo", "firstName lastName mobileNumber ");

    if (!data) {
      return res.status(404).json({
        success: false,
        message:'Request Not Found!'
      })
    }
    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

/* ──────────── Update Facility Slot (Hotel Admin) ──────────── */
exports.updateFacilitySlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { slots: updatedSlots } = req.body;

    // Validate input
    if (!Array.isArray(updatedSlots)) {
      return res.status(400).json({
        success: false,
        message: "Slots must be provided as an array",
      });
    }
    
    console.log(id)
    console.log(req.user.HotelId)

    // Find facility and verify ownership
    const facility = await FacilityItem.findOne({
      _id: id,
      HotelId: req.user.HotelId,
    });

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: "Facility not found or access denied",
      });
    }

    // Create maps for existing slots
    const existingSlotMap = new Map();
    facility.slots.forEach((slot) => {
      existingSlotMap.set(slot._id.toString(), slot);
    });

    // Process each updated slot
    const slotsToAdd = [];
    const validationErrors = [];

    for (const slotData of updatedSlots) {
      // Existing slot (has _id)
      if (slotData._id) {
        const existingSlot = existingSlotMap.get(slotData._id.toString());

        if (!existingSlot) {
          validationErrors.push(`Slot ID ${slotData._id} not found`);
          continue;
        }

        // Handle capacity changes
        if (slotData.maxCapacity !== undefined) {
          const newMax = Number(slotData.maxCapacity);
          const currentBooked =
            existingSlot.maxCapacity - existingSlot.currentCapacity;

          if (newMax < currentBooked) {
            validationErrors.push(
              `Slot ${slotData._id}: Capacity cannot be less than ${currentBooked}`
            );
            continue;
          }

          existingSlot.maxCapacity = newMax;
          existingSlot.currentCapacity = newMax - currentBooked;
        }

        // Update other fields
        const allowedUpdates = ["dayOfWeek", "startTime", "endTime", "price"];
        allowedUpdates.forEach((field) => {
          if (slotData[field] !== undefined) {
            existingSlot[field] = slotData[field];
          }
        });
      }
      // New slot (no _id)
      else {
        // Validate new slot
        const requiredFields = [
          "dayOfWeek",
          "startTime",
          "endTime",
          "maxCapacity",
        ];
        const missingFields = requiredFields.filter(
          (field) => !slotData[field]
        );

        if (missingFields.length > 0) {
          validationErrors.push(
            `New slot missing: ${missingFields.join(", ")}`
          );
          continue;
        }

        // Add new slot
        slotsToAdd.push({
          ...slotData,
          currentCapacity: slotData.maxCapacity,
        });
      }
    }

    // Handle validation errors
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: validationErrors,
      });
    }

    // Add new slots
    if (slotsToAdd.length > 0) {
      facility.slots.push(...slotsToAdd);
    }

    // Save changes
    await facility.save();

    return res.json({
      success: true,
      message: "Slots updated successfully",
      data: facility,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

/* ──────────── Get Available Facilities (for guests) ──────────── */
exports.getAvailableFacilities = async (req, res) => {
  try {
    const { HotelId, facilityType } = req.query;

    if (!HotelId) {
      return res.status(400).json({
        success: false,
        message: "HotelId is required",
      });
    }

    const matchStage = { HotelId: new mongoose.Types.ObjectId(HotelId) };
    if (facilityType) matchStage.facilityType = facilityType;

    const facilities = await FacilityItem.aggregate([
      { $match: matchStage },
      { $unwind: "$slots" },
      { $match: { "slots.currentCapacity": { $gt: 0 } } },
      {
        $group: {
          _id: {
            facilityId: "$_id",
            dayOfWeek: "$slots.dayOfWeek",
          },
          // keep facility details
          facilityDoc: { $first: "$$ROOT" },
          slots: { $push: "$slots" },
        },
      },
      {
        $group: {
          _id: "$facilityDoc.facilityType",
          facilities: {
            $push: {
              id: "$_id.facilityId",
              details: {
                facilityType: "$facilityDoc.facilityType",
                name: "$facilityDoc.name",
                images: "$facilityDoc.images",
              },
              days: {
                $arrayToObject: [
                  [{ k: "$_id.dayOfWeek", v: "$slots" }],
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          facilityType: "$_id",
          facilities: 1,
        },
      },
    ]);

    // restructure into desired format
    const groupedResult = {};
    facilities.forEach(group => {
      const facilityType = group.facilityType;
      groupedResult[facilityType] = {};

      group.facilities.forEach(facility => {
        // Attach full details once
        if (!groupedResult[facilityType].details) {
          groupedResult[facilityType].details = facility.details;
        }

        // Merge slots by day
        Object.entries(facility.days).forEach(([day, slots]) => {
          if (!groupedResult[facilityType][day]) {
            groupedResult[facilityType][day] = [];
          }
          groupedResult[facilityType][day].push(...slots);
        });
      });
    });

    return res.json({ success: true, data: groupedResult });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

/* ──────────── Get Single Facility Item ──────────── */
exports.getFacilityItem = async (req, res) => {
  try {
    const { id } = req.params;
    const facility = await FacilityItem.findById(id);

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: "Facility not found",
      });
    }

    // Verify ownership for hotel admins
    if (
      req.user?.scope === "Hotel" &&
      !facility.HotelId.equals(req.user.HotelId)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    return res.json({
      success: true,
      data: facility,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

/* ──────────── Update Facility Item (Hotel Admin) ──────────── */
exports.updateFacilityItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const facility = await FacilityItem.findOne({
      _id: id,
      HotelId: req.user.HotelId,
    });

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: "Facility not found",
      });
    }

    // Prevent changing facility type
    if (
      updateData.facilityType &&
      updateData.facilityType !== facility.facilityType
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot change facility type",
      });
    }

    // Update allowed fields
    const allowedUpdates = ["name", "images"];
    allowedUpdates.forEach((field) => {
      if (updateData[field] !== undefined) {
        facility[field] = updateData[field];
      }
    });

    await facility.save();

    return res.json({
      success: true,
      message: "Facility updated",
      data: facility,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

/* ──────────── Delete Slot (Hotel Admin) ──────────── */
exports.deleteFacilitySlot = async (req, res) => {
  try {
    const { facilityId, slotId } = req.params;

    const facility = await FacilityItem.findOne({
      _id: facilityId,
      HotelId: req.user.HotelId,
    });

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: "Facility not found",
      });
    }

    const slot = facility.slots.id(slotId);
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Slot not found",
      });
    }

    // Check if slot has active bookings
    // const activeRequests = await FacilityRequest.countDocuments({
    //   facility: facilityId,
    //   "slot._id": slotId,
    //   status: { $in: ["pending", "accepted"] },
    // });

    // if (activeRequests > 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Cannot delete slot with active bookings",
    //   });
    // }

    // Remove the slot
    facility.slots.pull(slotId);
    await facility.save();

    return res.json({
      success: true,
      message: "Slot deleted",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};