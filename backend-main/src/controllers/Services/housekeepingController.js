// Import required models and dependencies
const mongoose = require("mongoose");
const HousekeepingItem = require("../../models/services/HousekeepingItem");
const HousekeepingRequest = require("../../models/services/HousekeepingRequest");
const ServiceRequest = require("../../models/services/ServiceRequest");
const Admin = require("../../models/SuperAdmin/Admin");
const { validateAndApplyCoupon } = require("../../utils/couponUtils");
const { groupItemsByServiceType } = require("../../utils/servicesHelper");
const ApiError = require("../../utils/ApiError");
const Transaction = require("../../models/Transaction");
const { createOrder } = require("../../utils/cashfreeServices");
const generateUniqueId = require("../../utils/idGenerator");
const Bookings = require("../../models/Bookings");
const { notifyNewServiceRequest } = require("../../service/notificationService");
// 1. Controller to Add Housekeeping Services (Laundry/Toiletries Items)
exports.addHousekeepingService = async (req, res) => {
  try {
    const { serviceType, name, imageUrl, category, price, visibility } = req.body;

    // Validate service type and category combination
    const validCategories = {
      Toiletries: ["Bathroom Essentials", "Laboratory Essentials"],
      Laundry: ["Men", "Women", "Kids", "Other"],
    };

    if (!validCategories[serviceType].includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category for selected service type",
      });
    }

    const newItem = new HousekeepingItem({
      serviceType,
      name,
      imageUrl,
      category,
      price,
      visibility,
      HotelId: req.user.HotelId,
    });

    await newItem.save();

    return res.status(201).json({
      success: true,
      message: "Service item added successfully",
      data: newItem,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while adding service item",
      error: error.message,
    });
  }
};

// controllers/housekeepingController.js
exports.updateHousekeepingService = async (req, res) => {
  try {
    const { itemId } = req.params;                       // e.g. /items/:itemId
    const { serviceType, name, imageUrl, category, price, visibility } = req.body;

    // ---- 1. Validate serviceType ↔ category combo --------------------------
    const validCategories = {
      Toiletries: ["Bathroom Essentials", "Laboratory Essentials"],
      Laundry: ["Men", "Women", "Kids", "Other"],
    };

    if (serviceType && category) {
      if (!validCategories[serviceType]?.includes(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category for selected service type",
        });
      }
    }

    // ---- 2. Fetch item & verify hotel ownership ----------------------------
    const item = await HousekeepingItem.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Service item not found",
      });
    }
    if (item.HotelId.toString() !== req.user.HotelId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this item",
      });
    }

    // ---- 3. Apply updates ---------------------------------------------------
    if (serviceType) item.serviceType = serviceType;
    if (name)        item.name        = name;
    if (imageUrl) item.imageUrl = imageUrl;
    if (category)    item.category    = category;
    if (price !== undefined) item.price = price;
    item.visibility = visibility
    await item.save();

    // ---- 4. Respond ---------------------------------------------------------
    return res.status(200).json({
      success: true,
      message: "Service item updated successfully",
      data: item,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while updating service item",
      error: error.message,
    });
  }
};

