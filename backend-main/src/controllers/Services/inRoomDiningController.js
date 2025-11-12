const mongoose = require("mongoose");
const InRoomDiningProduct = require("../../models/services/InRoomDiningProduct");
const InRoomDiningBooking = require("../../models/services/InRoomDiningBooking");
const InRoomDiningCart = require("../../models/services/InRoomDiningCart");
const { validateAndApplyCoupon } = require("../../utils/couponUtils");
const { createOrder } = require("../../utils/cashfreeServices");
const Guest = require("../../models/Guest");
const Transaction = require("../../models/Transaction");
const ApiError = require("../../utils/ApiError");
const generateUniqueId = require("../../utils/idGenerator");
const Bookings = require("../../models/Bookings");

const multer = require("multer");
const xlsx = require("xlsx");
const fs = require("fs"); // To remove the file after upload
const { notifyNewServiceRequest } = require("../../service/notificationService");


/* ───────────── Admin: Add / Update Food Product ───────────── */
exports.addProduct = async (req, res) => {
  try {
    const {
      productType,
      productName,
      description,
      cost,
      foodType,
      visibility = true,
      imageUrl,
    } = req.body;

    const HotelId = req.user.HotelId;

    if (!productType || !productName || cost == null || !foodType) {
      return res.status(400).json({
        success: false,
        message: "productType, productName, cost, and foodType are required",
      });
    }

    const newProduct = new InRoomDiningProduct({
      HotelId,
      productType,
      productName,
      description,
      cost,
      foodType,
      visibility,
      imageUrl,
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

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const HotelId = req.user.HotelId;

    const product = await InRoomDiningProduct.findOne({ _id: id, HotelId });
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    Object.assign(product, updates);
    await product.save();

    return res.json({
      success: true,
      message: "Product updated",
      data: product,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

/* ───────────── Admin/Guest: List visible products ───────────── */

exports.getAllProducts = async (req, res) => {
  try {
    const query = {};
    if (req.user?.HotelId) {
      query.HotelId = req.user.HotelId;
    } else {
      query.HotelId = req.query.HotelId;
      query.visibility = true;
    }

    if (req.query.productType) {
      query.productType = req.query.productType;
    }
    if (!query.HotelId) {
      return res
        .status(400)
        .json({ success: false, message: "HotelId query param required" });
    }

    const products = await InRoomDiningProduct.find(query).sort({
      productType: 1,
    });

    return res.json({ success: true, data: products });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

/* ───────────── Guest: Create booking ───────────── */
exports.getCart = async (req, res) => {
  try {
    const guestId = req.guest._id;
    const cart = await InRoomDiningCart.findOne({ guest: guestId }).populate(
      "items.product"
    );
    
    return res.json({ success: true, data: cart || { items: [] } });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const guestId = req.guest._id;
    const { productId, quantity, HotelId } = req.body;

    if (!productId || !quantity || !HotelId) {
      return res.status(400).json({
        success: false,
        message: "productId, quantity, and HotelId are required",
      });
    }

    const product = await InRoomDiningProduct.findOne({
      _id: productId,
      HotelId,
    });
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    let cart = await InRoomDiningCart.findOne({ guest: guestId }).populate(
      "items.product"
    );

    if (!cart) {
      cart = new InRoomDiningCart({ guest: guestId, HotelId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.product._id.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    cart.updatedAt = new Date();
    await cart.save();

    return res
      .status(200)
      .json({ success: true, message: "Item added to cart", data: cart });
  } catch (err) {
    // return res
    //   .status(500)
    //   .json({ success: false, message: "Server error", error: err.message });
    return next(err)
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const guestId = req.guest._id;
    const { productId, quantity } = req.body;

    const cart = await InRoomDiningCart.findOne({ guest: guestId }).populate(
      "items.product"
    );
    if (!cart)
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });

    const item = cart.items.find((i) => i.product._id.toString() === productId);
    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Product not in cart" });

    item.quantity = quantity;
    cart.updatedAt = new Date();
    await cart.save();

    return res.json({ success: true, message: "Cart updated", data: cart });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const guestId = req.guest._id;
    const { productId } = req.params;

    const cart = await InRoomDiningCart.findOne({ guest: guestId }).populate(
      "items.product"
    );
    if (!cart)
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.product._id.toString() !== productId
    );
    cart.updatedAt = new Date();
    await cart.save();

    return res.json({ success: true, message: "Item removed", data: cart });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const guestId = req.guest._id;
    await InRoomDiningCart.deleteOne({ guest: guestId });
    return res.json({ success: true, message: "Cart cleared" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

exports.calculateCartPrice = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const guestId = req.guest._id;
    const { items: payloadItems, couponCode, HotelId, gst } = req.body;

    // 1. Get cart items (from DB or payload)
    let items;
    if (payloadItems) {
      items = payloadItems;
    } else {
      const cart = await InRoomDiningCart.findOne({ guest: guestId }).populate(
        "items.product"
      );
      if (!cart || cart.items.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Cart is empty" });
      }
      items = cart.items.map(({ product, quantity }) => ({
        product: product._id,
        quantity,
        productDetails: product,
      }));
    }
    // 2. Calculate subtotal
    let subtotal = 0;
    const populatedItems = [];
    for (const item of items) {
      const product = item.productDetails;
      if (!product) continue;
      const total = product.cost * item.quantity;
      subtotal += total;
      populatedItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        total,
      });
    }

    // 3. Validate Coupon (if provided)
    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const context = {
        applicableFor: "guest_purchase",
        userId: guestId,
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
        discountAmount = appliedCoupon.value;
      } else if (appliedCoupon.discountType === "percentage") {
        discountAmount = (appliedCoupon.value / 100) * subtotal;
      }
    }

    // 4. Final price
    let gstAmount;
    let finalAmount = Math.max(subtotal - discountAmount, 0);
    if (gst) {
      gstAmount = (finalAmount * gst) / 100;
      finalAmount += gstAmount;
    }
    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      subtotal,
      discount: discountAmount,
      gstAmount,
      finalAmount,
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
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  } finally {
    session.endSession();
  }
};

exports.createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const guestId = req.guest._id;
    const guest = req.guest;
    const { specialInstructions, HotelId, couponCode, paymentMode = "cashfree",  gst } = req.body; // Get payment mode
    
    // Validate payment mode
    const validPaymentModes = ["cashfree", "cash"];
    if (!validPaymentModes.includes(paymentMode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment mode. Allowed: cashfree, cash",
      });
    }

    // Validate required fields
    if (!HotelId) {
      return res.status(400).json({
        success: false,
        message: "HotelId is required",
      });
    }

    // 1. Get cart
    const cart = await InRoomDiningCart.findOne({ guest: guestId })
      .populate("items.product")
      .session(session);

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty. Please add items before placing an order.",
      });
    }

    // 2. Validate items and calculate subtotal
    let subtotal = 0;
    const orderedItems = [];
    for (const item of cart.items) {
      const product = item.product;

      if (!product || product.HotelId.toString() !== HotelId.toString()) {
        return res.status(400).json({
          success: false,
          message: `Product ${product ? product.name : item.product} is not available in this hotel.`,
        });
      }

      subtotal += product.cost * item.quantity;
      orderedItems.push({
        product: product._id,
        quantity: item.quantity,
      });
    }

    // 3. Validate & apply coupon
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
    let gstAmount;
    let finalAmount = subtotal - discount;
    if (gst) {
      gstAmount = (finalAmount * gst) / 100;
      finalAmount += gstAmount;
    }
    // 4. Create booking
    const serviceRequest = new InRoomDiningBooking({
      guest: guestId,
      HotelId,
      orderedItems,
      specialInstructions,
      status: "pending",
      serviceType: "InRoomDiningBooking",
      amount: {
        subtotal,
        discount,
        gstAmount,
        finalAmount,
      },
      gst,
      paymentMode: paymentMode === "cash" ? "pay-later" : "cashfree",
      paymentStatus:paymentMode === "cash"?"pay-later":"pending", // Store payment mode in booking
      coupon: appliedCoupon
        ? {
            code: appliedCoupon.code,
            type: appliedCoupon.discountType,
            value: appliedCoupon.value,
          }
        : undefined,
    });

    await serviceRequest.save({ session });

    let paymentResponse = null;
    let transactionId = await generateUniqueId(
      "Transaction",
      "transactionId",
      "TXO"
    );
    let activeRoomBooking = null;

    // Handle payment based on mode
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
      // Find active room booking
      activeRoomBooking = await Bookings.findById(guest.currentBooking)

      if (!activeRoomBooking) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "No active room booking found for cash payment",
        });
      }

      // Update due amount
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
          ? paymentResponse.payment_session_id
          : undefined,
      coupon: appliedCoupon,
      discountAmount: discount,
      serviceRequestId: serviceRequest._id,
      metadata: {
        cartItems: cart.items,
      },
      gatewayResponse: paymentMode === "cashfree" ? paymentResponse.data : null,
    });

    await transaction.save({ session });
    serviceRequest.transaction = transaction._id;
    await serviceRequest.save({ session });

    // Clear cart
    await InRoomDiningCart.findOneAndUpdate(
      { guest: guestId },
      { $set: { items: [] } },
      { session }
    );

    await session.commitTransaction();
    await notifyNewServiceRequest(serviceRequest);

    // Prepare response
    const responseData = {
      success: true,
      message: "Booking placed successfully",
      data: serviceRequest,
    };

    // Add payment session ID only for cashfree
    if (paymentMode === "cashfree") {
      responseData.payment_session_id = paymentResponse.payment_session_id;
    }

    return res.status(201).json(responseData);
  } catch (err) {
    await session.abortTransaction();
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  } finally {
    session.endSession();
  }
};

