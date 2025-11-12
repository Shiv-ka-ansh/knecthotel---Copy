import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/pages/common/controller/confirm_order_controller.dart';
import 'package:knecthotel/presentation/pages/dashboard/controller/dashboard_controller.dart';
import 'package:knecthotel/presentation/widgets/animated_check_widget.dart';
import 'package:knecthotel/presentation/widgets/common_button.dart';

class ConfirmOrder extends GetView<ConfirmOrderController> {
  const ConfirmOrder({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        backgroundColor: AppColors.scaffoldBg,
        appBar: AppBar(
          backgroundColor: AppColors.transparentColor,
          elevation: 0,
        ),
        body: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _progressStep(context, Strings.strSelectOrder, true),
                _progressStep(context, Strings.strPayment, true),
                _progressStep(context, Strings.strInvoice, true),
              ],
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                AnimatedCheckWidget(
                  key: controller.checkWidgetKey,
                  radius: 100,
                  backgroundColor: AppColors.primaryDarkColor,
                  shadowColor: AppColors.textFieldBg,
                  iconColor: AppColors.scaffoldBg,
                ).paddingOnly(bottom: 30),
                estimatedDeliveryTime(controller.data['time'] ?? '10:00 min')
                    .paddingSymmetric(vertical: 20),
                GestureDetector(
                  onTap: () {
                    final from = controller.data['from'];
                    switch (from) {
                      case RouteConst.foodCheckOut:
                        Get.toNamed(RouteConst.orderSummaryPage, arguments: {
                          'from': RouteConst.foodCheckOut,
                          'cartItems': controller.foodItems
                        });
                        break;
                      case RouteConst.cleaningCheckoutPage:
                        Get.toNamed(RouteConst.orderSummaryPage, arguments: {
                          'from': Strings.strWholeRoomCleaning,
                          'cartItems': controller.data['name'] ==
                                  Strings.strWholeRoomCleaning
                              ? controller.wholeRoomCleaning
                              : controller.laundaryItems
                        });
                        break;
                      case RouteConst.laundaryOrderSummaryPage:
                        Get.toNamed(RouteConst.orderSummaryPage, arguments: {
                          'from': RouteConst.laundaryOrderSummaryPage,
                          'cartItems': controller.laundaryItems
                        });
                        break;
                      case RouteConst.toiletriesOrderSummaryPage:
                        Get.toNamed(RouteConst.orderSummaryPage, arguments: {
                          'from': RouteConst.toiletriesOrderSummaryPage,
                          'cartItems': controller.toileteryItems
                        });
                        break;
                      case Strings.strTaxiCabService:
                        Get.toNamed(RouteConst.orderSummaryPage, arguments: {
                          'from': Strings.strTaxiCabService,
                          'cartItems': controller.taxiItem
                        });
                      case RouteConst.conciergePage:
                        Get.toNamed(RouteConst.orderSummaryPage, arguments: {
                          'from': RouteConst.conciergePage,
                          'cartItems': controller.conciergeItem
                        });
                        break;
                      case Strings.strCommunityHall:
                        Get.toNamed(RouteConst.orderSummaryPage, arguments: {
                          'from': Strings.strCommunityHall,
                          'cartItems': controller.communityItem
                        });
                        break;

                      case Strings.strConferenceHall:
                        Get.toNamed(RouteConst.orderSummaryPage, arguments: {
                          'from': Strings.strConferenceHall,
                          'cartItems': controller.conferenceItem
                        });
                        break;

                      case RouteConst.inRoomControlForm:
                        Get.toNamed(RouteConst.orderSummaryPage, arguments: {
                          'from': RouteConst.inRoomControlForm,
                          'cartItems': controller.roomCotrolsItem
                        });
                        break;
                    }
                  },
                  child: serviceRequestCard(
                          controller.data['requestName'],
                          controller.data['message'],
                          controller.data['servicePerson'])
                      .paddingSymmetric(horizontal: 25, vertical: 10),
                ),
                controller.data['from'] == RouteConst.confirmBookingPage
                    ? buildBookingSummary(
                        fromDate: controller.data['fromDate'],
                        toDate: controller.data['toDate'],
                        fromTime: controller.data['fromTime'],
                        toTime: controller.data['toTime'],
                      ).paddingOnly(top: 40)
                    : const SizedBox(),
              ],
            ).paddingOnly(top: 70),
            const Spacer(),
            CommonButton(
              onPress: () {
                Get.delete<DashboardController>();
                Get.toNamed(RouteConst.dashboard);
              },
              text: Strings.strBackToHome,
            ).paddingSymmetric(vertical: 30, horizontal: 25)
          ],
        ));
  }

  Widget estimatedDeliveryTime(String time) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const Text(
          'Estimated Delivery Time',
          style: TextStyle(
            fontWeight: FontWeight.w500,
            fontSize: 14,
            color: Colors.black87,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          time,
          style: const TextStyle(
            fontSize: 16,
            fontFamily: FontFamily.openSansSemiBold,
            color: AppColors.successColor,
          ),
        ),
      ],
    );
  }

  Widget serviceRequestCard(
      String requestName, String message, String servicePerson) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          margin: const EdgeInsets.only(bottom: 8),
          decoration: BoxDecoration(
            color: AppColors.textFieldBg,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            children: [
              Expanded(
                child: Text.rich(
                  TextSpan(
                    text: message,
                    style: const TextStyle(color: Colors.black87),
                    children: [
                      TextSpan(
                        text: requestName,
                        style: const TextStyle(
                          color: Colors.blue,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const TextSpan(
                        text: ' has been received',
                        style: TextStyle(color: Colors.black87),
                      ),
                    ],
                  ),
                ),
              ),
              const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.blue),
            ],
          ),
        ),
        Text.rich(
          TextSpan(
            text: 'our service partner ',
            style: const TextStyle(color: Colors.black54),
            children: [
              TextSpan(
                text: servicePerson,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              const TextSpan(
                text: ' will complete your request shortly',
                style: TextStyle(color: Colors.black54),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget buildBookingSummary({
    required String fromDate,
    required String toDate,
    required String fromTime,
    required String toTime,
  }) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Text(
          'you have booked',
          style: TextStyle(
            color: Colors.grey,
            fontSize: 14,
          ),
        ),
        const SizedBox(height: 10),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text(
                    'From',
                    style: TextStyle(fontSize: 16),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    fromDate,
                    style: const TextStyle(
                      fontSize: 16,
                      fontFamily: FontFamily.openSansSemiBold,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 10),
            const Text(
              '-',
              style: TextStyle(
                fontSize: 16,
                fontFamily: FontFamily.openSansSemiBold,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'To',
                    style: TextStyle(fontSize: 16),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    toDate,
                    style: const TextStyle(
                      fontSize: 16,
                      fontFamily: FontFamily.openSansSemiBold,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 15),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              fromTime,
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(width: 8),
            const Text(
              '-',
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(width: 8),
            Text(
              toTime,
              style: const TextStyle(fontSize: 16),
            ),
          ],
        ),
      ],
    );
  }

  // Progress Indicator Step
  Widget _progressStep(context, String text, bool isActive) {
    return Row(
      children: [
        Container(
          width: (MediaQuery.of(context).size.width / 7.5),
          height: 2,
          decoration: const BoxDecoration(
            shape: BoxShape.rectangle,
            color: AppColors.primaryDarkColor,
          ),
        ),
        CircleAvatar(
          backgroundColor: isActive ? AppColors.primaryDarkColor : Colors.grey,
          radius: 6,
          child: const Center(
            child: Icon(
              size: 10,
              Icons.check,
              color: AppColors.whiteColor,
            ),
          ),
        ),
        const SizedBox(width: 5),
        Text(
          text,
          style: const TextStyle(
            fontSize: 12,
            fontFamily: FontFamily.openSansRegular,
          ),
        ),
      ],
    );
  }
}
