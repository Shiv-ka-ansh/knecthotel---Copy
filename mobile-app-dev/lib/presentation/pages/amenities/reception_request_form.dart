import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/pages/amenities/controller/reception_request_controller.dart';
import 'package:knecthotel/presentation/widgets/common_button.dart';
import 'package:knecthotel/presentation/widgets/common_dropdown.dart';
import 'package:knecthotel/presentation/widgets/common_textfield.dart';

class ReceptionRequestForm extends GetView<ReceptionRequestController> {
  const ReceptionRequestForm({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: AppBar(
        backgroundColor: AppColors.transparentColor,
        title: const Text(
          Strings.strReceptionRequestForm,
          style: TextStyle(
            color: AppColors.blackColor,
            fontFamily: FontFamily.openSansBold,
          ),
        ),
        centerTitle: true,
        elevation: 0,
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.fromLTRB(25, 0, 25, 30),
        child: CommonButton(
          onPress: () async {
            await Get.dialog(
              barrierDismissible: true,
              useSafeArea: true,
              GestureDetector(
                onTap: () => Get.back(),
                child: Dialog(
                  child: Container(
                    width: 300,
                    height: 190,
                    decoration: BoxDecoration(
                      color: AppColors.primaryDarkColor,
                      borderRadius: BorderRadius.circular(12),
                      border:
                          Border.all(color: AppColors.whiteColor, width: 1.5),
                    ),
                    child: const Center(
                      child: Padding(
                        padding: EdgeInsets.all(30),
                        child: Text(Strings.strRequestSubmitted,
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
            );
            Get.toNamed(RouteConst.requestStatusPage, arguments: {
              'requestType': controller.selectedRequestType.value,
              'description': controller.descriptionController.text,
              'from': RouteConst.receptionRequestFormPage,
            });
          },
          text: Strings.strDone,
        ),
      ),
      body: Column(
        children: [
          CommonDropdown(
            title: Strings.strSelectRequestType,
            items: Strings.lstReceptionRequestType,
            hint: '',
            selectedOption: controller.selectedRequestType,
          ).paddingOnly(bottom: 20),
          CommonTextfield(
            title: Strings.strTypeShortDescription,
            controller: controller.descriptionController,
            maxLines: 3,
          ).paddingOnly(bottom: 20),
        ],
      ).paddingAll(25),
    );
  }
}
