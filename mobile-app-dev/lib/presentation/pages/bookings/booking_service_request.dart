import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/widgets/status_tracker.dart';

import 'controller/booking_service_request_controller.dart';

class BookingServiceRequest extends GetView<BookingServiceRequestController> {
  const BookingServiceRequest({super.key});

  @override
  BookingServiceRequestController get controller =>
      Get.put(BookingServiceRequestController());

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
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: controller.items.length,
        separatorBuilder: (context, index) => const SizedBox(height: 16),
        itemBuilder: (context, index) {
          final item = controller.items[index];
          return GestureDetector(
            onTap: () => Get.toNamed(
              RouteConst.bookingServiceStatusPage,
              arguments: item,
            ),
            child: orderStatusTile(item),
          );
        },
      ),
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