/* ───────────── List / Get Booking ───────────── */

exports.getBookings = async (req, res) => {
  try {
    const HotelId = req.user ? req.user.HotelId : null;
    const guestId = req.guest ? req.guest._id : null;

    const filter = {};
    if (HotelId) filter.HotelId = HotelId;
    if (guestId) filter.guest = guestId;
    if (req.query.status) filter.status = req.query.status;
    filter.__t = "InRoomDiningBooking";
    const bookings = await ServiceRequest.find(filter)
      .populate("guest", "firstName lastName email phoneNumber")
      .populate("assignedTo", "firstName lastName mobileNumber")
      .populate("orderedItems.product")
      .sort({ requestTime: -1 });

    return res.json({ success: true, data: bookings });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await InRoomDiningBooking.findById(id)
      .populate("assignedTo", "firstName lastName mobileNumber")
      .populate("guest", "firstName lastName email phoneNumber")
      .populate("orderedItems.product");

    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

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

exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const booking = await InRoomDiningBooking.findById(id);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    if (req.guest && booking.guest.toString() !== req.guest._id.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    Object.assign(booking, updates);
    await booking.save();

    return res.json({
      success: true,
      message: "Booking updated",
      data: booking,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // You can change the directory if required
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // To avoid filename conflicts
  },
});

const upload = multer({ storage }).single("excelFile"); // 'excelFile' is the form field name for file input

// Bulk upload products from Excel
exports.bulkUploadProducts = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res
          .status(500)
          .json({
            success: false,
            message: "File upload failed",
            error: err.message,
          });
      }

      // Read and process the Excel file
      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Parse data
      const products = xlsx.utils.sheet_to_json(sheet);

      // Validate and insert the products
      const requiredFields = ["productType", "productName", "cost", "foodType"];
      const missingFields = [];
      products.forEach((product, index) => {
        requiredFields.forEach((field) => {
          if (!product[field]) {
            missingFields.push(`Row ${index + 1}: Missing ${field}`);
          }
        });
      });

      if (missingFields.length > 0) {
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) {
            console.error("Error deleting the file:", unlinkErr);
          }
        });

        return res
          .status(400)
          .json({
            success: false,
            message: "Missing required fields in some rows",
            errors: missingFields,
          });
      }

      // Insert products into DB
      const HotelId = req.user.HotelId;
      const productData = products.map((product) => ({
        HotelId,
        productType: product.productType,
        productName: product.productName,
        description: product.description || "",
        cost: product.cost,
        foodType: product.foodType,
        visibility: product.visibility || true,
        imageUrl: product.imageUrl || "",
      }));

      const result = await InRoomDiningProduct.insertMany(productData);

      // Delete file after upload
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) {
          console.error("Error deleting the file:", unlinkErr);
        }
      });

      return res.status(201).json({
        success: true,
        message: `${result.length} products added successfully`,
        data: result,
      });
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};
