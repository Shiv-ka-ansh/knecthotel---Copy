import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/gen/assets.gen.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/widgets/common_button.dart';
import 'package:knecthotel/presentation/widgets/common_textfield.dart';

import 'controller/select_date_time_controller.dart';

class SelectDateTime extends GetView<SelectDateTimeController> {
  const SelectDateTime({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: AppBar(
        backgroundColor: AppColors.transparentColor,
        title: const Text(
          Strings.strSelectDateTime,
          style: TextStyle(
            color: AppColors.blackColor,
            fontFamily: FontFamily.openSansBold,
          ),
        ),
        centerTitle: true,
        elevation: 0,
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(20),
        child: CommonButton(
          onPress: () {
            if (controller.data['name'] != Strings.strTaxiCabService) {
              Get.toNamed(
                RouteConst.confirmBookingPage,
                arguments: {
                  'from':
                      controller.data['from'] ?? RouteConst.selectDateTimePage,
                  'name':
                      controller.data['name'] ?? Strings.strConciergeService,
                  'image': controller.data['image'] ??
                      Assets.images.conferenceHall.path,
                  'startDate': controller.startDateController.text,
                  'startTime': controller.startTimeController.text,
                  'endDate': controller.endDateController.text,
                  'endTime': controller.endTimeController.text,
                  'event': controller.eventController.text,
                },
              );
            } else {
              Get.toNamed(
                RouteConst.paymentPage,
                arguments: {
                  'from': Strings.strTaxiCabService,
                  'name': Strings.strTaxiCabService,
                },
              );
            }
          },
          text: Strings.strConfirmBooking,
        ),
      ).paddingOnly(bottom: 20),
      body: Column(
        children: [
          headerForm(context).paddingOnly(bottom: 20),
          controller.data['name'] == Strings.strCommunityHall ||
                  controller.data['name'] == Strings.strConferenceHall
              ? footerForm(context)
              : const SizedBox(),
        ],
      ).paddingAll(20),
    );
  }

  Column headerForm(BuildContext context) {
    return Column(
      children: [
        CommonTextfield(
          isReadOnly: true,
          controller: controller.startDateController,
          title: controller.data['name'] != Strings.strTaxiCabService
              ? Strings.strFrom
              : null,
          hintText: Strings.strSelectDate,
          suffix: const Icon(Icons.calendar_month_outlined),
          onTap: () async {
            var date = await showDatePicker(
              context: context,
              lastDate: DateTime.now().add(const Duration(days: 10)),
              firstDate: DateTime(1900),
              builder: (context, child) => Theme(
                data: ThemeData.light().copyWith(
                  colorScheme: const ColorScheme.light().copyWith(
                    primary: AppColors.primaryColor,
                  ),
                ),
                child: child!,
              ),
            );
            if (date != null) {
              controller.startDateController.text =
                  DateFormat("dd/MM/yyyy").format(date);
            }
          },
        ).paddingOnly(bottom: 20),
        CommonTextfield(
          isReadOnly: true,
          controller: controller.startTimeController,
          hintText: Strings.strSelectTime,
          suffix: const Icon(Icons.access_time),
          onTap: () async {
            var time = await showTimePicker(
              initialTime: TimeOfDay.now(),
              context: context,
              builder: (context, child) => Theme(
                data: ThemeData.light().copyWith(
                  colorScheme: const ColorScheme.light().copyWith(
                    primary: AppColors.primaryColor,
                  ),
                ),
                child: child!,
              ),
            );
            if (time != null) {
              controller.startTimeController.text = time.format(context);
            }
          },
        ).paddingOnly(bottom: 20),
      ],
    );
  }

  Widget footerForm(context) {
    return Column(
      children: [
        CommonTextfield(
          isReadOnly: true,
          controller: controller.endDateController,
          title: Strings.strToDate,
          hintText: Strings.strSelectDate,
          suffix: const Icon(Icons.calendar_month_outlined),
          onTap: () async {
            var date = await showDatePicker(
              context: context,
              lastDate: DateTime.now().add(const Duration(days: 10)),
              firstDate: DateTime(1900),
              builder: (context, child) => Theme(
                data: Theme.of(context).copyWith(
                  colorScheme: const ColorScheme.light().copyWith(
                    primary: AppColors.primaryColor,
                    surface: AppColors.primaryDarkColor,
                  ),
                ),
                child: child!,
              ),
            );
            if (date != null) {
              controller.endDateController.text =
                  DateFormat("dd/MM/yyyy").format(date);
            }
          },
        ).paddingOnly(bottom: 20),
        CommonTextfield(
          isReadOnly: true,
          controller: controller.endTimeController,
          hintText: Strings.strSelectTime,
          suffix: const Icon(Icons.access_time),
          onTap: () async {
            var time = await showTimePicker(
              initialTime: TimeOfDay.now(),
              context: context,
              builder: (context, child) => Theme(
                data: ThemeData.light().copyWith(
                  colorScheme: const ColorScheme.light().copyWith(
                    primary: AppColors.primaryColor,
                  ),
                ),
                child: child!,
              ),
            );
            if (time != null) {
              controller.endTimeController.text = time.format(context);
            }
          },
        ).paddingOnly(bottom: 30),
        CommonTextfield(
          controller: controller.eventController,
          title: Strings.strEventName,
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 15, vertical: 15),
        )
      ],
    );
  }
}
