import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/widgets/common_button.dart';
import 'package:knecthotel/presentation/widgets/common_counter_btn.dart';
import 'controller/food_check_out_controller.dart';

class FoodCheckOut extends GetView<FoodCheckOutController> {
  const FoodCheckOut({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: AppBar(
        backgroundColor: AppColors.transparentColor,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Text(
                  Strings.strDeliveryAt,
                  style: TextStyle(
                      color: AppColors.blackColor,
                      fontFamily: FontFamily.openSansSemiBold,
                      fontSize: 13),
                ).paddingOnly(right: 5),
                const Text(
                  '${Strings.strRoomNumber}- 206',
                  style: TextStyle(
                      color: Colors.black54,
                      fontFamily: FontFamily.openSansMedium,
                      fontSize: 12),
                ),
              ],
            ),
            Row(
              children: [
                const Text(
                  Strings.strReceiversName,
                  style: TextStyle(
                    color: AppColors.blackColor,
                    fontFamily: FontFamily.openSansSemiBold,
                    fontSize: 13,
                  ),
                ).paddingOnly(right: 5),
                const Text(
                  'Mr. Nikhil Jha',
                  style: TextStyle(
                    color: Colors.black54,
                    fontFamily: FontFamily.openSansMedium,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.edit_outlined, color: AppColors.blackColor),
          ).paddingOnly(right: 10),
        ],
        elevation: 0,
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 15),
        child: _paymentSection(),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            _foodItemList().paddingOnly(top: 15, left: 15, right: 15),
            _couponSection().paddingSymmetric(horizontal: 15),
            _amountSection(),
            _deliveryDetails().paddingSymmetric(horizontal: 15),
            _cancelationPolicy().paddingSymmetric(horizontal: 15),
          ],
        ),
      ),
    );
  }

  Widget _foodItemList() {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppColors.textFieldBg,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ...controller.fastFoodItems.asMap().entries.map((entry) {
            final index = entry.key;
            final item = entry.value;
            return _foodItemTile(item, controller.selectedQuantities[index]);
          }),
          OutlinedButton(
            onPressed: () {
              Get.back();
            },
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.all(12),
              backgroundColor: AppColors.primaryShade,
              side: const BorderSide(color: AppColors.primaryColor, width: 1),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            child: const Text(
              Strings.strAddItem,
              style: TextStyle(
                fontFamily: FontFamily.openSansSemiBold,
                color: AppColors.blackColor,
                fontSize: 14,
              ),
            ),
          ).paddingOnly(top: 10),
        ],
      ),
    );
  }

  Widget _couponSection() {
    return GestureDetector(
      onTap: () {
        Get.toNamed(RouteConst.applyCouponPage, arguments: {
          'from': RouteConst.foodCheckOut,
        });
      },
      child: const ListTile(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
        ),
        tileColor: AppColors.textFieldBg,
        title: Text(
          Strings.strViewAllCoupons,
          style: TextStyle(
            color: AppColors.blackColor,
          ),
        ),
        trailing: Icon(Icons.arrow_forward_ios, size: 16),
      ).paddingOnly(top: 10),
    );
  }

  Widget _amountSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              Strings.strTaxCharges,
              style: TextStyle(
                color: Colors.black54,
                fontSize: 14,
              ),
            ).paddingOnly(left: 5),
            const Text(
              "₹110",
              style: TextStyle(
                color: AppColors.blackColor,
                fontSize: 14,
              ),
            ).paddingOnly(right: 5),
          ],
        ).paddingOnly(top: 10, left: 15, right: 15),
        Container(
          padding: const EdgeInsets.all(15),
          color: AppColors.primaryDarkColor,
          child: const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(Strings.strTotalAmount,
                  style: TextStyle(
                    color: AppColors.whiteColor,
                    fontSize: 16,
                  )),
              Text("₹400",
                  style: TextStyle(
                    color: AppColors.whiteColor,
                    fontSize: 16,
                  )),
            ],
          ),
        ).paddingOnly(top: 10),
        const Text(
          Strings.strWillBeAddedToBill,
          style: TextStyle(
              color: Colors.black54,
              fontSize: 14,
              fontFamily: FontFamily.openSansRegular),
        ).paddingOnly(top: 10, left: 15, right: 15),
      ],
    );
  }

  Widget _deliveryDetails() {
    return Container(
      padding: const EdgeInsets.all(15),
      color: AppColors.textFieldBg,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.access_time_filled_rounded, size: 25),
              SizedBox(width: 5),
              Text("Delivery in 10 mins"),
            ],
          ),
          const Divider(
            color: AppColors.primaryShade,
            height: 0.5,
            thickness: 1,
          ).paddingSymmetric(vertical: 5),
          const Row(
            children: [
              Icon(Icons.receipt_outlined, size: 25),
              SizedBox(width: 5),
              Text(
                "Total ₹400",
                style: TextStyle(
                  color: Colors.black,
                ),
              ),
            ],
          ),
          const Divider(
            color: AppColors.primaryShade,
            height: 1,
            thickness: 1,
          ).paddingSymmetric(vertical: 5),
          const Text(
            "Delivery to Nikhil Jha",
            style: TextStyle(
              color: Colors.black54,
            ),
          ),
          const SizedBox(height: 5),
          const Row(
            children: [
              Icon(Icons.phone_in_talk_outlined, size: 25),
              SizedBox(width: 5),
              Text("+916203770138"),
            ],
          ),
        ],
      ),
    ).paddingOnly(top: 10);
  }

  Widget _cancelationPolicy() {
    return const Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          Strings.strCancelationPolicy,
          style: TextStyle(
            color: Colors.black54,
            fontSize: 14,
          ),
        ),
        SizedBox(height: 5),
        Text(
          Strings.strCancelationPolicyDetails,
          style: TextStyle(
            color: Colors.black54,
            fontSize: 12,
          ),
        )
      ],
    ).paddingOnly(top: 10, bottom: 20);
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
                Get.toNamed(RouteConst.confirmOrderPage, arguments: {
                  'from': RouteConst.foodCheckOut,
                  'message': 'Your Order for ',
                  'requestName': '2 items',
                  'servicePerson': 'Mr. Ajit Pathak',
                  'time': '10:00 min',
                });
              },
              text: '${Strings.strPay} ₹400',
            ),
          ),
        ],
      ),
    );
  }

  Widget _foodItemTile(item, RxInt quantity) {
    return Column(
      children: [
        Container(
          width: double.infinity,
          height: 100,
          padding: const EdgeInsets.all(10),
          color: AppColors.transparentColor,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(2),
                        decoration: BoxDecoration(
                            border: Border.all(
                          color: item['isVeg']
                              ? AppColors.successColor
                              : AppColors.errorColor,
                          width: 0.5,
                        )),
                        child: Icon(
                          Icons.circle,
                          size: 10,
                          color: item['isVeg']
                              ? AppColors.successColor
                              : AppColors.errorColor,
                        ),
                      ).paddingOnly(right: 5),
                      SizedBox(
                        width: 180,
                        child: Text(
                          item['name'],
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontFamily: FontFamily.openSansMedium,
                            color: AppColors.blackColor,
                            fontSize: 14,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 5),
                  Text(
                    '₹${item['price']}',
                    style: const TextStyle(
                      fontFamily: FontFamily.openSansRegular,
                      color: Colors.black54,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 5),
                  SizedBox(
                    width: 180,
                    child: Text(
                      item['eligibility'],
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontFamily: FontFamily.openSansRegular,
                        color: Colors.black54,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  CommonCounterBtn(counterTxt: quantity).paddingOnly(top: 5),
                  const Spacer(),
                ],
              ),
            ],
          ),
        ),
        const Divider(
          color: AppColors.primaryShade,
          height: 0.5,
          thickness: 1,
        ),
      ],
    );
  }
}
