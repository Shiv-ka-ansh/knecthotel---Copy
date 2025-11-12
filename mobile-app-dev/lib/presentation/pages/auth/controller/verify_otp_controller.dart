import 'dart:async';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';

class VerifyOtpController extends GetxController {
  //final AuthRepository _authRepository = Get.find<AuthRepository>();
  final int pinLength = 4;
  late final String phoneNo;
  late final String countryCode;
  final RxString otpStatusText = ''.obs;
  final RxString otp = ''.obs;

  final RxInt totalSeconds = 600.obs; // e.g. 10 minutes
  Timer? _timer;

  String get formattedTime {
    final minutes = (totalSeconds.value ~/ 60).toString().padLeft(2, '0');
    final seconds = (totalSeconds.value % 60).toString().padLeft(2, '0');
    return "$minutes:$seconds";
  }

  void startTimer({int from = 30}) {
    totalSeconds.value = from;
    _timer?.cancel();

    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (totalSeconds.value > 0) {
        totalSeconds.value--;
      } else {
        timer.cancel();
      }
    });
  }

  @override
  void onInit() {
    super.onInit();
    startTimer(from: 30);
  }

  @override
  void onClose() {
    _timer?.cancel();
    super.onClose();
  }

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
}
