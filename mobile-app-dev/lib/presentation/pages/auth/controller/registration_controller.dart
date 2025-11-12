import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';

class RegistrationController extends GetxController {
  //final AuthRepository _authRepository = Get.find<AuthRepository>();
  final phoneNumberController = TextEditingController();
  final countryCode = "+91".obs;

  // void sendOtp() async {
  //   final phoneNo = phoneNumberController.text.trim();
  //   final code = countryCode.value.trim();

  //   bool isValid = CountryUtils.validatePhoneNumber(phoneNo, code);
  //   if (isValid) {
  //     final result = await _authRepository.sendOtp(phoneNo, code);
  //     if (result[ApiConst.paramStatus]) {
  //       Get.toNamed(RouteConst.verifyOtp, arguments: {
  //         ApiConst.paramPhoneNo: phoneNo,
  //         ApiConst.paramCountryCode: code,
  //       });
  //     } else {
  //       _showErrorSnackbar(
  //           result[ApiConst.paramMessage] ?? Strings.strOtpError);
  //     }
  //   } else {
  //     _showErrorSnackbar(Strings.strInvalidPhoneNumber);
  //   }
  // }

  void showErrorSnackbar(String message) {
    Get.snackbar(
      Strings.strLoginError,
      message,
      backgroundColor: AppColors.textFieldBg,
      colorText: AppColors.blackColor,
      snackPosition: SnackPosition.BOTTOM,
      icon: const Icon(Icons.error),
    );
  }

  @override
  onClose() {
    phoneNumberController.dispose();
    super.onClose();
  }
}
