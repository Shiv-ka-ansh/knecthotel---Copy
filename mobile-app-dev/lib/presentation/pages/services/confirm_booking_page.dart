import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/widgets/common_button.dart';

import 'controller/confirm_booking_page_controller.dart';

class ConfirmBookingPage extends GetView<ConfirmBookingPageController> {
  const ConfirmBookingPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: AppBar(
        backgroundColor: AppColors.transparentColor,
        title: const Text(
          Strings.strConfirmBooking,
          style: TextStyle(
            color: AppColors.blackColor,
            fontFamily: FontFamily.openSansBold,
          ),
        ),
        centerTitle: true,
        elevation: 0,
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(),
          const SizedBox(height: 24),
          _sectionTitle('From'),
          const SizedBox(height: 8),
          _buildDateTimeRow(
              controller.data['startDate'], controller.data['startTime']),
          const SizedBox(height: 24),
          _sectionTitle('To Date'),
          const SizedBox(height: 8),
          _buildDateTimeRow(
              controller.data['endDate'], controller.data['endTime']),
          const SizedBox(height: 24),
          _sectionTitle('For the Event'),
          const SizedBox(height: 8),
          _buildEventBox(),
          const SizedBox(height: 10),
          const Text(
            'you will be charged ₹100 per hour',
            style: TextStyle(
              fontFamily: FontFamily.openSansRegular,
              color: Colors.black54,
            ),
          ),
          const Spacer(),
          CommonButton(
            onPress: () {
              Get.toNamed(RouteConst.confirmOrderPage, arguments: {
                'from': controller.data['name'],
                "message": 'Srevice request to ',
                'servicePerson': "Mr. Ajit Pathak",
                "requestName": controller.data['name'],
                'fromDate': controller.data['startDate'],
                'toDate': controller.data['endDate'],
                'fromTime': controller.data['startTime'],
                'toTime': controller.data['endTime'],
              });
            },
            text: Strings.strConfirmBooking,
          ).paddingOnly(bottom: 40),
        ],
      ).paddingAll(25),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(10),
          child: Image.asset(
            controller.data['image'],
            width: 60,
            height: 60,
            fit: BoxFit.cover,
          ),
        ),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              controller.data['name'],
              style: const TextStyle(
                fontFamily: FontFamily.openSansMedium,
                fontSize: 16,
                color: AppColors.blackColor,
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              '1000–2000 per hour',
              style: TextStyle(
                fontFamily: FontFamily.openSansRegular,
                fontSize: 13,
                color: Colors.black54,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _sectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontFamily: FontFamily.openSansMedium,
        fontSize: 15,
        color: AppColors.blackColor,
      ),
    );
  }

  Widget _buildDateTimeRow(String date, String time) {
    return Row(
      children: [
        _infoBox(date),
        const SizedBox(width: 12),
        _infoBox(time),
      ],
    );
  }

  Widget _infoBox(String text) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
        decoration: BoxDecoration(
          color: AppColors.textFieldBg,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Text(
          text,
          style: const TextStyle(
            fontFamily: FontFamily.openSansRegular,
            fontSize: 14,
            color: AppColors.blackColor,
          ),
        ),
      ),
    );
  }

  Widget _buildEventBox() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
      decoration: BoxDecoration(
        color: AppColors.textFieldBg,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        controller.data['event'] ?? 'Office Annual meeting',
        style: const TextStyle(
          fontFamily: FontFamily.openSansRegular,
          fontSize: 14,
          color: AppColors.blackColor,
        ),
      ),
    );
  }
}
