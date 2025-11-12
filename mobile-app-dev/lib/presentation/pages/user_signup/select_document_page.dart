import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/widgets/common_button.dart';

import 'controller/select_document_page_controller.dart';

class SelectDocumentPage extends GetView<SelectDocumentPageController> {
  const SelectDocumentPage({super.key});

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
      body: Column(
        children: [
          Column(
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
              CommonButton(
                bgColor: AppColors.primaryDarkColor,
                onPress: () {
                  Get.toNamed(RouteConst.verifyDocuments);
                },
                text: Strings.strAadharId,
              ).paddingOnly(top: 40, bottom: 20),
              CommonButton(
                bgColor: AppColors.primaryDarkColor,
                onPress: () {
                  Get.toNamed(RouteConst.verifyDocuments);
                },
                text: Strings.strPassport,
              ).paddingOnly(bottom: 40),
            ],
          ),
        ],
      ).paddingAll(25),
    );
  }
}
