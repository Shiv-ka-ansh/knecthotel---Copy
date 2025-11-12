import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/pages/onboarding/controller/language_selection_controller.dart';
import 'package:knecthotel/presentation/widgets/common_button.dart';

class LanguageSelection extends GetView<LanguageSelectionController> {
  const LanguageSelection({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: AppBar(
        backgroundColor: AppColors.transparentColor,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.blackColor),
          onPressed: () {
            Get.back();
          },
        ),
        title: const Text(
          Strings.strLanguage,
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
          onPress: () {
            Get.toNamed(RouteConst.selectSignup);
          },
          text: Strings.strDone,
        ),
      ),
      body: Column(
        children: [
          const Text(
            Strings.strSelectPreferredLanguage,
            style: TextStyle(
              fontSize: 16,
              color: AppColors.blackColor,
              fontFamily: FontFamily.openSansSemiBold,
            ),
          ).paddingOnly(bottom: 10),
          Expanded(
            child: ListView.separated(
              itemCount: controller.languages.length,
              itemBuilder: (context, index) {
                final language = controller.languages[index];
                return Obx(
                  () => Container(
                    margin:
                        const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: AppColors.borderColor,
                      ),
                      color: Colors.white,
                    ),
                    child: RadioListTile<String>(
                      value: language,
                      groupValue: controller.selectedLanguage.value,
                      onChanged: (value) {
                        controller.selectedLanguage.value = value!;
                      },
                      title: Text(
                        language,
                        style: TextStyle(
                          fontSize: 18,
                          color: AppColors.blackColor,
                          fontFamily:
                              controller.selectedLanguage.value == language
                                  ? FontFamily.openSansBold
                                  : FontFamily.openSansMedium,
                        ),
                      ),
                      activeColor: AppColors.blackColor,
                      controlAffinity: ListTileControlAffinity.leading,
                    ),
                  ),
                );
              },
              separatorBuilder: (context, index) => const SizedBox(height: 15),
            ),
          ),
        ],
      ).paddingAll(10),
    );
  }
}
