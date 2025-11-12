import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/gen/assets.gen.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/pages/onboarding/controller/select_signup_page_controller.dart';
import 'package:knecthotel/presentation/widgets/common_button.dart';

class SelectSignupPage extends GetView<SelectSignupPageController> {
  const SelectSignupPage({super.key});

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
              ).paddingOnly(top: 50, bottom: 100),
              CommonButton(
                onPress: () {
                  Get.toNamed(RouteConst.hotelInfoSignup,
                      arguments: {'name': Strings.strSignupAsHotel});
                },
                text: Strings.strSignupAsHotel,
              ).paddingOnly(bottom: 20),
              CommonButton(
                onPress: () {
                  Get.toNamed(RouteConst.registration,
                      arguments: {'name': Strings.strSignupAsGuest});
                },
                text: Strings.strSignupAsGuest,
              ).paddingOnly(bottom: 40),
            ],
          ).paddingAll(25),
        ),
      ),
    );
  }
}
