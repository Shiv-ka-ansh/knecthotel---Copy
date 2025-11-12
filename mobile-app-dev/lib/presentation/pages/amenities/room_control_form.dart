import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/widgets/common_button.dart';
import 'package:knecthotel/presentation/widgets/common_dropdown.dart';
import 'package:knecthotel/presentation/widgets/common_textfield.dart';
import 'controller/room_control_form_controller.dart';

class RoomControlForm extends GetView<RoomControlFormController> {
  const RoomControlForm({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: AppBar(
        backgroundColor: AppColors.transparentColor,
        title: const Text(
          Strings.strInRoomControlForm,
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
            CommonTextfield(
              isReadOnly: true,
              title: Strings.strRoomNumber,
              controller: controller.roomController,
            ).paddingOnly(bottom: 20),
            CommonDropdown(
              title: Strings.strIssueType,
              items: Strings.lstRoomIssueType,
              hint: '',
              selectedOption: controller.selectedIssueType,
            ).paddingOnly(bottom: 20),
            CommonTextfield(
              title: Strings.strIssueDescription,
              controller: controller.descriptionController,
              maxLines: 4,
            ).paddingOnly(bottom: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  flex: 5,
                  child: CommonTextfield(
                    isReadOnly: true,
                    controller: controller.dateController,
                    title: Strings.strRequestDate,
                    suffix: const Icon(Icons.calendar_month_outlined),
                    onTap: () async {
                      var date = await showDatePicker(
                        context: context,
                        lastDate: DateTime.now().add(const Duration(days: 60)),
                        firstDate: DateTime.now(),
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
                        controller.dateController.text =
                            DateFormat("dd/MM/yyyy").format(date);
                      }
                    },
                  ),
                  // child: CommonTextfield(
                  //   controller: controller.dateController,
                  //   title: Strings.strRequestDate,
                  //   suffix: const Icon(Icons.calendar_month_outlined),
                  //   onTap: () async {
                  //     var date = await showDatePicker(
                  //       context: context,
                  //       lastDate: DateTime.now().add(const Duration(days: 10)),
                  //       firstDate: DateTime.now(),
                  //       builder: (context, child) => Theme(
                  //         data: ThemeData.light().copyWith(
                  //           datePickerTheme: DatePickerThemeData(
                  //               backgroundColor: AppColors.primaryDarkColor,
                  //               dayForegroundColor: WidgetStateProperty.all(
                  //                 AppColors.whiteColor,
                  //               ),
                  //               yearForegroundColor: WidgetStateProperty.all(
                  //                 AppColors.whiteColor,
                  //               ),
                  //               todayForegroundColor: WidgetStateProperty.all(
                  //                 AppColors.primaryColor,
                  //               ),
                  //               rangePickerBackgroundColor:
                  //                   AppColors.whiteColor),
                  //         ),
                  //         child: child!,
                  //       ),
                  //     );
                  //     if (date != null) {
                  //       controller.dateController.text =
                  //           DateFormat("dd/MM/yyyy").format(date);
                  //     }
                  //   },
                  // ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  flex: 5,
                  child: CommonTextfield(
                    isReadOnly: true,
                    controller: controller.timeController,
                    title: Strings.strRequestTime,
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
                        controller.timeController.text = time.format(context);
                      }
                    },
                  ),
                ),
              ],
            ).paddingOnly(bottom: 20),
            const SizedBox(height: 80),
            CommonButton(
              onPress: () {
                Get.toNamed(
                  RouteConst.confirmOrderPage,
                  arguments: {
                    'from': RouteConst.inRoomControlForm,
                    'name': Strings.strInRoomControls,
                    "message": 'Your request to ',
                    "requestName": "Fix Wi-fi Connection",
                    'servicePerson': "Mr. Ajit Pathak",
                    "time": "10:00 min",
                  },
                );
              },
              text: Strings.strBook,
            ).paddingOnly(bottom: 40),
          ],
        ).paddingAll(25),
      ),
    );
  }
}
