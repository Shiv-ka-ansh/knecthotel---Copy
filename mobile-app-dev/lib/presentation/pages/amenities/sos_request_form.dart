import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/gen/assets.gen.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/widgets/common_button.dart';
import 'package:knecthotel/presentation/widgets/common_dropdown.dart';
import 'package:knecthotel/presentation/widgets/common_textfield.dart';

import 'controller/sos_request_form_controller.dart';

class SosRequestForm extends GetView<SosRequestFormController> {
  const SosRequestForm({super.key});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          decoration: BoxDecoration(
            image: DecorationImage(
              image: AssetImage(Assets.images.sosBg.path),
              fit: BoxFit.cover,
            ),
          ),
        ),
        Scaffold(
          backgroundColor: AppColors.transparentColor,
          appBar: AppBar(
            backgroundColor: AppColors.transparentColor,
            title: const Text(
              Strings.strSOSRequestForm,
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
              SizedBox(
                width: 250,
                child: CommonTextfield(
                  textColor: Colors.black54,
                  textSize: 16,
                  contentPadding: const EdgeInsets.symmetric(
                    vertical: 10,
                    horizontal: 20,
                  ),
                  controller: controller.roomNumberController,
                  title: Strings.strRoomNumber,
                ),
              ).paddingOnly(bottom: 20),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    Strings.strDateAndTime,
                    style: TextStyle(
                      color: Colors.black54,
                      fontSize: 16,
                      fontFamily: FontFamily.openSansSemiBold,
                    ),
                  ).paddingOnly(bottom: 10),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: AppColors.textFieldBg,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          '13/03/25',
                          style: TextStyle(
                            color: Colors.black54,
                            fontSize: 16,
                            fontFamily: FontFamily.openSansMedium,
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: AppColors.textFieldBg,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          '10:45 AM',
                          style: TextStyle(
                            color: Colors.black54,
                            fontSize: 16,
                            fontFamily: FontFamily.openSansMedium,
                          ),
                        ),
                      ),
                    ],
                  ).paddingOnly(bottom: 20),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        Strings.strEstimatedResponseTime,
                        style: TextStyle(
                          color: Colors.black54,
                          fontSize: 16,
                          fontFamily: FontFamily.openSansSemiBold,
                        ),
                      ).paddingOnly(bottom: 10),
                      Container(
                        width: 180,
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.textFieldBg,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Obx(
                          () => Center(
                            child: Text(
                              controller.formattedTime,
                              style: const TextStyle(
                                color: Colors.black54,
                                fontSize: 16,
                                fontFamily: FontFamily.openSansMedium,
                              ),
                            ),
                          ),
                        ),
                      )
                    ],
                  ).paddingOnly(bottom: 20),
                  SizedBox(
                    width: 250,
                    child: CommonDropdown(
                      borderRadius: 10,
                      textSize: 16,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 1,
                      ),
                      title: Strings.strEmergencyType,
                      items: controller.emergencyTypes,
                      hint: '',
                      selectedOption: controller.selectedEmergencyType,
                    ).paddingOnly(bottom: 20),
                  ),
                ],
              ).paddingOnly(bottom: 20),
              const Spacer(),
              CommonButton(
                bgColor: AppColors.errorColor,
                onPress: () {},
                text: Strings.strSend,
              ).paddingOnly(bottom: 40),
            ],
          ).paddingAll(25),
        ),
      ],
    );
  }
}
