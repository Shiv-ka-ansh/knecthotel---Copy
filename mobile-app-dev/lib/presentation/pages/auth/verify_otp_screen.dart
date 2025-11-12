import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/gen/assets.gen.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/pages/auth/controller/verify_otp_controller.dart';
import 'package:knecthotel/presentation/widgets/common_button.dart';
import 'package:pinput/pinput.dart';

class VerifyOtpScreen extends GetView<VerifyOtpController> {
  const VerifyOtpScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: AppBar(
        backgroundColor: AppColors.transparentColor,
        title: const Text(
          Strings.strVerification,
          style: TextStyle(
            color: AppColors.blackColor,
            fontFamily: FontFamily.openSansBold,
          ),
        ),
        centerTitle: true,
        elevation: 0,
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Center(
              child: Text(
            Strings.strEnterVerificationCodeLong,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 18,
              color: AppColors.blackColor,
              fontFamily: FontFamily.openSansMedium,
            ),
          )).paddingOnly(left: 20, right: 20, top: 25),
          const Text(
            Strings.strEnterVerificationCode,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 16,
              color: AppColors.blackColor,
              fontFamily: FontFamily.openSansMedium,
            ),
          ).paddingOnly(top: 30),
          Pinput(
            onChanged: (val) {
              controller.otp.value = val;
            },
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            length: controller.pinLength,
            defaultPinTheme: PinTheme(
              height: 62,
              width: 68,
              decoration: BoxDecoration(
                color: AppColors.whiteColor,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.borderColor),
              ),
            ),
            focusedPinTheme: PinTheme(
              height: 62,
              width: 68,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.blackColor),
              ),
            ),
          ).paddingOnly(top: 25),
          //const Spacer(),
          CommonButton(
                  onPress: () {
                    if (controller.otp.value.length < controller.pinLength) {
                      controller.showErrorSnackbar(Strings.strIncorrectOTP);
                      return;
                    }
                    _showAuthSuccessDialog(context);
                    Future.delayed(const Duration(seconds: 1), () {
                      Get.back();
                      Get.toNamed(RouteConst.createAccount);
                    });
                  },
                  text: Strings.strVerifyOTP)
              .paddingOnly(top: 25),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Obx(
                () => Text(
                  controller.formattedTime,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 16,
                    color: AppColors.blackColor,
                    fontFamily: FontFamily.openSansRegular,
                  ),
                ),
              ),
              const Text(
                Strings.strResendOtp,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16,
                  color: AppColors.blackColor,
                  fontFamily: FontFamily.openSansRegular,
                ),
              )
            ],
          ).paddingOnly(top: 20, left: 10, right: 10),
          const Center(
            child: Text(
              Strings.strIncorrectOTP,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16,
                color: AppColors.errorColor,
                fontFamily: FontFamily.openSansMedium,
              ),
            ),
          ).paddingOnly(top: 15),
        ],
      ).paddingAll(25),
    );
  }

  _showAuthSuccessDialog(BuildContext context) {
    return showDialog(
      context: context,
      builder: (context) => GestureDetector(
        onTap: () => Get.back(),
        child: Material(
          type: MaterialType.transparency,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 34),
                decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(15),
                    gradient: const LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [AppColors.whiteColor, AppColors.textFieldBg])),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Assets.images.appLogo
                        .image(height: 94, width: 94)
                        .paddingOnly(bottom: 34),
                    const Text(
                      Strings.strACCOUNTCREATEDSUCCESSFULLY,
                      style: TextStyle(
                          fontFamily: FontFamily.openSansSemiBold,
                          fontSize: 20),
                      textAlign: TextAlign.center,
                    )
                  ],
                ).paddingAll(23),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
