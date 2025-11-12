import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/pages/services/controller/toiletries_order_summary_controller.dart';
import 'package:knecthotel/presentation/widgets/common_button.dart';

class ToiletriesOrderSummary extends GetView<ToiletriesOrderSummaryController> {
  const ToiletriesOrderSummary({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: AppBar(
        backgroundColor: AppColors.transparentColor,
        title: const Text(
          Strings.strSelectToiletries,
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
            ListView.separated(
              padding: const EdgeInsets.only(top: 20),
              itemBuilder: (_, index) {
                final item = controller.cartItems[index];
                return buildSelectedItemCard(item);
              },
              separatorBuilder: (_, index) => const Divider(
                color: AppColors.primaryShade,
              ),
              itemCount: controller.cartItems.length,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
            ).paddingSymmetric(horizontal: 20),
            buildFooter(400).paddingOnly(bottom: 20),
          ],
        ),
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.fromLTRB(20, 0, 20, 30),
        child: CommonButton(
          onPress: () {
            Get.toNamed(RouteConst.confirmOrderPage, arguments: {
              'from': RouteConst.toiletriesOrderSummaryPage,
              'name': Strings.strDeliverToiletries,
              "message": 'Service request of ',
              "requestName": Strings.strDeliverToiletries,
              'servicePerson': "Mr. Ajit Pathak",
              "time": "10:00 min",
            });
          },
          text: Strings.strConfirm,
        ),
      ),
    );
  }

  Widget buildSelectedItemCard(Map<String, dynamic> item) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Row(
        children: [
          // Image
          Container(
            height: 60,
            width: 60,
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(8),
              image: DecorationImage(
                image: AssetImage(item['image']),
                fit: BoxFit.cover,
              ),
            ),
          ),
          const SizedBox(width: 12),

          // Name and service
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item['name'],
                    style: const TextStyle(
                      fontFamily: FontFamily.openSansBold,
                      fontSize: 16,
                    )),
                Text(
                  item['service'],
                  style: const TextStyle(
                    color: Colors.black54,
                    fontFamily: FontFamily.openSansRegular,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),

          // Quantity x Price
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 4,
                  vertical: 0,
                ),
                decoration: BoxDecoration(
                  color: AppColors.transparentColor,
                  border: Border.all(
                    color: Colors.black54,
                  ),
                ),
                child: Center(
                  child: Text(
                    '${item['quantity']}',
                    style: const TextStyle(
                      fontFamily: FontFamily.openSansMedium,
                      fontSize: 15,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                'x ₹${item['price'].toStringAsFixed(2)}',
                style: const TextStyle(
                  fontFamily: FontFamily.openSansMedium,
                  fontSize: 15,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget buildFooter(double totalAmount) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              "Tax & Charges",
              style: TextStyle(
                color: Colors.black54,
                fontFamily: FontFamily.openSansRegular,
              ),
            ),
            Text(
              "₹10",
              style: TextStyle(
                fontFamily: FontFamily.openSansMedium,
              ),
            ),
          ],
        ).paddingSymmetric(horizontal: 20, vertical: 10),
        Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          color: AppColors.primaryDarkColor,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                "Total Amount",
                style: TextStyle(
                  color: Colors.white,
                  fontFamily: FontFamily.openSansBold,
                  fontSize: 16,
                ),
              ),
              Text(
                "₹${totalAmount.toStringAsFixed(0)}",
                style: const TextStyle(
                  color: Colors.white,
                  fontFamily: FontFamily.openSansBold,
                  fontSize: 16,
                ),
              ),
            ],
          ).paddingSymmetric(horizontal: 16, vertical: 4),
        ),
        const Text(
          "will be added to your bill",
          style: TextStyle(
            fontSize: 12,
            fontFamily: FontFamily.openSansRegular,
            color: Colors.black54,
          ),
        ).paddingSymmetric(horizontal: 20, vertical: 10),
      ],
    );
  }
}
