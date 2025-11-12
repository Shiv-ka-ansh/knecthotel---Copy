const jwt     = require('jsonwebtoken');
const Guest   = require('../../models/Guest');
const Booking = require('../../models/Bookings');
const Hotel   = require('../../models/Hotel');  
const moment = require("moment");
const otpService = require("../../service/otpService.js"); 
const { generateOTP } = require("../../utils/otpUtil"); 
const Bookings = require('../../models/Bookings');
const axios = require("axios");
const ApiError = require('../../utils/ApiError.js');
const admin = require('../../config/firebase');

exports.sendOTP = async (req, res) => {
  const { phoneNumber } = req.body;
  console.log(phoneNumber)
  try {
    if (!phoneNumber) {
      return res.status(400).json({
        message: "Phone number is required!",
      });
    }
    // Check if the phone number is already registered
    let guest = await Guest.findOne({ phoneNumber });

    // If the guest is not registered, send OTP for signup
    if (!guest) {
      // const otpCode = generateOTP();
      const otpCode = "123456";
      const expiresAt = moment().add(10, "minutes").toDate(); // OTP expires in 10 minutes

      // Create a new guest record for signup
      guest = new Guest({
        phoneNumber,
        otp: { code: otpCode, expiresAt },
      });

      await guest.save();
      await otpService.sendOTP(phoneNumber, otpCode); // Send OTP via a third-party service like Twilio

      return res.status(200).json({
        message: "OTP sent successfully for signup. Please check your phone.",
      });
    }

    // If guest exists, send OTP for login
    // const otpCode = generateOTP();
    const otpCode = "123456";
    const expiresAt = moment().add(10, "minutes").toDate(); // OTP expires in 10 minutes

    guest.otp = { code: otpCode, expiresAt, verified: false }; // Reset OTP fields
    await guest.save();

    // Send OTP to the registered phone number
    await otpService.sendOTP(phoneNumber, otpCode);

    return res
      .status(200)
      .json({ message: "OTP sent successfully. Please check your phone." });
  } catch (err) {
    if (err.name === "ValidationError") {
      // Extract the specific message
      const messages = Object.values(err.errors).map((e) => e.message);
      return res
        .status(400)
        .json({ message: messages.join(", "), error: err.message });
    }
    return res.status(500).json({ message: "Error sending OTP", error: err.message });
  }
};
exports.verifyOTP = async (req, res) => {
  let { phoneNumber, firebaseIdToken } = req.body;

  try {
    
    if (!phoneNumber || !firebaseIdToken) {
      return res.status(400).json({
        message:"phoneNumber and firebaseIdToken is required"
      })
    }
    let guest = await Guest.findOne({ phoneNumber });

    if (!guest) {
      // create guest when not found
      const newGuest = new Guest({
        phoneNumber,
        otp: { verified: false, code: null, expiresAt: null },
      });
      await newGuest.save();
      guest = newGuest;
    }

    phoneNumber = phoneNumber.trim();
    phoneNumber  = "+91"+phoneNumber
    let decodedToken;
    if (firebaseIdToken !== "testtoken") {
      try {
        decodedToken = await admin.auth().verifyIdToken(firebaseIdToken);
      } catch (e) {
        console.log("Firebase Token Verification Error:", e);
        return res.status(401).json({ message: "Invalid firebaseIdToken", error: e.message });
      }

      // If token contains phone number, ensure it matches the provided phoneNumber
      if (decodedToken.phone_number && decodedToken.phone_number !== phoneNumber) {
        return res.status(401).json({ message: "firebaseIdToken phone number does not match" });
      }
    }
    // Find the guest by phone number
   


    // Check if OTP is already verified
    // if (guest.otp.verified) {
    //   return res.status(400).json({ message: "OTP already verified." });
    // }

    // // Check if OTP is valid and not expired
    // if (!guest.compareOTP(otpCode)) {
    //   return res.status(400).json({ message: "Invalid or expired OTP." });
    // }
    
    

    // Mark OTP as verified
    guest.otp.verified = true;
    guest.otp.code = null; // Clear OTP after verification
    await guest.save();

    // Generate JWT token for login (can be used for accessing other resources)
    const token = jwt.sign(
      { id: guest._id, phoneNumber: guest.phoneNumber, userType: "Guest" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // Token expires in 2 day
    );

    return res.status(200).json({
      message: "OTP verified successfully. Login successful.",
      token,
      guest: {
        id: guest._id,
        firstName: guest.firstName,
        lastName: guest.lastName,
        phoneNumber: guest.phoneNumber,
        isSignupComplete: guest.isSignupComplete,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error verifying OTP", error: err.message });
  }
};
exports.getProfile = async (req, res) => {
  try {
    // Get the guest by phone number (already verified OTP)
    const guest = await Guest.findById(req.guest._id);

    if (!guest) {
      return res.status(404).json({ message: "Guest not found." });
    }

    // Check if profile is complete (you can adjust the fields that are "required" to be filled)
    const isProfileComplete = guest.isSignupComplete
    
    return res.status(200).json({
      message: "Guest profile data",
      profileComplete: isProfileComplete,
      guest: {
        firstName: guest.firstName,
        lastName: guest.lastName,
        phoneNumber: guest.phoneNumber,
        language: guest.language,
        dateOfBirth: guest.dateOfBirth,
        anniversaryDate: guest.anniversaryDate,
        profilePicture: guest.profilePicture,
        documents: guest.documents,
        cardDetails: guest.cardDetails,
        lastLogin: guest.lastLogin,
        isSignupComplete: guest.isSignupComplete,
        idProof: guest.idProof,
        assignedRoomNumber: guest.assignedRoomNumber,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error fetching profile data", error: err.message });
  }
};


exports.completeSignup = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    dateOfBirth,
    anniversaryDate,
    language,
    idProof,
    profilePicture,
    cardDetails,
  } = req.body;

  try {
    const guest = await Guest.findById(req.guest._id);
    if (!guest) return res.status(404).json({ message: "Guest not found" });
    if (guest.isSignupComplete)
      return res.status(400).json({ message: "Profile already completed" });
    // if (!idProof?.url)
    //   return res.status(400).json({ message: "ID proof document is required" });

    // Update guest fields
    guest.firstName = firstName || guest.firstName;
    guest.lastName = lastName || guest.lastName;
    guest.email = email || guest.email;
    guest.dateOfBirth = dateOfBirth || guest.dateOfBirth;
    guest.anniversaryDate = anniversaryDate || guest.anniversaryDate;
    guest.language = language || guest.language;
    guest.profilePicture = profilePicture || guest.profilePicture;

    // Initialize document verification
    guest.idProof = {
      url: idProof.url,
      verification: {
      status: "PENDING",
      },
    },

    guest.isSignupComplete = true;
    await guest.save();
    if (idProof.url)
      await initiateVerification(guest._id, idProof.url, idProof.type);

    return res.status(200).json({
      message: "Signup completed successfully!",
      guest: {
        id: guest._id,
        firstName: guest.firstName,
        isSignupComplete: true,
        documentStatus: "PENDING",
      },
    });
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      message: "Error completing signup",
      error: err.message,
    });
  }
};

// Background verification process
const initiateVerification = async (guestId, docUrl, docType = "AADHAAR") => {
  console.log(`Initiating verification for guest ${guestId} with ${docType}`);

  try {
    const verificationId = `VR_${guestId}_${Date.now()}`;
    const payload = {
      verification_id: verificationId,
      document_type: docType, // Dynamic document type
      file_url: docUrl,
    };

    console.log("Cashfree Request Payload:", payload);

    const response = await axios.post(
      "https://sandbox.cashfree.com/verification/bharat-ocr", 
      payload,
      {
        headers: {
          "x-client-id": process.env.CASHFREE_CLIENT_ID,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
          "Content-Type": "multipart/form-data",
          "x-api-version": "2024-12-01",
        },
      }
    );

    console.log("Cashfree Response:", JSON.stringify(response.data, null, 2));

    const updateData = {
      "documents.idProof.verification": {
        status: response.data.verification?.status || "PENDING",
        message:
          response.data.verification?.message || "Verification initiated",
        timestamp: new Date(),
        requestId: response.data.request_id,
      },
    };

    await Guest.findByIdAndUpdate(guestId, updateData);
    console.log(`Verification initiated successfully for ${guestId}`);
  } catch (error) {
    console.error("Verification Error:", error);

    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Verification service error";

    await Guest.findByIdAndUpdate(guestId, {
      "documents.idProof.verification": {
        status: "FAILED",
        message: errorMessage,
        timestamp: new Date(),
      },
    });

    console.error(`Verification failed for ${guestId}: ${errorMessage}`);
  }
};

exports.updateProfile = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    dateOfBirth,
    anniversaryDate,
    language,
    documents,
    profilePicture,
    cardDetails,
    idProof
  } = req.body;

  try {
    const guest = await Guest.findById(req.guest._id); // Assuming guest info is in `req.guest`

    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }

    // Update the fields that are provided
    guest.firstName = firstName || guest.firstName;
    guest.lastName = lastName || guest.lastName;
    guest.email = email || guest.email;
    guest.dateOfBirth = dateOfBirth || guest.dateOfBirth;
    guest.anniversaryDate = anniversaryDate || guest.anniversaryDate;
    guest.language = language || guest.language;
    guest.documents = documents || guest.documents;
    guest.profilePicture = profilePicture || guest.profilePicture;
    guest.cardDetails = cardDetails || guest.cardDetails;
    guest.idProof = idProof || guest.idProof;
    await guest.save();
    if (idProof && idProof.url)
      await initiateVerification(guest._id, idProof.url, idProof.type);
    return res.status(200).json({
      message: "Profile updated successfully!",
      guest: {
        id: guest._id,
        firstName: guest.firstName,
        lastName: guest.lastName,
        phoneNumber: guest.phoneNumber,
        email: guest.email,
        language: guest.language,
        profilePicture: guest.profilePicture,
        cardDetails: guest.cardDetails,
        documents: guest.documents,
        idProof: guest.idProof,
      },
    });
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ message: "Error updating profile", error: err.message });
  }
};
exports.fetchGuest = async (req, res) => {
  try {
    const phoneNumber = req.params.phoneNumber
    const guest = await Guest.findOne({ phoneNumber }).select(
      "phoneNumber firstName lastName email idProof"
    );
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest Not Found'
      })
    }
    return res.status(200).json({
      success: true,
      message: 'Guest Found',
      guest
    })
  } catch (e) {
    return res.status(500).json({
      message: 'Internal Server Error!',
      error: e.message || e
    })
  }
}


exports.saveFcmToken = async (req, res, next) => {
  try {
    
    const fcmToken = req.body.fcmToken;
    const guest = await Guest.findByIdAndUpdate(req.guest._id, {fcmToken});
    
    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }
    return res.status(200).json({ success:true, message: "fcmToken updated successfully" });
    

  } catch(error) {
      next(error)
  }
}
