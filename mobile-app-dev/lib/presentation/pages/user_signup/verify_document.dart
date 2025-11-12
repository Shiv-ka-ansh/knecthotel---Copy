import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/gen/assets.gen.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/pages/user_signup/controller/verify_document_controller.dart';
import 'package:knecthotel/presentation/widgets/common_button.dart';

class VerifyDocument extends GetView<VerifyDocumentController> {
  const VerifyDocument({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: AppBar(
        backgroundColor: AppColors.transparentColor,
        title: const Text(
          Strings.strVerifyDocument,
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
            Get.toNamed(RouteConst.addBankDetails);
          },
          text: Strings.strContinue,
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Align(
                alignment: Alignment.topRight,
                child: InkWell(
                  onTap: () {},
                  child: Container(
                    width: 70,
                    decoration: BoxDecoration(
                      color: AppColors.primaryDarkColor,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: InkWell(
                      onTap: () => Get.toNamed(RouteConst.addBankDetails),
                      child: const Padding(
                        padding: EdgeInsets.all(5),
                        child: Center(
                          child: Text(
                            Strings.strSkip,
                            style: TextStyle(
                              color: AppColors.whiteColor,
                              fontFamily: FontFamily.openSansMedium,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                )).paddingOnly(top: 8),
            Obx(
              () => Container(
                width: 325,
                height: 300,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.borderColor),
                  image: controller.selectedImage.value != null
                      ? DecorationImage(
                          image: FileImage(controller.selectedImage.value!),
                          fit: BoxFit.cover,
                        )
                      : DecorationImage(
                          image: AssetImage(Assets.images.uploadDocument.path),
                          fit: BoxFit.cover,
                        ),
                ),
              ).paddingOnly(top: 15),
            ),
            CommonButton(
              onPress: () async {
                await controller.pickImageFromGallery();
              },
              text: Strings.strUploadFromGallery,
              bgColor: AppColors.textFieldBg,
              textColor: Colors.black38,
            ).paddingOnly(top: 20),
            CommonButton(
              onPress: () async {
                await controller.pickImageFromCamera();
              },
              text: Strings.strScanToVerify,
              bgColor: AppColors.textFieldBg,
              textColor: Colors.black38,
            ).paddingOnly(top: 15),
            CommonButton(
              onPress: () async {},
              text: Strings.strVerifyWithThrirdParty,
              bgColor: AppColors.textFieldBg,
              textColor: Colors.black38,
            ).paddingOnly(top: 15),
          ],
        ).paddingAll(25),
      ),
    );
  }
}
