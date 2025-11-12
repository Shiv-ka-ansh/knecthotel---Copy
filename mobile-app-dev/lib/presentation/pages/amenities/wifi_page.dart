import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/gen/assets.gen.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/pages/amenities/controller/wifi_page_controller.dart';
import 'package:knecthotel/presentation/widgets/common_textfield.dart';

class WifiPage extends GetView<WifiPageController> {
  const WifiPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: AppBar(
        backgroundColor: AppColors.transparentColor,
        title: const Text(
          Strings.strWifiAccess,
          style: TextStyle(
            color: AppColors.blackColor,
            fontFamily: FontFamily.openSansBold,
          ),
        ),
        centerTitle: true,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Assets.images.room5.image(),
                ),
                const SizedBox(
                  width: 15,
                ),
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      Strings.strRoomNumber,
                      style: TextStyle(
                        fontSize: 18,
                        color: Colors.black54,
                        fontFamily: FontFamily.openSansRegular,
                      ),
                    ),
                    Text(
                      '503',
                      style: TextStyle(
                        fontSize: 18,
                        color: AppColors.blackColor,
                        fontFamily: FontFamily.openSansMedium,
                      ),
                    ),
                  ],
                )
              ],
            ).paddingOnly(top: 10),
            Column(
              children: [
                CommonTextfield(
                  isReadOnly: true,
                  controller: controller.wifiController,
                  title: Strings.strWifiName,
                  suffix: IconButton(
                    onPressed: () {
                      Clipboard.setData(ClipboardData(
                          text: controller.passwordController.text.trim()));
                      Get.snackbar(
                        "Copied",
                        "${Strings.strWifiName} copied to clipboard!",
                        snackPosition: SnackPosition.BOTTOM,
                        duration: const Duration(seconds: 2),
                        backgroundColor: AppColors.primaryDarkColor,
                        colorText: Colors.white,
                      );
                    },
                    icon: const Icon(
                      Icons.copy,
                      color: AppColors.blackColor,
                    ),
                  ),
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 15, vertical: 15),
                ).paddingOnly(bottom: 20),
                CommonTextfield(
                  isReadOnly: true,
                  controller: controller.passwordController,
                  title: Strings.strPassword,
                  suffix: IconButton(
                    onPressed: () {
                      Clipboard.setData(ClipboardData(
                          text: controller.passwordController.text.trim()));
                      Get.snackbar(
                        "Copied",
                        "${Strings.strPassword} copied to clipboard!",
                        snackPosition: SnackPosition.BOTTOM,
                        duration: const Duration(seconds: 2),
                        backgroundColor: AppColors.primaryDarkColor,
                        colorText: Colors.white,
                      );
                    },
                    icon: const Icon(
                      Icons.copy,
                      color: AppColors.blackColor,
                    ),
                  ),
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 15, vertical: 15),
                ).paddingOnly(bottom: 20),
              ],
            ).paddingOnly(top: 30),
            Column(
              children: [
                const Text(
                  Strings.strScanToConnect,
                  style: TextStyle(
                    fontSize: 18,
                    color: Colors.black54,
                    fontFamily: FontFamily.openSansRegular,
                  ),
                ),
                Assets.images.qrCode.image(width: 250, height: 250),
              ],
            ).paddingOnly(top: 20),
          ],
        ).paddingAll(25),
      ),
    );
  }
}
