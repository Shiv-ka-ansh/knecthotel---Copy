import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/gen/assets.gen.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/widgets/common_button.dart';
import 'package:knecthotel/presentation/widgets/common_counter_btn.dart';

import 'controller/cleaning_checkout_page_controller.dart';

class CleaningCheckoutPage extends GetView<CleaningCheckoutPageController> {
  const CleaningCheckoutPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: AppBar(
        backgroundColor: AppColors.transparentColor,
        elevation: 0,
      ),
      bottomNavigationBar:
          Padding(padding: const EdgeInsets.all(16), child: _paymentSection()),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _savingBanner(),
            const SizedBox(height: 16),
            _serviceCard(),
            const SizedBox(height: 16),
            _couponTile(),
            const SizedBox(height: 16),
            _priceSummary(),
            const SizedBox(height: 24),
            _cancellationPolicy(),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _savingBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.primaryDarkColor,
        borderRadius: BorderRadius.circular(6),
      ),
      child: const Center(
        child: Text(
          'You are saving ₹339 on this order!',
          style: TextStyle(
            fontFamily: FontFamily.openSansRegular,
            fontSize: 14,
            color: Colors.white,
          ),
        ),
      ),
    );
  }

  Widget _serviceCard() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.textFieldBg,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          Container(
            width: 65,
            height: 60,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
              color: Colors.grey.shade300,
            ),
            child: Image.asset(
              controller.data['image'] ?? Assets.images.wholeRoomCleaning.path,
              fit: BoxFit.cover,
            ), // Placeholder for image
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  controller.data['name'] ?? 'Whole Room Cleaning',
                  style: const TextStyle(
                    fontFamily: FontFamily.openSansBold,
                    fontSize: 15,
                    color: AppColors.blackColor,
                  ),
                ),
                const SizedBox(height: 4),
                const Row(
                  children: [
                    Icon(Icons.star, size: 16, color: Colors.amber),
                    SizedBox(width: 4),
                    Text(
                      '4.5',
                      style: TextStyle(
                        fontFamily: FontFamily.openSansBold,
                        fontSize: 13,
                        color: AppColors.blackColor,
                      ),
                    ),
                    SizedBox(width: 4),
                    Text(
                      '(2M reviews)',
                      style: TextStyle(
                        fontFamily: FontFamily.openSansRegular,
                        fontSize: 13,
                        color: Colors.black54,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                const Row(
                  children: [
                    Text(
                      '₹ 660',
                      style: TextStyle(
                        fontFamily: FontFamily.openSansBold,
                        fontSize: 15,
                        color: AppColors.blackColor,
                      ),
                    ),
                    SizedBox(width: 8),
                    Text(
                      '₹ 999',
                      style: TextStyle(
                        decoration: TextDecoration.lineThrough,
                        fontFamily: FontFamily.openSansRegular,
                        fontSize: 13,
                        color: Colors.black54,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          SizedBox(
            width: 75,
            child: CommonCounterBtn(
              counterTxt: controller.selectedQuantity,
              borderColor: AppColors.transparentColor,
              bgColor: AppColors.transparentColor,
              positiveBtnColor: AppColors.primaryColor,
              negativeBtnColor: AppColors.primaryColor,
              minValue: 1,
            ),
          )
        ],
      ),
    );
  }

  // Widget _contactCard() {
  //   return Container(
  //     padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
  //     decoration: BoxDecoration(
  //       border: Border.all(color: Colors.black12),
  //       borderRadius: BorderRadius.circular(10),
  //     ),
  //     child: const Row(
  //       children: [
  //         Icon(Icons.phone_in_talk_outlined, color: AppColors.blackColor),
  //         SizedBox(width: 12),
  //         Expanded(
  //           child: Text(
  //             'Shivani, +91-8800880091',
  //             style: TextStyle(
  //               fontFamily: FontFamily.openSansRegular,
  //               fontSize: 14,
  //               color: AppColors.blackColor,
  //             ),
  //           ),
  //         ),
  //         Text(
  //           'Change',
  //           style: TextStyle(
  //             fontFamily: FontFamily.openSansBold,
  //             fontSize: 14,
  //             color: AppColors.primaryDarkColor,
  //           ),
  //         ),
  //       ],
  //     ),
  //   );
  // }

  Widget _couponTile() {
    return GestureDetector(
      onTap: () {
        Get.toNamed(RouteConst.applyCouponPage);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
        decoration: BoxDecoration(
          color: AppColors.textFieldBg,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(2),
              decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: AppColors.blackColor,
                  )),
              child:
                  const Icon(Icons.percent_sharp, color: AppColors.blackColor),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                Strings.strApplyCoupon.toUpperCase(),
                style: const TextStyle(
                  fontFamily: FontFamily.openSansBold,
                  fontSize: 14,
                  color: AppColors.blackColor,
                ),
              ),
            ),
            const Icon(Icons.chevron_right, color: Colors.black45),
          ],
        ),
      ),
    );
  }

  Widget _priceSummary() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.textFieldBg,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        children: [
          _priceRow('Subtotal (Inclusive tax)', '₹ 999'),
          const SizedBox(height: 8),
          _priceRow('Discount', '₹ 339', isDiscount: true),
          const Divider(height: 20),
          _priceRow('Subtotal (Inclusive tax)', '₹ 999'),
          const SizedBox(height: 10),
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                Strings.strGrandTotal,
                style: TextStyle(
                  fontFamily: FontFamily.openSansBold,
                  fontSize: 16,
                  color: AppColors.blackColor,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _priceRow(String label, String value, {bool isDiscount = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontFamily: FontFamily.openSansRegular,
            fontSize: 14,
            color: isDiscount ? Colors.black54 : AppColors.blackColor,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontFamily: FontFamily.openSansRegular,
            fontSize: 14,
            color: isDiscount ? Colors.black54 : AppColors.blackColor,
          ),
        ),
      ],
    );
  }

  Widget _cancellationPolicy() {
    return const Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          Strings.strCancelationPolicy,
          style: TextStyle(
            fontFamily: FontFamily.openSansMedium,
            fontSize: 14,
            color: Colors.black54,
          ),
        ),
        SizedBox(height: 5),
        Text(
          Strings.strCancelationPolicyDetails,
          style: TextStyle(
            fontFamily: FontFamily.openSansRegular,
            fontSize: 12,
            color: Colors.black54,
          ),
        ),
        SizedBox(height: 30),
        Text(
          Strings.strReadFullPolicy,
          style: TextStyle(
            fontFamily: FontFamily.openSansMedium,
            fontSize: 14,
            color: AppColors.primaryDarkColor,
            decoration: TextDecoration.underline,
          ),
        ),
      ],
    );
  }

  Widget _paymentSection() {
    return Padding(
      padding: const EdgeInsets.only(top: 10, bottom: 50),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            flex: 5,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
              decoration: BoxDecoration(
                color: AppColors.textFieldBg,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.grey.shade300),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Obx(
                      () => SizedBox(
                        height: 40,
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            isDense: true,
                            value: controller.selectedPaymentMode.value,
                            items: Strings.lstPaymentMethods
                                .map(
                                  (method) => DropdownMenuItem<String>(
                                    value: method,
                                    child: Text(
                                      method,
                                      style: const TextStyle(
                                        fontFamily: FontFamily.openSansRegular,
                                        color: AppColors.blackColor,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ),
                                )
                                .toList(),
                            onChanged: (value) {
                              if (value != null) {
                                controller.selectedPaymentMode.value = value;
                              }
                            },
                            dropdownColor: AppColors.textFieldBg,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 5),
                  const Text(
                    Strings.strPayVia,
                    style: TextStyle(
                      fontSize: 12,
                      fontFamily: FontFamily.openSansRegular,
                      color: Colors.black87,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            flex: 5,
            child: CommonButton(
              onPress: () {
                Get.toNamed(RouteConst.paymentPage, arguments: {
                  'from': RouteConst.cleaningCheckoutPage,
                  'name': controller.data['name'],
                });
              },
              text: '${Strings.strPay} ₹400',
            ),
          ),
        ],
      ),
    );
  }
}
