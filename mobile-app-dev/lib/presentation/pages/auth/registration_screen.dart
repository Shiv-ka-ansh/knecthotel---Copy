import 'package:country_phone_validator/country_phone_validator.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/gen/assets.gen.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/pages/auth/controller/registration_controller.dart';
import 'package:knecthotel/presentation/widgets/common_button.dart';
import 'package:knecthotel/presentation/widgets/phone_number.dart';

class RegistrationScreen extends GetView<RegistrationController> {
  const RegistrationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              Align(
                alignment: Alignment.center,
                child: Column(
                  children: [
                    Assets.images.appLogo.image(width: 180, height: 180),
                    const Text(
                      Strings.strAppName,
                      style: TextStyle(
                        fontFamily: FontFamily.openSansBold,
                        fontSize: 24,
                        color: AppColors.blackColor,
                      ),
                    ).paddingOnly(top: 10)
                  ],
                ),
              ).paddingOnly(top: 50, bottom: 50),
              PhoneNumberWidget(
                showLabel: true,
                showBorder: true,
                dialCode: controller.countryCode,
                hintText: Strings.strEnteryourMobileNumber,
                labelText: Strings.strEnterYourPhoneNumber,
                controller: controller.phoneNumberController,
                countryCodeColor: AppColors.blackColor,
              ).paddingOnly(bottom: 30),
              CommonButton(
                onPress: () {
                  bool isValid = CountryUtils.validatePhoneNumber(
                      controller.phoneNumberController.text.trim(),
                      controller.countryCode.value.trim());
                  if (isValid) {
                    Get.toNamed(RouteConst.verifyOtp);
                  } else {
                    controller.showErrorSnackbar(Strings.strInvalidPhoneNumber);
                  }
                },
                text: Strings.strSendOTP,
              ).paddingOnly(bottom: 40),
            ],
          ).paddingAll(25),
        ),
      ),
    );
  }
}
