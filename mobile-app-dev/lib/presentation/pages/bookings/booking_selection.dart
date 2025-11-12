import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/pages/bookings/controller/booking_selection_controller.dart';
import 'package:knecthotel/presentation/widgets/common_button.dart';
import 'package:knecthotel/presentation/widgets/common_textfield.dart';

class BookingSelection extends GetView<BookingSelectionController> {
  const BookingSelection({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: controller.tabController.length,
      child: Scaffold(
        backgroundColor: AppColors.scaffoldBg,
        appBar: AppBar(
          backgroundColor: AppColors.transparentColor,
          centerTitle: true,
          title: const Text(
            Strings.strBookings,
            style: TextStyle(
                fontFamily: FontFamily.openSansBold,
                color: AppColors.primaryDarkColor),
          ),
        ),
        bottomNavigationBar: SafeArea(
          minimum: const EdgeInsets.fromLTRB(20, 0, 20, 30),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CommonButton(
                onPress: () async {
                  await showCheckinDailog(context);
                  Get.toNamed(RouteConst.dashboard);
                },
                text: Strings.strProceedWithPreChekIn,
              ),
              const SizedBox(height: 15),
              CommonButton(
                onPress: () {
                  Get.toNamed(RouteConst.dashboard);
                },
                text: Strings.strChekInAtHotel,
              ),
            ],
          ),
        ),
        body: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TabBar(
              controller: controller.tabController,
              indicator: const BoxDecoration(),
              labelColor: AppColors.primaryDarkColor,
              dividerColor: AppColors.transparentColor,
              tabs: [
                Obx(() => Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.primaryDarkColor),
                        color: controller.selectedIndex.value == 0
                            ? AppColors.primaryDarkColor
                            // Active Tab Fill
                            : Colors.transparent,
                      ),
                      child: Center(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 5, vertical: 10),
                          child: Text(Strings.strUpcomingBookings,
                              maxLines: 1,
                              style: TextStyle(
                                overflow: TextOverflow.ellipsis,
                                fontFamily: FontFamily.openSansSemiBold,
                                fontSize: 12,
                                color: controller.selectedIndex.value == 0
                                    ? AppColors.whiteColor
                                    : AppColors.blackColor,
                              )),
                        ),
                      ),
                    )),
                Obx(() => Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.primaryDarkColor),
                        color: controller.selectedIndex.value == 1
                            ? AppColors.primaryDarkColor
                            // Active Tab Fill
                            : Colors.transparent,
                      ),
                      child: Center(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 5, vertical: 10),
                          child: Text(Strings.strPastBookings,
                              maxLines: 1,
                              style: TextStyle(
                                fontFamily: FontFamily.openSansSemiBold,
                                fontSize: 12,
                                overflow: TextOverflow.ellipsis,
                                color: controller.selectedIndex.value == 1
                                    ? AppColors.whiteColor
                                    : AppColors.blackColor,
                              )),
                        ),
                      ),
                    )),
              ],
            ),
            Expanded(
              child: TabBarView(
                controller: controller.tabController,
                children: [_tabOne(), _tabTwo()],
              ),
            ),
          ],
        ).paddingAll(20),
      ),
    );
  }

  Future<void> showCheckinDailog(BuildContext context) {
    return Get.dialog(
      barrierDismissible: true,
      useSafeArea: true,
      GestureDetector(
        onTap: () => Get.back(),
        child: Dialog(
          child: Container(
            width: 300,
            height: 190,
            decoration: BoxDecoration(
              color: AppColors.primaryDarkColor,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.whiteColor, width: 1.5),
            ),
            child: const Center(
              child: Padding(
                padding: EdgeInsets.all(30),
                child: Text(Strings.strAppliedForCheckIn,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: AppColors.whiteColor,
                      fontFamily: FontFamily.openSansMedium,
                      fontSize: 20,
                    )),
              ),
            ),
          ),
        ),
      ),
    );
  }

  ListView _tabTwo() {
    return ListView.separated(
      padding: const EdgeInsets.symmetric(vertical: 20),
      itemCount: controller.pastBookings.length,
      itemBuilder: (context, index) {
        final item = controller.pastBookings[index];
        return Card(
          elevation: 2,
          clipBehavior: Clip.hardEdge,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          child: ListTile(
            textColor: AppColors.blackColor,
            tileColor: AppColors.textFieldBg,
            dense: true,
            title: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                SizedBox(
                  width: 185,
                  child: Text(item['hotel_name'],
                      maxLines: 1,
                      style: const TextStyle(
                        fontFamily: FontFamily.openSansSemiBold,
                        fontSize: 14,
                        overflow: TextOverflow.ellipsis,
                      )),
                ),
                Text(item['date'],
                    maxLines: 1,
                    style: const TextStyle(
                      fontFamily: FontFamily.openSansMedium,
                      fontSize: 12,
                      overflow: TextOverflow.ellipsis,
                    )),
              ],
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item['room_type'],
                    maxLines: 1,
                    style: const TextStyle(
                      fontFamily: FontFamily.openSansMedium,
                      overflow: TextOverflow.ellipsis,
                    )),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      item['check_in_time'],
                      maxLines: 1,
                      style: const TextStyle(
                          fontFamily: FontFamily.openSansMedium,
                          color: AppColors.lightTextColor),
                      overflow: TextOverflow.ellipsis,
                    ),
                    Text(
                      item['status'],
                      maxLines: 1,
                      style: TextStyle(
                          fontFamily: FontFamily.openSansMedium,
                          color: item['status'] == 'Cancelled'
                              ? AppColors.errorColor
                              : AppColors.successColor),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
      separatorBuilder: (context, index) => const SizedBox(height: 10),
    );
  }

  ListView _tabOne() {
    return ListView.separated(
      padding: const EdgeInsets.symmetric(vertical: 20),
      itemCount: controller.upcomingBookings.length + 1,
      itemBuilder: (context, index) {
        if (index == controller.upcomingBookings.length) {
          return CommonTextfield(
            controller: controller.commentController,
            maxLines: 3,
            hintText: Strings.strMessageHint,
          );
        }

        final item = controller.upcomingBookings[index];
        return ListTile(
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          textColor: AppColors.whiteColor,
          tileColor: AppColors.primaryDarkColor,
          dense: true,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          title: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              SizedBox(
                width: 185,
                child: Text(
                  item['title'],
                  maxLines: 1,
                  style: const TextStyle(
                    fontFamily: FontFamily.openSansSemiBold,
                    fontSize: 14,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ),
              Text(item['date'],
                  maxLines: 1,
                  style: const TextStyle(
                    fontFamily: FontFamily.openSansMedium,
                    fontSize: 12,
                    overflow: TextOverflow.ellipsis,
                  )),
            ],
          ),
          subtitle: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(item['room-type'],
                      maxLines: 1,
                      style: const TextStyle(
                        fontFamily: FontFamily.openSansMedium,
                        overflow: TextOverflow.ellipsis,
                      )),
                  const SizedBox(height: 10),
                  Text(
                    item['checkIn'],
                    maxLines: 1,
                    style: const TextStyle(
                        fontFamily: FontFamily.openSansMedium,
                        color: AppColors.lightTextColor),
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
              InkWell(
                onTap: () => Get.toNamed(RouteConst.viewRooms),
                child: const FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Card(
                    color: AppColors.textFieldBg,
                    elevation: 4,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.all(Radius.circular(8)),
                    ),
                    child: Padding(
                      padding: EdgeInsets.all(8),
                      child: Text(
                        Strings.strViewRooms,
                        maxLines: 1,
                        style: TextStyle(
                          color: AppColors.primaryDarkColor,
                          fontFamily: FontFamily.openSansMedium,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
      separatorBuilder: (context, index) => const SizedBox(height: 10),
    );
  }
}
