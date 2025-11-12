class ApiConst {
  //URLs
  static const String baseUrl = "http://13.203.33.208:3001";
  static const String authSendOtpUrl = "/api/auth/sendOTP";
  static const String authVerifyOtpUrl = "/api/auth/verifyOTP";
  static const String authResendOtpUrl = "/api/auth/resendOTP";
  static const String authLogoutUrl = "/api/auth/logout";

  //Common
  static const String paramData = "data";
  static const String paramUser = "user";
  static const String paramUserId = "userId";
  static const String paramStatus = "status";
  static const String paramMessage = "message";
  static const String paramFields = "fields";
  static const paramError = "error";

  //Authentication
  static const String paramToken = "token";
  static const String paramPhoneNo = "phoneNo";
  static const String paramCountryCode = "countryCode";
  static const String paramOtp = "otp";
}