exports.calculatePrice = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { requestType, items, requestDetail, couponCode, HotelId, gst } = req.body;

    const requiresItems = ["Toiletries", "Laundry"].includes(requestType);

    if (requiresItems && (!items || items.length === 0)) {
      return res.status(400).json({
        success: false,
        message: `${requestType} requires at least one item`,
      });
    }
    let subtotal = 0;
    let populatedItems = [];
    // Check if items exist in the database
    if (requiresItems) {
      const price_items = await calcPrice(items, HotelId);
      subtotal = price_items.subtotal;
      populatedItems = price_items.populatedItems;
    }

    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const context = {
        applicableFor: "guest_purchase",
        userId: req.guest._id,
        userModel: "Guest",
        hotelId: HotelId, // assuming it's set in the token
        amount: subtotal,
      };

      const couponResult = await validateAndApplyCoupon(
        couponCode,
        context,
        false,
        session
      );

      if (!couponResult.valid) {
        await session.abortTransaction();
        return res
          .status(400)
          .json({ success: false, message: couponResult.message });
      }

      appliedCoupon = couponResult.coupon;

      if (appliedCoupon.discountType === "fixed") {
        discount = appliedCoupon.value;
      } else if (appliedCoupon.discountType === "percentage") {
        discount = (appliedCoupon.value / 100) * subtotal;
      }
    }

    // 4. Final price
    let gstAmount;
    let finalAmount = Math.max(subtotal - discount, 0);
    if (gst) {
      gstAmount = (finalAmount * gst) / 100;
      finalAmount += gstAmount;
    }
    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      subtotal,
      discount: discount,
      gstAmount,
      finalAmount,
      gst,
      appliedCoupon: appliedCoupon
        ? {
            code: appliedCoupon.code,
            value: appliedCoupon.value,
            type: appliedCoupon.discountType,
          }
        : null,
      items: populatedItems,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    return res
      .status(error.statusCode?error.statusCode:500)
      .json({ success: false, message: error.message?error.message:"Something went wrong" });
  } finally {
    session.endSession();
  }
};
exports.createHousekeepingRequest = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const {
      requestType,
      items,
      requestDetail,
      couponCode,
      gst,
      paymentMode
    } = req.body;

    const guestId = req.guest._id;
    const guest = req.guest;
    const HotelId = req.guest.HotelId;
    // Validate payment mode
    const validPaymentModes = ["cashfree", "cash"];
    if (paymentMode &&!validPaymentModes.includes(paymentMode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment mode. Allowed: cashfree, cash",
      });
    }

    // Validate request type and items requirement
    const requiresItems = ["Toiletries", "Laundry"].includes(requestType);
    let subtotal = 0;
    let populatedItems = [];
    let activeRoomBooking = null;

    if (requiresItems && (!items || items.length === 0)) {
      return res.status(400).json({
        success: false,
        message: `${requestType} requires at least one item`,
      });
    }

    // Check if items exist in the database
    if (requiresItems) {
      const price_items = await calcPrice(items, HotelId);
      subtotal = price_items.subtotal;
      populatedItems = price_items.populatedItems;
    }

    let discount = 0;
    let appliedCoupon = null;

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
        await session.abortTransaction();
        return res
          .status(400)
          .json({ success: false, message: couponResult.message });
      }

      appliedCoupon = couponResult.coupon;

      if (appliedCoupon.discountType === "fixed") {
        discount = appliedCoupon.value;
      } else if (appliedCoupon.discountType === "percentage") {
        discount = (appliedCoupon.value / 100) * subtotal;
      }
    }
    let gstAmount

    // Calculate final amount
    let finalAmount = Math.max(subtotal - discount, 0);
    if (gst) {
      gstAmount = (finalAmount * gst) / 100;
      finalAmount += gstAmount;
    }
    // Create service request
    const serviceRequest = new HousekeepingRequest({
      guest: guestId,
      HotelId,
      requestType,
      items: requiresItems ? items : undefined,
      requestDetail,
      status: "pending",
      serviceType: "HousekeepingRequest",
      amount: {
        subtotal,
        discount,
        gstAmount,
        finalAmount,
      },
      gst,
      paymentStatus: paymentMode ? paymentMode === "cash" ? "pay-later" : "pending":"NA", // Store payment mode
      paymentMode: paymentMode === "cash" ? "pay-later" : "cashfree",
      coupon: appliedCoupon
        ? {
            code: appliedCoupon.code,
            type: appliedCoupon.discountType,
            value: appliedCoupon.value,
          }
        : undefined,
    });

    await serviceRequest.save({ session });

    let transactionId = await generateUniqueId(
      "Transaction",
      "transactionId",
      "TXO"
    );
    let paymentResponse = null;

    // Handle payment if required
    if (requiresItems && finalAmount > 0) {
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
        activeRoomBooking = await Bookings.findById(
          guest.currentBooking
        ).session(session);

        if (!activeRoomBooking) {
          await session.abortTransaction();
          return res.status(400).json({
            success: false,
            message: "No active room booking found for cash payment",
          });
        }

        // Update due amount and add service
        activeRoomBooking.serviceDue =
          (activeRoomBooking.serviceDue || 0) + finalAmount;
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
            ? paymentResponse.payment_session_id
            : undefined,
        coupon: appliedCoupon,
        discountAmount: discount,
        serviceRequestId: serviceRequest._id,
        metadata: {
          populatedItems,
        },
        gatewayResponse:
          paymentMode === "cashfree" ? paymentResponse : null,
      });

      await transaction.save({ session });
      serviceRequest.transaction = transaction._id;
      await serviceRequest.save({ session });
    }

    await session.commitTransaction();
    await notifyNewServiceRequest(serviceRequest);

    // Prepare response
    const responseData = {
      success: true,
      message: "Service request created successfully",
      data: serviceRequest,
    };

    // Add payment session ID only for cashfree
    if (requiresItems && finalAmount > 0 && paymentMode === "cashfree") {
      responseData.payment_session_id = paymentResponse.payment_session_id;
      responseData.populatedItems = populatedItems;
    }

    return res.status(201).json(responseData);
  } catch (error) {
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
const calcPrice = async (items, HotelId) => {
  let subtotal = 0;
  let populatedItems = []
  for (const item of items) {
    const existingItem = await HousekeepingItem.findOne({_id: item.item, HotelId})
    
    if (!existingItem) {
      throw new ApiError(404, `Item with ID ${item.item} not found.`)
    }

    subtotal += (existingItem.price * item.quantity);
    populatedItems.push(existingItem)
  }
  return {subtotal, populatedItems};
}; 

/**
 * GET /housekeeping/requests
 * ---------------------------------
 * Query-params supported:
 *   page        – page number (default 1)
 *   limit       – docs per page (default 20)
 *   status      – pending | in-progress | completed
 *   requestType – WholeRoomCleaning | PartialRoomCleaning | Toiletries | Laundry
 *   guest       – filter by Guest ObjectID (ignored when guestAuth adds req.guest)
 */
exports.getAllHousekeepingRequests = async (req, res) => {
  try {
    const query = {};

    // If this route is behind guestAuth, return *only* the
    // authenticated guest’s own requests
    if (req.guest) query.guest = req.guest._id;
    if (req.user && req.user.HotelId) {
      query.HotelId = req.user.HotelId;
    }   
    
    if (req.query.guest) query.guest = req.query.guest;
    if (req.query.status)     query.status      = req.query.status;
    if (req.query.requestType)query.requestType = req.query.requestType;

    /* ---------- pagination ---------- */
    const page  = Math.max(1, parseInt(req.query.page  || '1', 10));
    const limit = Math.max(1, parseInt(req.query.limit || '20', 10));
    const skip  = (page - 1) * limit;

    /* ---------- fetch ---------- */
    const [total, data] = await Promise.all([
      HousekeepingRequest.countDocuments(query),
      HousekeepingRequest.find(query)
        .populate("assignedTo", "firstName lastName mobileNumber ")
        .populate("guest", "firstName lastName assignedRoom email phoneNumber") // project only needed fields
        .populate("items.item") // idem
        .sort({ requestTime: -1 }) // newest first
        .skip(skip)
        .limit(limit),
    ]);

    return res.json({
      success: true,
      page,
      pages: Math.ceil(total / limit),
      total,
      data
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

/**
 * GET /housekeeping/requests/:id
 * ---------------------------------
 */
exports.getHousekeepingRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await HousekeepingRequest.findOne({
      $or: [{ _id: id }, { id }], // support both identifiers
    })
      .populate("guest", "firstName lastName phoneNumber assignedRoomNumber")
      .populate("assignedTo", "firstName lastName mobileNumber ")
      .populate("items.item");

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Optionally: make sure guests can fetch only their own record
    if (req.guest && request.guest._id.toString() !== req.guest._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    return res.json({ success: true, data: request });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


/**
 * PUT /housekeeping/requests/:id
 * ------------------------------
 * Body can include any of:
 *   status                – 'pending' | 'in-progress' | 'completed'
 *   assignedTo            – Admin ObjectId
 *   requestType           – WholeRoomCleaning | PartialRoomCleaning | Toiletries | Laundry
 *   items                 – [HousekeepingItem ObjectIds]   (required for Toiletries/Laundry)
 *   requestDetail
 *   responseDetail
 *   estimatedDeliveryTime – ISO date string
 */
exports.updateHousekeepingRequest = async (req, res) => {
  try {
    const { id }   = req.params;
    const updates  = req.body;

    /* ---------- fetch the existing request ---------- */
    const request = await HousekeepingRequest.findOne(
      { $or: [{ _id: id }, { id }] }      // support either identifier
    );

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    /* ---------- permission check for guests ---------- */
    if (req.guest && request.guest.toString() !== req.guest._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    /* ---------- validate requestType / items changes ---------- */
    const newRequestType = updates.requestType || request.requestType;
    const requiresItems  = ['Toiletries', 'Laundry'].includes(newRequestType);

    // If the request type requires items, make sure they’re provided
    if (requiresItems && (!updates.items && !request.items?.length)) {
      return res.status(400).json({
        success : false,
        message : `${newRequestType} requires at least one item`,
      });
    }

    // If client supplied a new items array, verify those IDs exist
    if (updates.items) {
      const itemIds = updates.items.map((obj) => obj.item);

      const found = await HousekeepingItem.countDocuments({ _id: { $in: itemIds } });
      if (found !== updates.items.length) {
        return res.status(404).json({
          success : false,
          message : 'One or more items not found',
        });
      }
    }

    /* ---------- perform the update & save ---------- */
    Object.assign(request, updates);   // shallow-merge only allowed fields
    await request.save();

    return res.json({
      success : true,
      message : 'Housekeeping request updated',
      data    : request,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Get items for ADMIN (using hotelId from token)
exports.getHousekeepingItemsForAdmin = async (req, res) => {
  try {
    const HotelId = req.user.HotelId;
    if (!HotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel ID not found in user token",
      });
    }

    const items = await HousekeepingItem.find({ HotelId });
    const groupedItems = groupItemsByServiceType(items);

    return res.json({
      success: true,
      data: groupedItems,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching items",
      error: error.message,
    });
  }
};

// Get items for GUEST (using hotelId from request body)
exports.getHousekeepingItemsForGuest = async (req, res) => {
  try {
    const { HotelId } = req.body;
    if (!HotelId) {
      return res.status(400).json({
        success: false,
        message: "Hotel ID is required in request body",
      });
    }

    const items = await HousekeepingItem.find({ HotelId });
    const groupedItems = groupItemsByServiceType(items);

    return res.json({
      success: true,
      data: groupedItems,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching items",
      error: error.message,
    });
  }
};