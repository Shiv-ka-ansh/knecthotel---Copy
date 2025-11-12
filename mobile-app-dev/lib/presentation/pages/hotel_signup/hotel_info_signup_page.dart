import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/widgets/common_button.dart';
import 'package:knecthotel/presentation/widgets/common_dropdown.dart';
import 'package:knecthotel/presentation/widgets/common_textfield.dart';
import 'package:knecthotel/presentation/widgets/phone_number.dart';

import 'controller/hotel_info_signup_page_controller.dart';

class HotelInfoSignupPage extends GetView<HotelInfoSignupPageController> {
  const HotelInfoSignupPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: AppBar(
        backgroundColor: AppColors.transparentColor,
        title: const Text(
          Strings.strSignUpForHotel,
          style: TextStyle(
            color: AppColors.blackColor,
            fontFamily: FontFamily.openSansBold,
          ),
        ),
        centerTitle: true,
        elevation: 0,
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.fromLTRB(20, 0, 20, 30),
        child: CommonButton(
          onPress: () {
            Get.toNamed(RouteConst.hotelFeatureSignup);
          },
          text: Strings.strSave,
        ),
      ),
      body: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _progressStep(context, Strings.strHotelInfo, true),
              _progressStep(context, Strings.strFeatures, false),
              _progressStep(context, Strings.strCompatibility, false),
            ],
          ).paddingSymmetric(vertical: 10),
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                children: [
                  hotelGeneralForm(),
                  const SizedBox(height: 20),
                  hotelAddressForm(),
                ],
              ).paddingAll(15),
            ),
          ),
        ],
      ),
    );
  }

  Widget hotelGeneralForm() {
    return Card(
      color: AppColors.scaffoldBg,
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
      ),
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          children: [
            CommonTextfield(
              controller: controller.hotelNameController,
              title: Strings.strHotelName,
            ).paddingOnly(bottom: 10),
            CommonDropdown(
              title: Strings.strHotelCategory,
              items: controller.hotelCategoryList,
              hint: '',
              selectedOption: controller.selectedhotelCategory,
            ),
            PhoneNumberWidget(
              fillColor: AppColors.textFieldBg,
              controller: controller.hotelPhoneController,
              dialCode: controller.dialCode,
            ).paddingOnly(bottom: 10),
            CommonTextfield(
              controller: controller.hotelEmailController,
              title: Strings.strEmail,
            ).paddingOnly(bottom: 10),
          ],
        ),
      ),
    );
  }

  Widget hotelAddressForm() {
    return Card(
      color: AppColors.scaffoldBg,
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
      ),
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          children: [
            CommonTextfield(
              controller: controller.hotelAddressController,
              title: Strings.strAddress,
            ).paddingOnly(bottom: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  flex: 5,
                  child: CommonTextfield(
                    controller: controller.hotelCityController,
                    title: Strings.strCity,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  flex: 5,
                  child: CommonTextfield(
                    controller: controller.hotelStateController,
                    title: Strings.strState,
                  ),
                ),
              ],
            ).paddingOnly(bottom: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  flex: 5,
                  child: CommonTextfield(
                    controller: controller.hotelCountryController,
                    title: Strings.strCountry,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  flex: 5,
                  child: CommonTextfield(
                    controller: controller.hotelPinCodeController,
                    title: Strings.strPinCode,
                    keyboardType: TextInputType.number,
                  ),
                ),
              ],
            ).paddingOnly(bottom: 10),
          ],
        ),
      ),
    );
  }

  // Progress Indicator Step
  Widget _progressStep(context, String text, bool isActive) {
    return Row(
      children: [
        Container(
          width: (MediaQuery.of(context).size.width / 7.8),
          height: 2,
          decoration: const BoxDecoration(
            shape: BoxShape.rectangle,
            color: AppColors.primaryDarkColor,
          ),
        ),
        CircleAvatar(
          backgroundColor: isActive ? AppColors.primaryDarkColor : Colors.grey,
          radius: 6,
          child: const Center(
            child: Icon(
              Icons.check,
              size: 10,
              color: AppColors.whiteColor,
            ),
          ),
        ),
        const SizedBox(width: 4),
        Text(
          text,
          style: const TextStyle(
            fontSize: 11,
            fontFamily: FontFamily.openSansRegular,
          ),
        ),
      ],
    );
  }
}
