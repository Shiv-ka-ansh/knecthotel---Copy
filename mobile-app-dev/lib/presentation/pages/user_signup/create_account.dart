import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/pages/user_signup/controller/create_account_controller.dart';
import 'package:knecthotel/presentation/widgets/common_button.dart';
import 'package:knecthotel/presentation/widgets/common_textfield.dart';

class CreateAccount extends GetView<CreateAccountController> {
  const CreateAccount({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.fromLTRB(25, 0, 25, 30),
        child: CommonButton(
          onPress: () {
            Get.toNamed(RouteConst.selectDocuments);
          },
          text: Strings.strContinue,
        ),
      ),
      body: SafeArea(
          child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: const Text(
                Strings.strLetsGetStarted,
                style: TextStyle(
                  fontSize: 26,
                  color: AppColors.blackColor,
                  fontFamily: FontFamily.openSansBold,
                ),
              ).paddingOnly(bottom: 35, top: 20),
            ),
            CommonTextfield(
              controller: controller.firstNameController,
              title: Strings.strFirstName,
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 15, vertical: 15),
            ).paddingOnly(bottom: 20),
            CommonTextfield(
              controller: controller.lastNameController,
              title: Strings.strLastName,
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 15, vertical: 15),
            ).paddingOnly(bottom: 20),
            CommonTextfield(
              controller: controller.dobController,
              title: Strings.strBirthDay,
              isReadOnly: true,
              onTap: () async {
                var date = await showDatePicker(
                  context: context,
                  lastDate: DateTime.now(),
                  firstDate: DateTime(1900),
                  builder: (context, child) => Theme(
                      data: ThemeData.light().copyWith(
                          colorScheme: const ColorScheme.light()
                              .copyWith(primary: AppColors.primaryColor)),
                      child: child!),
                );
                if (date != null) {
                  controller.dobController.text =
                      DateFormat("dd/MM/yyyy").format(date);
                }
              },
            ).paddingOnly(bottom: 20),
            CommonTextfield(
              controller: controller.anniversaryController,
              title: Strings.strAnniversary,
              isReadOnly: true,
              onTap: () async {
                var date = await showDatePicker(
                  context: context,
                  lastDate: DateTime.now(),
                  firstDate: DateTime(1900),
                  builder: (context, child) => Theme(
                      data: ThemeData.light().copyWith(
                          colorScheme: const ColorScheme.light()
                              .copyWith(primary: AppColors.primaryColor)),
                      child: child!),
                );
                if (date != null) {
                  controller.anniversaryController.text =
                      DateFormat("dd/MM/yyyy").format(date);
                }
              },
            ).paddingOnly(bottom: 20),
            Row(
              children: [
                Obx(() => Checkbox(
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(5)),
                      side: const BorderSide(
                          width: 1, color: AppColors.primaryColor),
                      activeColor: AppColors.primaryColor,
                      value: controller.termsAccepted.value,
                      onChanged: (value) {
                        controller.termsAccepted.value = value!;
                      },
                    )),
                const Expanded(
                  child: Text.rich(TextSpan(children: [
                    TextSpan(
                      text: Strings.strByClickingYouAgreeToOur,
                      style: TextStyle(
                        fontFamily: FontFamily.openSansRegular,
                        fontSize: 14,
                        color: Colors.black54,
                      ),
                    ),
                    TextSpan(
                      text: Strings.strTermsCondition,
                      style: TextStyle(
                        fontFamily: FontFamily.openSansRegular,
                        fontSize: 14,
                        color: AppColors.errorColor,
                      ),
                    ),
                    TextSpan(
                      text: "and",
                      style: TextStyle(
                        fontFamily: FontFamily.openSansRegular,
                        fontSize: 14,
                        color: Colors.black54,
                      ),
                    ),
                    TextSpan(
                      text: Strings.strPrivacyPolicy,
                      style: TextStyle(
                        fontFamily: FontFamily.openSansRegular,
                        fontSize: 14,
                        color: AppColors.errorColor,
                      ),
                    )
                  ])),
                )
              ],
            ).paddingOnly(bottom: 20),
          ],
        ).paddingAll(25),
      )),
    );
  }
}
