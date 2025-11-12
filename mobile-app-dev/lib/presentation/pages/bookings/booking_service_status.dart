import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/gen/assets.gen.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/widgets/common_button.dart';
import 'package:knecthotel/presentation/widgets/status_tracker.dart';

import 'controller/booking_service_status_controller.dart';

class BookingServiceStatus extends GetView<BookingServiceStatusController> {
  const BookingServiceStatus({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: AppBar(
        backgroundColor: AppColors.transparentColor,
        title: const Text(
          Strings.strServiceRequests,
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
          orderStatusTile(controller.data).paddingOnly(bottom: 30),
          showCurrentStatus(
            controller.data['currentStep'],
            controller.data['statusImage'],
            controller.data['time'],
          ).paddingOnly(bottom: 20),
          const Spacer(),
          CommonButton(
            onPress: () {},
            text: Strings.strCancelRequest,
          ).paddingOnly(bottom: 40),
        ],
      ).paddingAll(25),
    );
  }

  Widget showCurrentStatus(int statusIndex, String statusImage, String time) {
    return Column(
      children: [
        statusIndex != 3
            ? Image.asset(
                statusImage,
                width: 200,
                height: 200,
              )
            : Image.asset(
                Assets.images.serviceComplete.path,
                width: double.infinity,
                fit: BoxFit.cover,
                height: 150,
              ),
        const SizedBox(height: 16),
        statusIndex != controller.data['statusSteps'].length - 1
            ? const Text(
                Strings.strExpectedTimeToComplete,
                style: TextStyle(
                  fontFamily: FontFamily.openSansRegular,
                  fontSize: 14,
                  color: AppColors.blackColor,
                ),
              )
            : const SizedBox(),
        const SizedBox(height: 8),
        statusIndex != controller.data['statusSteps'].length - 1
            ? Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.green.shade100,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  time,
                  style: const TextStyle(
                    fontFamily: FontFamily.openSansRegular,
                    fontSize: 14,
                    color: Colors.green,
                  ),
                ),
              )
            : const SizedBox(),
      ],
    );
  }

  Widget orderStatusTile(Map<String, dynamic> item) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Image.asset(
                item['image'],
                width: 55,
                height: 55,
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item['title'],
                    style: const TextStyle(
                      fontFamily: FontFamily.openSansBold,
                      fontSize: 15,
                      color: AppColors.blackColor,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text(
                        item['subtitle'] ?? '',
                        style: const TextStyle(
                          fontFamily: FontFamily.openSansRegular,
                          fontSize: 13,
                          color: Colors.black54,
                        ),
                      ),
                      if (item['subtitle'] != null) ...[
                        const SizedBox(width: 6),
                        const Icon(Icons.local_shipping,
                            size: 14, color: Colors.black45),
                      ]
                    ],
                  ),
                ],
              ),
            ),
            if (item['time'] != null)
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.green.shade100,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  item['time'],
                  style: const TextStyle(
                    fontFamily: FontFamily.openSansRegular,
                    fontSize: 13,
                    color: Colors.green,
                  ),
                ),
              ),
          ],
        ),
        if (item['timeRange'] != null) ...[
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              Text(
                item['timeRange'],
                style: const TextStyle(
                  fontFamily: FontFamily.openSansRegular,
                  fontSize: 13,
                  color: Colors.black54,
                ),
              )
            ],
          ),
        ],
        const SizedBox(height: 16),
        StatusTracker(
          steps: List<String>.from(item['statusSteps']),
          currentStep: item['currentStep'],
        ),
        if (item['showFeedback'] == true) ...[
          const SizedBox(height: 10),
          GestureDetector(
            onTap: () {
              // Navigate to feedback
            },
            child: const Text(
              "Provide Feedback",
              style: TextStyle(
                fontFamily: FontFamily.openSansRegular,
                fontSize: 13,
                color: AppColors.primaryColor,
                decoration: TextDecoration.underline,
              ),
            ),
          ),
        ]
      ],
    );
  }
}
