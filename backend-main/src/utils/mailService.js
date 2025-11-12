// src/utils/mailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();
const HOST = process.env.EMAIL_HOST || 'smtp.zoho.in';
const PORT = process.env.EMAIL_PORT || 465;
const SECURE = PORT === 465; // true for 465, false for other ports

const EMAIL_HOTEL_ONBOARDING = process.env.EMAIL_HOTEL_ONBOARDING  
const EMAIL_GUEST_ONBOARDING = process.env.EMAIL_GUEST_ONBOARDING 

const EMAIL_PASS_HOTEL_ONBOARDING = process.env.EMAIL_PASS_HOTEL_ONBOARDING  
const EMAIL_PASS_GUEST_ONBOARDING = process.env.EMAIL_PASS_GUEST_ONBOARDING  

const createTransporter = (EMAIL_USER, EMAIL_PASS) => {
  return nodemailer.createTransport({
    host: HOST, 
    port: PORT,
    secure: true,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    // optional: relax TLS in development:
    tls: {
      rejectUnauthorized: true
    },
    connectionTimeout: 10000
  });
};
  

const sendResetEmail = async (to, otp) => {
  const transporter = createTransporter(EMAIL_HOTEL_ONBOARDING, EMAIL_PASS_HOTEL_ONBOARDING);
  const mailOptions = {
    from: EMAIL_HOTEL_ONBOARDING,
    to,
    subject: 'KnectHotel Password Reset Request - Securely Reset Your Account Access',
    html: `
      <p>Greetings from <b>KnectHotel</b>,</p>

      <p>We received a request to reset the password for your KnectHotel account.</p>

      <p><b>OTP:</b> ${otp}</p>


      <p>This OTP will remain valid for the next <b>3 minutes</b>. If it expires, you can always request a new reset link from the login page.</p>

      <p><b>For your security:</b><br>
      - Do not share this link with anyone.<br>
      - Once reset, please choose a strong password that you haven't used before.</p>

      <p>If you did not request this password reset, please ignore this email — your existing password will remain unchanged.</p>

      <p>For assistance, feel free to contact us at <b>[Support Email]</b> or <b>[Support Phone Number]</b>.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Error sending email');
  }
};
// src/utils/mailService.js (add new function)
const sendSubscriptionConfirmation = async (to, details) => {
  let {
    hotelName,
    adminEmail,
    adminPassword,
    subscriptionPlan,
    subscriptionPrice,
    couponCode,
    discountAmount,
    finalPrice,
    address,
    HotelId,
    payment_link,
    subscriptionStartDate,
    subscriptionEndDate, 
    validity
  } = details;
  subscriptionEndDate = subscriptionEndDate.toDateString();
  subscriptionStartDate = subscriptionStartDate.toDateString();
  const transporter = createTransporter(EMAIL_HOTEL_ONBOARDING, EMAIL_PASS_HOTEL_ONBOARDING);
  
  const mailOptions = {
    from: EMAIL_HOTEL_ONBOARDING,
    to,
    subject: 'Your KnectHotel Account is Ready - Subscription & Login Details Inside',
    html: `
      <p>Greetings from <b>KnectHotel</b>, ${hotelName}!</p>

      <p>We're delighted to inform you that your onboarding request has been successfully approved. Welcome to the <b>KnectHotel</b> network — we're excited to support <b>${hotelName}</b> in enhancing guest experiences through our digital platform.</p>

      <hr>
      <p><b>Subscription Details</b></p>
      <p>Plan: ${subscriptionPlan}<br>
      Start Date: ${subscriptionStartDate}<br>
      Validity: ${validity} Months<br>
      Renewal: ${subscriptionEndDate}</p>

      <p><b>Coupon Details (if applicable)</b><br>
      Coupon Code: ${couponCode || "N/A"}<br>
      Discount: ₹${discountAmount?.toFixed(2) || 0}</p>

      <p><b>Payment Details</b><br>
      Subscription Fee: ₹${subscriptionPrice.toFixed(2)}<br>
      Payment Status: <b>Pending</b></p>

      <p>To activate your subscription, please complete the payment using the secure link below:</p>
      <p>👉 <a href="${payment_link}" target="_blank"  rel="noopener noreferrer">${payment_link}</a></p>

      <hr>
      <p><b>Login Credentials</b><br>
      Username: ${adminEmail}<br>
      Temporary Password: ${adminPassword}</p>

      <p>(For security reasons, please reset your password after your first login.)</p>

      <p>Access your account here: <a href="http://13.127.80.211:3000/" target="_blank"  rel="noopener noreferrer">KnectHotel Dashboard</a></p>

      <p>For any queries or assistance, our support team is just a message away at <b>[Support Email]</b> or <b>[Support Phone Number]</b>.</p>

      <p>Once again, welcome aboard! We're thrilled to partner with <b>${hotelName}</b> and look forward to helping you deliver seamless, tech-driven services to your guests.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw new Error('Failed to send confirmation email');
  }
};

