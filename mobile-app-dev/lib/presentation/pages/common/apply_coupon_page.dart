import 'package:confetti/confetti.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dash/flutter_dash.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/widgets/common_textfield.dart';
import 'controller/apply_coupon_page_controller.dart';

class ApplyCouponPage extends GetView<ApplyCouponPageController> {
  const ApplyCouponPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: AppBar(
        backgroundColor: AppColors.transparentColor,
        title: const Text(
          Strings.strApplyCoupon,
          style: TextStyle(
            color: AppColors.blackColor,
            fontFamily: FontFamily.openSansBold,
          ),
        ),
        centerTitle: true,
        elevation: 0,
      ),
      body: Stack(
        children: [
          Positioned.fill(
            child: Align(
              alignment: Alignment.topLeft,
              child: ConfettiWidget(
                confettiController: controller.leftConfettiController,
                blastDirection: 0, // Right

                numberOfParticles: 25,
                shouldLoop: false,
                gravity: 0.2,
                minBlastForce: 10,
                maxBlastForce: 20,
                colors: const [
                  Colors.pink,
                  Colors.blue,
                  Colors.orange,
                  Colors.green
                ],
              ),
            ),
          ),
          Positioned.fill(
            child: Align(
              alignment: Alignment.topRight,
              child: ConfettiWidget(
                confettiController: controller.rightConfettiController,
                blastDirection: 3.14, // Left

                numberOfParticles: 25,
                shouldLoop: false,
                gravity: 0.2,
                minBlastForce: 10,
                maxBlastForce: 20,
                colors: const [
                  Colors.pink,
                  Colors.blue,
                  Colors.orange,
                  Colors.green
                ],
              ),
            ),
          ),
          SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                CommonTextfield(
                  title: Strings.strEnterCouponCode,
                  controller: controller.couponCodeController,
                  contentPadding:
                      const EdgeInsets.symmetric(vertical: 5, horizontal: 10),
                  suffix: SizedBox(
                    width: 80,
                    child: Align(
                      alignment: Alignment.centerRight,
                      child: GestureDetector(
                        onTap: () {
                          final isValid = controller.coupons.any((element) =>
                              element.code.trim().toLowerCase() ==
                              controller.couponCodeController.text
                                  .trim()
                                  .toLowerCase());

                          controller.couponAppliedStatus.value =
                              isValid ? 1 : 0;

                          if (isValid) {
                            controller.playConfetti();
                          }
                        },
                        child: const Text(
                          Strings.strApply,
                          style: TextStyle(
                            color: AppColors.primaryDarkColor,
                            fontFamily: FontFamily.openSansSemiBold,
                          ),
                        ).paddingOnly(
                          right: 20,
                        ),
                      ),
                    ),
                  ),
                ).paddingOnly(bottom: 10),
                Obx(
                  () => controller.couponAppliedStatus.value != -1
                      ? Text(
                          controller.couponAppliedStatus.value == 1
                              ? Strings.strCouponApplied
                              : Strings.strInvalidCoupon,
                          style: TextStyle(
                            color: controller.couponAppliedStatus.value == 1
                                ? AppColors.successColor
                                : AppColors.errorColor,
                            fontSize: 14,
                            fontFamily: FontFamily.openSansRegular,
                          ))
                      : const SizedBox(),
                ),
                Dash(
                  direction: Axis.horizontal,
                  length: (MediaQuery.of(context).size.width - 40),
                  dashLength: 2,
                  dashColor: Colors.grey,
                ).paddingSymmetric(vertical: 20),
                ListView.separated(
                  shrinkWrap: true,
                  itemCount: controller.coupons.length,
                  physics: const NeverScrollableScrollPhysics(),
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final coupon = controller.coupons[index];
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Theme(
                            data: ThemeData.light().copyWith(
                              dividerColor: Colors.transparent,
                            ),
                            child: ExpansionTile(
                              tilePadding: const EdgeInsets.symmetric(
                                  horizontal: 14, vertical: 8),
                              collapsedBackgroundColor: coupon.color,
                              backgroundColor: coupon.color,
                              trailing: const Text(
                                Strings.strTermsConditionApply,
                                style: TextStyle(
                                  color: Colors.blueAccent,
                                  fontSize: 12,
                                ),
                              ),
                              title: Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      coupon.code,
                                      style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 16,
                                          color: AppColors.whiteColor),
                                    ),
                                  ),
                                ],
                              ),
                              subtitle: Text(
                                coupon.description,
                                style: const TextStyle(
                                  color: AppColors.whiteColor,
                                ),
                              ),
                              children: [
                                Padding(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 5, vertical: 8),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        coupon.terms,
                                        textAlign: TextAlign.start,
                                        style: const TextStyle(
                                          color: AppColors.blackColor,
                                        ),
                                      ),
                                    ],
                                  ),
                                )
                              ],
                            ),
                          ),
                        ),
                        if (coupon.expiry.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(top: 8.0, right: 5),
                            child: Text(
                              coupon.expiry,
                              style:
                                  const TextStyle(color: AppColors.errorColor),
                            ),
                          ),
                      ],
                    );
                  },
                ),
              ],
            ).paddingAll(20),
          ),
        ],
      ),
    );
  }
}
