import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../gen/fonts.gen.dart';
import '../config/app_colors.dart';

class SnackBarUtil {
  static void showSnackBar(
      {String? title,
      required String message,
      Duration? duration,
      bool? success}) {
    Get.closeCurrentSnackbar();
    Get.showSnackbar(GetSnackBar(
      messageText: Text(
        message,
        style: const TextStyle(
            color: AppColors.whiteColor,
            fontSize: 15,
            fontFamily: FontFamily.openSansSemiBold),
      ),
      margin: const EdgeInsets.only(left: 10, right: 10, bottom: 10),
      animationDuration: const Duration(milliseconds: 600),
      duration: duration ?? const Duration(seconds: 6),
      snackPosition: SnackPosition.BOTTOM,
      borderRadius: 20,
      boxShadows: [
        BoxShadow(
            color: AppColors.primaryColor.withOpacity(0.3), blurRadius: 10)
      ],
      barBlur: 0,
      backgroundColor: (success ?? false)
          ? AppColors.primaryColor
          : AppColors.primaryColor.withOpacity(0.1),
      snackStyle: SnackStyle.FLOATING,

      // backgroundGradient: LinearGradient(
      //     begin: Alignment.topLeft,
      //     end: Alignment.bottomRight,
      //     colors: [AppColors.primaryDarkColor, AppColors.primaryLightColor]),
    ));
  }
}