const sendRejectionEmail = async (to, hotelName, message) => {
  const transporter = createTransporter(EMAIL_HOTEL_ONBOARDING, EMAIL_PASS_HOTEL_ONBOARDING);

  const mailOptions = {
    from: EMAIL_HOTEL_ONBOARDING,
    to,
    subject: "Update on Your KnectHotel Onboarding Request",
    html: `
      <p>Greetings from <b>KnectHotel</b>, ${hotelName}</p>

      <p>We appreciate your interest in partnering with us. After reviewing your request, we regret to inform you that it has not been approved at this time due to the following reason:</p>

      <p><b>Rejection Reason:</b> ${message}</p>

      <p>You do not need to refill the entire onboarding form. To resubmit your request:</p>
      <p>
        - Open the KnectHotel App.<br>
        - Enter the same registered phone number.<br>
        - All previously submitted details will be automatically fetched.<br>
        - Review and edit/update the necessary details.<br>
        - Submit the request again for review.
      </p>

      <p>Our team will promptly re-evaluate your updated submission once received.</p>

      <p>If you have any questions, feel free to contact us at <b>[Support Email]</b> or <b>[Support Phone Number]</b>.</p>

      <p>We value your interest in joining KnectHotel and look forward to receiving your revised request soon.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending rejection email:", error);
    throw new Error("Failed to send rejection email");
  }
};

const sendComplaintRaisedEmail = async (to, hotelName, complaint) => {
  const transporter = createTransporter(EMAIL_HOTEL_ONBOARDING, EMAIL_PASS_HOTEL_ONBOARDING);

  const mailOptions = {
    from: EMAIL_HOTEL_ONBOARDING,
    to,
    subject:  `Complaint Acknowledgement - ${complaint.uniqueId}`,
    html: `
      <p>Greetings from <b>KnectHotel</b>, ${hotelName}</p>

      <p>We have received your complaint regarding <b>${complaint.complaintType}</b> and want to assure you that your concern is important to us.</p>

      <p><b>Complaint Details:</b><br>
      Complaint ID: ${complaint.uniqueId}<br>
      Date & Time: ${complaint.createAt}<br>
      Issue: ${complaint.description}</p>

      <p>Our team is currently reviewing the matter and will work towards resolving it as quickly as possible. You can expect an update from us within 24–48 hours.</p>

      <p>If you have additional information or screenshots, please reply to this email.</p>

      <p>We sincerely apologize for any inconvenience caused and appreciate your patience while we work to address your concern.</p>
    `,
  };


  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending Complaint Registered email:", error);
    throw new Error("Failed to send Complaint Registered email");
  }
}

const sendGuestOnboarding = async (to) => {
  const transporter = createTransporter(EMAIL_GUEST_ONBOARDING, EMAIL_PASS_GUEST_ONBOARDING);

  const mailOptions = {
    from: EMAIL_GUEST_ONBOARDING,
    to,
    subject: "Thank You for Creating a KnectHotel Account",
    html: `
      <p>Greetings from <b>KnectHotel</b>!</p>

      <p>Thank you for creating an account with KnectHotel. We're excited to have you on board!</p>

      <p>To use our app and enjoy its features, you must have an active booking at a hotel that uses KnectHotel's digital guest service platform.</p>

      <p>If you have an upcoming stay at one of our partner hotels, simply log in with your account to access services such as digital check-in, room service ordering, and more.</p>

      <p>We look forward to enhancing your stay experience through KnectHotel.</p>

      <p>For any questions or assistance, feel free to reach out to us at <b>[Support Email]</b> or <b>[Support Phone Number]</b>.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending Guest Onboarding email:", error);
  }
}

const sendGuestBooking = async (to, hotelName) => {
  const transporter = createTransporter(EMAIL_GUEST_ONBOARDING, EMAIL_PASS_GUEST_ONBOARDING);

  const mailOptions = {
    from: EMAIL_GUEST_ONBOARDING,
    to,
    subject: `Welcome to ${hotelName} - Enjoy a Digital Stay with KnectHotel`,
    html: `
      <p>Greetings from <b>${hotelName}</b>!</p>

      <p>Thank you for choosing to stay with us. To make your experience seamless and enjoyable, we invite you to download the <b>KnectHotel App</b>.</p>

      <p>With the app, you can digitally manage your stay:</p>
      <p>
        - Pre-Checkin / Pre-Checkout<br>
        - Order Food & Beverages<br>
        - Request Housekeeping<br>
        - Book Salon or Spa Services<br>
        - Chat with Hotel Staff<br>
        - Reserve Conference Halls or Community Spaces<br>
        - Access SOS & Concierge Services
      </p>

      <p><b>Important:</b> After downloading the app, please register with the same phone number used for this booking.</p>

      <p>If you're an international guest, ensure your phone number is active in India, or use a working Indian number updated with the hotel.</p>

      <p><b>Download the KnectHotel App:</b><br>
      Android: [Android App Link]<br>
      iOS: [iOS App Link]</p>

      <p>We look forward to welcoming you and making your stay exceptional!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending Guest Onboarding email:", error);
    // throw new Error("Failed to send Guest Onboarding email");
  }
}


module.exports = {
  sendResetEmail,
  sendSubscriptionConfirmation,
  sendRejectionEmail,
  sendComplaintRaisedEmail,
  sendGuestOnboarding,
  sendGuestBooking
};
