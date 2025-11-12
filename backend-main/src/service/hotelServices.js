// services/hotelService.js
const Hotel = require("../models/Hotel");
const Admin = require("../models/SuperAdmin/Admin");
const Subscription = require("../models/Subscription");
const Coupons = require("../models/Coupons");
const ApiError = require("../utils/ApiError");
const { generateRandomPassword } = require("../utils/password");
const { validateAndApplyCoupon } = require("../utils/couponUtils");

// Validate core hotel data
const validateHotelData = (data) => {
  const { name, address, email, phoneNo } = data;

  if (!name || !address || !email || !phoneNo) {
    return new ApiError(
      400,
      "Missing required fields: name, address, email, phoneNo"
    );
  }

  if (!/^[0-9]{10}$/.test(phoneNo)) {
    return new ApiError(400, "Phone number must be exactly 10 digits");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new ApiError(400, "Invalid email format");
  }

  return null;
};

// Check email existence
const checkEmailExists = async (email, session) => {
  const [existingHotel, existingAdmin] = await Promise.all([
    Hotel.findOne({ email: email.toLowerCase() }).session(session),
    Admin.findOne({ email: email.toLowerCase() }).session(session),
  ]);

  if (existingHotel || existingAdmin) {
    throw new ApiError(409, "Email already exists", {
      existsIn: existingHotel ? "Hotel" : "Admin",
    });
  }
};

// Validate hotel type and parent relationships
const validateHotelType = async (data, session) => {
  const { brandedHotel, chainHotel, parentHotel } = data;

  if (brandedHotel && chainHotel) {
    throw new ApiError(400, "Invalid Selection of Branded and chain hotels");
  }

  if (!brandedHotel && chainHotel) {
    if (!parentHotel) {
      throw new ApiError(400, "Parent hotel ID required for chain hotels");
    }

    const parentHotelExists = await Hotel.findOne({
      HotelId: parentHotel,
    }).session(session);
    if (!parentHotelExists) {
      throw new ApiError(404, "Parent hotel not found");
    }

    return parentHotelExists;
  }

  return null;
};

// Process subscription and coupons
const validateSubscription = async (data, session) => {
  const { subscriptionPlan, subscriptionStartDate, couponCode, gstPercentage } = data;

  const subscription =
    await Subscription.findById(subscriptionPlan).session(session);
  if (!subscription) throw new ApiError(404, "Subscription Not Found");
  if (subscription.status !== "Active")
    throw new ApiError(400, "Subscription Not Active");

  const subscriptionPrice = subscription.cost;
  const subscriptionEndDate = new Date(subscriptionStartDate);
  subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + subscription.planDuration);
  
  let finalPrice = subscriptionPrice;
  let couponDetails = null;

  if (couponCode) {
    couponDetails = await processCoupon(couponCode, subscriptionPrice, session);
    finalPrice = couponDetails.finalPrice;
  }
  if (gstPercentage) {
    const gstAmount = (finalPrice * gstPercentage) / 100; // Assuming GST is 18%
    finalPrice += gstAmount;
  }
  finalPrice = Number(finalPrice).toFixed(2);
  return { subscription, finalPrice, couponDetails, subscriptionEndDate };
};

// Process coupon code
const processCoupon = async (couponCode, amount, session) => {
  const coupon = await Coupons.findOne({ code: couponCode }).session(session);
  if (!coupon) throw new ApiError(404, "Coupon not found");

  if (coupon.applicableFor !== "subscription" || coupon.scope !== "Platform") {
    throw new ApiError(400, "Invalid coupon for subscription");
  }

  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = amount * (coupon.value / 100);
  } else {
    discountAmount = Math.min(coupon.value, amount);
  }

  return {
    code: coupon.code,
    discountAmount,
    finalPrice: amount - discountAmount,
    coupon,
  };
};

// Update the const to include processCoupon
// Create hotel admin
const createHotelAdmin = async (data, session) => {
  return Admin.create(
    [
      {
        firstName: data.name,
        lastName: "Admin",
        email: data.email.toLowerCase(),
        password: data.password,
        roleId: "6825d3b66e1d426f24cda386",
        mobileNumber: data.phoneNo,
        scope: "Hotel",
        isHotelAdmin:true
      },
    ],
    { session }
  ).then((admins) => admins[0]);
};

// Create hotel record
const createHotelRecord = async (
  data,
  admin,
  subscription,
  couponDetails,
  finalPrice,
  parentHotel,
  session
) => {
  const endDate = new Date(data.subscriptionStartDate);
  endDate.setMonth(endDate.getMonth() + subscription.planDuration);

  return Hotel.create(
    [
      {
        Admin: admin._id,
        name: data.name,
        address: data.address,
        email: data.email,
        phoneNo: data.phoneNo,
        hotelCategory: data.hotelCategory,
        city: data.city,
        country: data.country,
        state: data.state,
        pincode: data.pincode,
        gstImage: data.gstImage,
        subscriptionPlan: subscription._id,
        coupon: couponDetails ? couponDetails.coupon._id : null,
        netPrice: finalPrice,
        images: data.images,
        logo: data.logo,
        hotelLicenseAndCertification: data.hotelLicenseAndCertification,
        legalAndBusinessLicense: data.legalAndBusinessLicense,
        touristLicense: data.touristLicense,
        panNumber: data.panNumber,
        dataPrivacyAndGDPRCompliance: data.dataPrivacyAndGDPRCompliance,
        internetConnectivity: data.internetConnectivity,
        softwareCompatibility: data.softwareCompatibility,
        rooms: data.rooms,
        checkInTime: data.checkInTime,
        checkOutTime: data.checkOutTime,
        servingDepartment: data.servingDepartment,
        totalStaff: data.totalStaff,
        numberOfRooms:data.numberOfRooms,
        brandedHotel: data.brandedHotel,
        parentHotel: parentHotel ? parentHotel._id : null,
        chainHotel: data.chainHotel,
        subHotelName: data.subHotelName,
        subscriptionStartDate: data.subscriptionStartDate,
        subscriptionEndDate: endDate,
        wifi: data.wifi,
        about: data.about,
        gstPercentage: data.gstPercentage,
      },
    ],
    { session }
  ).then((hotels) => hotels[0]);
};

// Update parent hotel
const updateParentHotel = async (parentHotel, childHotel, session) => {
  await Hotel.findByIdAndUpdate(
    parentHotel._id,
    { $push: { subHotels: childHotel._id } },
    { session, new: true }
  );
};

// Final coupon application
const finalizeCouponApplication = async (
  couponCode,
  hotel,
  amount,
  session
) => {
  const context = {
    applicableFor: "subscription",
    userId: hotel._id,
    userModel: "Hotel",
    amount,
  };

  await validateAndApplyCoupon(couponCode, context, true, session);
};


module.exports = {
  validateHotelData,
  checkEmailExists,
  validateHotelType,
  validateSubscription,
  processCoupon, // Add this line
  createHotelAdmin,
  createHotelRecord,
  updateParentHotel,
  finalizeCouponApplication,
};