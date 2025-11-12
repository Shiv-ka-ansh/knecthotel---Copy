import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/pages/dashboard/controller/dashboard_controller.dart';
import 'package:knecthotel/presentation/widgets/common_button.dart';

import 'controller/order_summary_controller.dart';

class OrderSummary extends GetView<OrderSummaryController> {
  const OrderSummary({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: AppBar(
        backgroundColor: AppColors.transparentColor,
        title: const Text(
          Strings.strOrderSummary,
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
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            buildRestaurantHeader(),
            const SizedBox(height: 8),
            buildInvoiceButton(),
            const SizedBox(height: 8),
            const Divider(height: 10, color: AppColors.primaryShade),
            buildDeliveryInfo(),
            const SizedBox(height: 8),
            buildYourOrderSection(),
            const SizedBox(height: 16),
            buildPriceBreakdown(),
            const SizedBox(height: 16),
            buildSavingsInfo(),
            const SizedBox(height: 16),
            buildOrderDetailsSection(),
            const SizedBox(height: 16),
            buildReceptionContact(),
            const SizedBox(height: 30),
            CommonButton(
              onPress: () {
                Get.delete<DashboardController>();
                Get.toNamed(RouteConst.dashboard);
              },
              text: Strings.strBackToHome,
            ).paddingOnly(bottom: 30),
          ],
        ).paddingAll(20),
      ),
    );
  }

  Widget buildRestaurantHeader() {
    return const Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "Namaste Village",
          style: TextStyle(
            color: AppColors.blackColor,
            fontSize: 18,
            fontFamily: FontFamily.openSansBold,
          ),
        ),
        SizedBox(height: 4),
        Text(
          "3/51 Vijaypur colony Gomti nagar Jaipur",
          style: TextStyle(
            color: Colors.black54,
            fontFamily: FontFamily.openSansRegular,
          ),
        ),
      ],
    );
  }

  Widget buildInvoiceButton() {
    return OutlinedButton.icon(
      onPressed: () {},
      icon: const Icon(Icons.receipt),
      label: const Text(Strings.strDownloadInvoice),
      style: ElevatedButton.styleFrom(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        backgroundColor: AppColors.transparentColor,
        foregroundColor: AppColors.blackColor,
        textStyle: const TextStyle(fontFamily: FontFamily.openSansRegular),
      ),
    );
  }

  Widget buildDeliveryInfo() {
    return Row(
      children: [
        const Text(
          Strings.strOrderWillBeDelivered,
          style: TextStyle(
              color: AppColors.successColor,
              fontFamily: FontFamily.openSansRegular,
              fontSize: 12),
        ),
        const SizedBox(width: 6),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: AppColors.successColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(6),
          ),
          child: const Text(
            "07:50",
            style: TextStyle(
              color: AppColors.successColor,
              fontWeight: FontWeight.bold,
              fontFamily: FontFamily.openSansBold,
            ),
          ),
        ),
      ],
    );
  }

  Widget buildYourOrderSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              Strings.strYourOrder,
              style: TextStyle(
                fontFamily: FontFamily.openSansMedium,
                color: AppColors.blackColor,
              ),
            ),
            TextButton(
              onPressed: () {
                Get.toNamed(RouteConst.bookingServiceRequest);
              },
              style: TextButton.styleFrom(
                visualDensity: VisualDensity.compact,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                backgroundColor: AppColors.primaryColor,
                foregroundColor: AppColors.whiteColor,
                textStyle:
                    const TextStyle(fontFamily: FontFamily.openSansRegular),
              ),
              child: const Text(Strings.strTrackOrder),
            ),
          ],
        ),
        const Divider(height: 10, color: AppColors.primaryShade),
        Column(
          children:
              controller.cartItems.map((item) => buildOrderItem(item)).toList(),
        )
      ],
    );
  }

  Widget buildOrderItem(item) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      controller.data['from'] == RouteConst.foodCheckOut
                          ? Container(
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
                            ).paddingOnly(right: 5)
                          : const SizedBox(),
                      Text(
                        item['name'],
                        style: const TextStyle(
                          color: AppColors.blackColor,
                          fontFamily: FontFamily.openSansRegular,
                        ),
                      ),
                    ],
                  ).paddingOnly(bottom: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 5, vertical: 1),
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: AppColors.primaryDarkColor,
                            width: 0.5,
                          ),
                        ),
                        child: Center(
                          child: Text(
                            item['qty'].toString(),
                            style: const TextStyle(
                              color: AppColors.blackColor,
                              fontFamily: FontFamily.openSansRegular,
                            ),
                          ),
                        ),
                      ).paddingOnly(right: 6),
                      Text(
                        "X ${item['price']}",
                        style: const TextStyle(
                          color: AppColors.blackColor,
                          fontFamily: FontFamily.openSansRegular,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              Text(
                "₹${item['price']}",
                style: const TextStyle(
                  color: AppColors.blackColor,
                  fontFamily: FontFamily.openSansRegular,
                ),
              ),
            ],
          ),
        ),
        const Divider(height: 10, color: AppColors.primaryShade),
      ],
    );
  }

  Widget buildPriceBreakdown() {
    return Column(
      children: [
        buildPriceRow(Strings.strItemTotal, "₹220.00", isBold: true),
        buildPriceRow(Strings.strTaxes, "₹0.00"),
        buildPriceRow(Strings.strDeliveryCharges, "₹0.00"),
        buildPriceRow(Strings.strPlatformFee, "₹0.00"),
        const Divider(height: 10, color: AppColors.primaryShade),
        buildPriceRow(Strings.strGrandTotal, "₹220.00", isBold: true),
        const Divider(height: 10, color: AppColors.primaryShade),
      ],
    );
  }

  Widget buildPriceRow(String label, String value, {bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              color: isBold ? AppColors.blackColor : Colors.black54,
              fontFamily:
                  isBold ? FontFamily.openSansBold : FontFamily.openSansRegular,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              color: isBold ? AppColors.blackColor : Colors.black54,
              fontFamily:
                  isBold ? FontFamily.openSansBold : FontFamily.openSansRegular,
            ),
          ),
        ],
      ),
    );
  }

  Widget buildSavingsInfo() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.primaryShade,
        border: Border.all(color: AppColors.primaryColor),
        borderRadius: BorderRadius.circular(8),
      ),
      child: const Text(
        "${Strings.strYourTotalSavings} ₹ 00.00",
        style: TextStyle(
          fontFamily: FontFamily.openSansBold,
          color: AppColors.primaryColor,
        ),
      ),
    );
  }

  Widget buildOrderDetailsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Order Details",
          style: TextStyle(
            fontFamily: FontFamily.openSansBold,
            color: AppColors.blackColor,
          ),
        ),
        const Divider(height: 10, color: AppColors.primaryShade),
        const SizedBox(height: 8),
        buildDetailRow("Order Number", "6587852071"),
        buildDetailRow("Payment", "Paid using Upi"),
        buildDetailRow("Date", "February 10, 2025 at 7:49 PM"),
        buildDetailRow("Phone Number", "6203770xxx"),
        buildDetailRow("Deliver to", "Room Number- 206\nMr. Nikhil Jha"),
      ],
    );
  }

  Widget buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontFamily: FontFamily.openSansRegular,
              color: Colors.black54,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: const TextStyle(
              fontFamily: FontFamily.openSansRegular,
              color: Colors.black54,
            ),
          ),
        ],
      ),
    );
  }

  Widget buildReceptionContact() {
    return const Column(
      children: [
        Divider(height: 10, color: AppColors.primaryShade),
        Text(
          "${Strings.strCallReception}  (+91 6203770138)",
          style: TextStyle(
            color: AppColors.primaryDarkColor,
            fontFamily: FontFamily.openSansRegular,
          ),
        ),
        Divider(height: 10, color: AppColors.primaryShade),
      ],
    );
  }
}
