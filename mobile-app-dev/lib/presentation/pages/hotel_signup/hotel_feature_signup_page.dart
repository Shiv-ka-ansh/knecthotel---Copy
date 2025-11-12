import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/pages/hotel_signup/controller/hotel_feature_signup_page_controller.dart';
import 'package:knecthotel/presentation/widgets/common_button.dart';
import 'package:knecthotel/presentation/widgets/common_textfield.dart';
import 'package:knecthotel/presentation/widgets/phone_number.dart';
import 'package:multi_dropdown/multi_dropdown.dart';

class HotelFeatureSignupPage extends GetView<HotelFeatureSignupPageController> {
  const HotelFeatureSignupPage({super.key});

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
            Get.toNamed(RouteConst.hotelCompatibilitySignup);
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
              _progressStep(context, Strings.strCompatibility, false),
            ],
          ).paddingSymmetric(vertical: 10),
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                children: [
                  hotelRoomForm(),
                  const SizedBox(height: 20),
                  hotelServingDepartments(context),
                ],
              ).paddingAll(15),
            ),
          ),
        ],
      ),
    );
  }

  Widget hotelRoomForm() {
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
              controller: controller.hotelNoOfRoomsController,
              title: Strings.strNumberOfRooms,
              keyboardType: TextInputType.number,
            ).paddingOnly(bottom: 10),
            CommonTextfield(
              controller: controller.hotelNoOfStaffController,
              title: Strings.strNumberOfStaff,
              keyboardType: TextInputType.number,
            ).paddingOnly(bottom: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  Strings.strRoomTypes,
                  style: TextStyle(
                    fontSize: 14,
                    fontFamily: FontFamily.openSansSemiBold,
                  ),
                ).paddingOnly(bottom: 10),
                MultiDropdown<String>(
                  controller: controller.rootTypeController,
                  fieldDecoration: FieldDecoration(
                    labelText: '',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(
                        color: AppColors.primaryColor,
                      ),
                    ),
                    backgroundColor: AppColors.textFieldBg,
                  ),
                  dropdownItemDecoration: const DropdownItemDecoration(
                    backgroundColor: AppColors.primaryDarkColor,
                    selectedBackgroundColor: AppColors.primaryColor,
                    selectedTextColor: AppColors.whiteColor,
                    textColor: AppColors.whiteColor,
                  ),
                  items: controller.roomTypes.map((option) {
                    return DropdownItem<String>(
                      label: option,
                      value: option,
                    );
                  }).toList(),
                ),
              ],
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  Strings.strFeatures,
                  style: TextStyle(
                    fontSize: 14,
                    fontFamily: FontFamily.openSansSemiBold,
                  ),
                ).paddingOnly(bottom: 10),
                MultiDropdown<String>(
                  controller: controller.roomFeatureController,
                  fieldDecoration: FieldDecoration(
                    labelText: '',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(
                        color: AppColors.primaryColor,
                      ),
                    ),
                    backgroundColor: AppColors.textFieldBg,
                  ),
                  dropdownItemDecoration: const DropdownItemDecoration(
                    backgroundColor: AppColors.primaryDarkColor,
                    selectedBackgroundColor: AppColors.primaryColor,
                    selectedTextColor: AppColors.whiteColor,
                    textColor: AppColors.whiteColor,
                  ),
                  items: controller.roomFeatures.map((option) {
                    return DropdownItem<String>(
                      label: option,
                      value: option,
                    );
                  }).toList(),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget hotelServingDepartments(context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          Strings.strServingDepartments,
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
            padding: const EdgeInsets.all(8.0),
            child: Column(
              children: [
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: controller.servingDepartments.length,
                  separatorBuilder: (context, index) =>
                      const SizedBox(height: 5),
                  itemBuilder: (context, index) {
                    final department = controller.servingDepartments[index];

                    return ListTile(
                      title: Text(
                        department.name,
                        style: const TextStyle(
                          fontSize: 14,
                          fontFamily: FontFamily.openSansMedium,
                          color: AppColors.blackColor,
                        ),
                      ),
                      trailing: Obx(
                        () => Checkbox(
                            activeColor: AppColors.primaryDarkColor,
                            value: department.isSelected.value,
                            onChanged: (val) {
                              department.isSelected.value = val ?? false;
                            }),
                      ),
                    );
                  },
                ),
                hotelContactForm(context).paddingOnly(top: 20),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget hotelContactForm(context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              flex: 5,
              child: CommonTextfield(
                isReadOnly: true,
                controller: controller.checkInTimeController,
                title: Strings.strRequestTime,
                suffix: const Icon(Icons.access_time),
                onTap: () async {
                  var time = await showTimePicker(
                    initialTime: TimeOfDay.now(),
                    context: context,
                    builder: (context, child) => Theme(
                      data: ThemeData.light().copyWith(
                        colorScheme: const ColorScheme.light().copyWith(
                          primary: AppColors.primaryColor,
                        ),
                      ),
                      child: child!,
                    ),
                  );
                  if (time != null) {
                    controller.checkInTimeController.text =
                        time.format(context);
                  }
                },
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              flex: 5,
              child: CommonTextfield(
                isReadOnly: true,
                controller: controller.checkOutTimeController,
                title: Strings.strRequestTime,
                suffix: const Icon(Icons.access_time),
                onTap: () async {
                  var time = await showTimePicker(
                    initialTime: TimeOfDay.now(),
                    context: context,
                    builder: (context, child) => Theme(
                      data: ThemeData.light().copyWith(
                        colorScheme: const ColorScheme.light().copyWith(
                          primary: AppColors.primaryColor,
                        ),
                      ),
                      child: child!,
                    ),
                  );
                  if (time != null) {
                    controller.checkOutTimeController.text =
                        time.format(context);
                  }
                },
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
                controller: controller.hotelEmailController,
                title: Strings.strEmail,
                keyboardType: TextInputType.emailAddress,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              flex: 5,
              child: PhoneNumberWidget(
                showBorder: false,
                fillColor: AppColors.textFieldBg,
                controller: controller.hotelPhoneController,
                dialCode: controller.dialCode,
              ),
            ),
          ],
        ).paddingOnly(bottom: 10),
        const Text(
          Strings.strFillOnlyHotelPointOfContact,
          style: TextStyle(
            fontSize: 12,
            fontFamily: FontFamily.openSansRegular,
            color: AppColors.errorColor,
          ),
        ).paddingOnly(bottom: 10),
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
}
