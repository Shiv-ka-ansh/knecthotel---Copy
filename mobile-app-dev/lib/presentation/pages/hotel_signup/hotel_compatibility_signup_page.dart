import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_dash/flutter_dash.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/pages/hotel_signup/controller/hotel_compatibility_signup_page_controller.dart';
import 'package:knecthotel/presentation/widgets/common_button.dart';
import 'package:knecthotel/presentation/widgets/common_textfield.dart';

class HotelCompatibilitySignupPage
    extends GetView<HotelCompatibilitySignupPageController> {
  const HotelCompatibilitySignupPage({super.key});

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
            showSubmitPopup();
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
              _progressStep(context, Strings.strFeatures, true),
              _progressStep(context, Strings.strCompatibility, true),
            ],
          ).paddingSymmetric(vertical: 10),
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                children: [hotelCompatibilitySection(context)],
              ).paddingAll(15),
            ),
          ),
        ],
      ),
    );
  }

  Widget hotelCompatibilitySection(context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          Strings.strCompatibility,
          style: TextStyle(
            fontSize: 14,
            fontFamily: FontFamily.openSansMedium,
            color: Colors.black54,
          ),
        ).paddingOnly(bottom: 10, left: 10),
        Card(
          color: AppColors.scaffoldBg,
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          child: Padding(
            padding: const EdgeInsets.all(15),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildToggleRow(
                  Strings.strInternetConnectivity,
                  controller.internetConnectivitySwitch,
                ),
                _buildToggleRow(
                  Strings.strSoftwareCompatibility,
                  controller.softwareCompatibilitySwitch,
                ),
                const SizedBox(height: 10),
                _buildDocumentUploadRow(
                    Strings.strHotelLicense, controller.hotelLicenseImage),
                _buildDocumentUploadRow(Strings.strBusinessLicense,
                    controller.businessLicenseImage),
                _buildDocumentUploadRow(
                    Strings.strTouristLicense, controller.touristLicenseImage),
                _buildDocumentUploadRow(
                    Strings.strTinNumber, controller.tinNumberImage),
                _buildGSTDetails(context).paddingOnly(top: 20),
                _buildCheckboxRow(Strings.strDataPrivacyAndGdpr,
                    controller.dataPrivacyCheckbox),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildGSTDetails(context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          Strings.strGstDetails,
          style: TextStyle(
            fontFamily: FontFamily.openSansMedium,
            fontSize: 16,
            color: Colors.black54,
          ),
        ),
        const SizedBox(height: 10),
        Dash(
          direction: Axis.horizontal,
          length: MediaQuery.of(context).size.width - 80,
          dashLength: 2,
          dashColor: Colors.grey,
        ).paddingSymmetric(vertical: 10),
        CommonTextfield(
          controller: controller.gstController,
          title: Strings.strGstinNumber,
        ),
        _buildDocumentUploadRow('', controller.gstinNumberImage),
        Dash(
          direction: Axis.horizontal,
          length: MediaQuery.of(context).size.width - 80,
          dashLength: 2,
          dashColor: Colors.grey,
        ).paddingSymmetric(vertical: 10),
      ],
    );
  }

  Widget _buildToggleRow(String title, RxBool switchController) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 14,
            fontFamily: FontFamily.openSansRegular,
          ),
        ),
        Obx(
          () => Switch(
              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              activeColor: AppColors.primaryColor,
              activeTrackColor: AppColors.primaryDarkColor,
              inactiveThumbColor: AppColors.primaryDarkColor,
              inactiveTrackColor: AppColors.textFieldBg,
              value: switchController.value,
              onChanged: (val) {
                switchController.value = val;
              }),
        )
      ],
    ).paddingSymmetric(vertical: 5);
  }

  Widget _buildDocumentUploadRow(String title, Rx<File?> selectedImage) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 14,
            fontFamily: FontFamily.openSansRegular,
          ),
        ).paddingOnly(bottom: 5),
        Row(
          children: [
            GestureDetector(
              onTap: () async {
                await controller.pickImageFromGallery(selectedImage);
              },
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                decoration: BoxDecoration(
                  color: AppColors.textFieldBg,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text(
                  Strings.strUploadImage,
                  style: TextStyle(
                    fontSize: 14,
                    fontFamily: FontFamily.openSansRegular,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Obx(
              () => selectedImage.value != null
                  ? Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.file(
                            selectedImage.value!,
                            width: 50,
                            height: 50,
                            fit: BoxFit.cover,
                          ),
                        ),
                        const SizedBox(width: 10),
                        GestureDetector(
                          onTap: () => selectedImage.value = null,
                          child: const Icon(Icons.close,
                              color: AppColors.primaryDarkColor),
                        ),
                      ],
                    )
                  : const Icon(Icons.upload, color: AppColors.primaryDarkColor),
            ),
          ],
        ),
        const Text(
          Strings.strRequiredImageSize,
          style: TextStyle(
            color: AppColors.errorColor,
            fontSize: 11,
            fontFamily: FontFamily.openSansRegular,
          ),
        ).paddingOnly(top: 2, bottom: 10),
      ],
    );
  }

  Widget _buildCheckboxRow(String title, RxBool checkController) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Text(
            title,
            style: const TextStyle(
              fontSize: 14,
              fontFamily: FontFamily.openSansRegular,
            ),
          ),
        ),
        Obx(
          () => Checkbox(
              activeColor: AppColors.primaryDarkColor,
              value: checkController.value,
              onChanged: (val) {
                checkController.value = val ?? false;
              }),
        ) // Hook with controller
      ],
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

  void showSubmitPopup() {
    Get.dialog(
      barrierDismissible: true,
      useSafeArea: true,
      GestureDetector(
        onTap: () => Get.back(),
        child: Dialog(
          child: SingleChildScrollView(
            child: Container(
              width: 300,
              height: 200,
              decoration: BoxDecoration(
                color: AppColors.primaryDarkColor,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.whiteColor, width: 1.5),
              ),
              child: const Center(
                child: Padding(
                  padding: EdgeInsets.all(30),
                  child: Text(Strings.strSubmitMessage,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: AppColors.whiteColor,
                        fontFamily: FontFamily.openSansMedium,
                        fontSize: 20,
                      )),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
