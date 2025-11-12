import 'package:flutter/material.dart';
import 'package:flutter_dash/flutter_dash.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/widgets/common_textfield.dart';

import 'controller/gym_page_controller.dart';

class GymPage extends GetView<GymPageController> {
  const GymPage({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: controller.tabController.length,
      child: Scaffold(
        backgroundColor: AppColors.scaffoldBg,
        appBar: AppBar(
          backgroundColor: AppColors.transparentColor,
          title: const Text(
            Strings.strGym,
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
            TabBar(
              controller: controller.tabController,
              labelColor: AppColors.blackColor,
              dividerColor: AppColors.transparentColor,
              indicatorColor: AppColors.primaryDarkColor,
              indicatorWeight: 0.2,
              tabs: [
                Obx(
                  () => Text(
                    Strings.strGymEssentials,
                    style: TextStyle(
                      fontFamily: FontFamily.openSansMedium,
                      fontSize: 15,
                      color: controller.selectedIndex.value == 0
                          ? AppColors.blackColor
                          : AppColors.unSelectedColor,
                    ),
                  ).paddingAll(4),
                ),
                Obx(
                  () => Text(
                    Strings.strGymSlotsAvilable,
                    style: TextStyle(
                      fontFamily: FontFamily.openSansMedium,
                      fontSize: 15,
                      color: controller.selectedIndex.value == 1
                          ? AppColors.blackColor
                          : AppColors.unSelectedColor,
                    ),
                  ).paddingAll(4),
                )
              ],
            ).paddingOnly(bottom: 30),
            Expanded(
              child: TabBarView(
                controller: controller.tabController,
                children: [_tabOne(), _tabTwo(context)],
              ),
            ),
          ],
        ).paddingSymmetric(horizontal: 25),
      ),
    );
  }

  Widget _tabOne() {
    return SingleChildScrollView(
      child: Column(
        children: [
          GridView.builder(
            physics: const NeverScrollableScrollPhysics(),
            shrinkWrap: true,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 4, // Number of columns
              crossAxisSpacing: 5,
              mainAxisSpacing: 20,
              childAspectRatio: 1.0, // Aspect ratio of items
            ),
            itemCount: controller.gymEssentials.length, // Avoid index error
            itemBuilder: (context, index) {
              return Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                ),
                child: controller.gymEssentials[index],
              );
            },
          ).paddingOnly(bottom: 30),
          const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                Strings.strGymActiveHours, // Only this is from Strings
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text("Morning"),
                  Text("8:00am-11:00am"),
                ],
              ),
              SizedBox(height: 4),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text("Afternoon"),
                  Text("12:00pm-3:00pm"),
                ],
              ),
              SizedBox(height: 4),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text("Evening"),
                  Text("5:00pm-8:00pm"),
                ],
              ),
            ],
          ).paddingOnly(bottom: 20),
        ],
      ),
    );
  }

  Widget _tabTwo(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CommonTextfield(
            isReadOnly: true,
            controller: controller.dateController,
            hintText: Strings.strSelectDate,
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
          ).paddingOnly(bottom: 20),
          CommonTextfield(
            isReadOnly: true,
            controller: controller.timeController,
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
                controller.timeController.text = time.format(context);
              }
            },
          ).paddingOnly(bottom: 20),
          const Dash(
            direction: Axis.horizontal,
            length: 200,
            dashLength: 2,
            dashColor: Colors.grey,
          ).paddingSymmetric(vertical: 10),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 2),
            child: Text(
              Strings.strAvilableSlots,
              style: TextStyle(
                fontSize: 16,
                fontFamily: FontFamily.openSansMedium,
                color: AppColors.blackColor,
              ),
            ),
          ),
          const SizedBox(height: 10),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: controller.gymSlots.length,
            itemBuilder: (context, index) {
              return _buildSlotItem(controller.gymSlots[index]);
            },
          ),
        ],
      ).paddingOnly(top: 15),
    );
  }

  Widget _buildSlotItem(Map<String, dynamic> slot) {
    bool isAvailable = slot["isAvailable"];
    bool isLimited = slot.containsKey("isLimited") ? slot["isLimited"] : false;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 2),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Container(
            decoration: BoxDecoration(
              color: isAvailable ? AppColors.textFieldBg : Colors.grey.shade500,
              borderRadius: BorderRadius.circular(12),
              boxShadow: const [
                BoxShadow(
                  color: Colors.black26,
                  blurRadius: 4,
                  spreadRadius: 1,
                ),
              ],
            ),
            child: ListTile(
              title: Text(
                slot["time"],
                style: const TextStyle(
                  color: AppColors.blackColor,
                  fontFamily: FontFamily.openSansRegular,
                  fontSize: 14,
                ),
              ),
              trailing: ElevatedButton(
                onPressed: isAvailable
                    ? () {
                        Get.toNamed(RouteConst.bookSlotPage, arguments: {
                          'from': RouteConst.gymPage,
                          'time': slot['time'],
                        });
                      }
                    : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryColor,
                  visualDensity: VisualDensity.compact,
                  disabledBackgroundColor: Colors.grey.shade600,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                ),
                child: const Text(
                  Strings.strBookSlot,
                  style: TextStyle(
                    color: AppColors.whiteColor,
                    fontFamily: FontFamily.openSansRegular,
                    fontSize: 14,
                  ),
                ),
              ),
            ),
          ),
          !isAvailable
              ? const Text(
                  Strings.strSlotNotAvailable,
                  style: TextStyle(
                    fontFamily: FontFamily.openSansMedium,
                    fontSize: 12,
                    color: AppColors.errorColor,
                  ),
                ).paddingOnly(right: 5, top: 2)
              : const SizedBox(),
          isLimited
              ? const Text(
                  Strings.strOnlyOneSlotRemaining,
                  style: TextStyle(
                    fontFamily: FontFamily.openSansMedium,
                    fontSize: 12,
                    color: AppColors.errorColor,
                  ),
                ).paddingOnly(right: 5, top: 2)
              : const SizedBox(),
        ],
      ),
    );
  }
}
