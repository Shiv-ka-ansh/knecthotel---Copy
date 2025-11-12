import 'package:flutter/material.dart';
import 'package:flutter_dash/flutter_dash.dart';

import 'package:get/get.dart';
import 'package:intl/intl.dart';

import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/gen/assets.gen.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/pages/amenities/controller/swimming_pool_page_controller.dart';
import 'package:knecthotel/presentation/widgets/common_textfield.dart';

class SwimmingPoolPage extends GetView<SwimmingPoolPageController> {
  const SwimmingPoolPage({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: controller.tabController.length,
      child: Scaffold(
        backgroundColor: AppColors.scaffoldBg,
        appBar: AppBar(
          backgroundColor: AppColors.transparentColor,
          title: const Text(
            Strings.strSwimmingPool,
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
              isScrollable: true,
              indicatorWeight: 0.2,
              tabs: [
                Obx(
                  () => Text(
                    Strings.strViewPool,
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
                    Strings.strBookSlot,
                    style: TextStyle(
                      fontFamily: FontFamily.openSansMedium,
                      fontSize: 15,
                      color: controller.selectedIndex.value == 1
                          ? AppColors.blackColor
                          : AppColors.unSelectedColor,
                    ),
                  ).paddingAll(4),
                ),
                Obx(
                  () => Text(
                    Strings.strRouleRegulation,
                    maxLines: 1,
                    style: TextStyle(
                      fontFamily: FontFamily.openSansMedium,
                      overflow: TextOverflow.ellipsis,
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
                children: [
                  _tabOne(context),
                  _tabTwo(context),
                  _tabThree(context),
                ],
              ),
            ),
          ],
        ).paddingSymmetric(horizontal: 25),
      ),
    );
  }

  Widget _tabOne(context) {
    return SingleChildScrollView(
      child: poolDetailsScreen(context),
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
          Dash(
            direction: Axis.horizontal,
            length: (MediaQuery.of(context).size.width - 50),
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
            itemCount: controller.availableSlots.length,
            itemBuilder: (context, index) {
              return _buildSlotItem(controller.availableSlots[index]);
            },
          ),
        ],
      ).paddingOnly(top: 15),
    );
  }

  Widget _tabThree(context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Rules & Regulations
        const Text("Rules & Regulations",
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            )),
        const SizedBox(height: 8),
        ...Strings.SwimmingPoolRules.map((rule) => Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Text("• $rule", style: TextStyle(color: Colors.grey[700])),
            )),
        const SizedBox(height: 16),
      ],
    );
  }

  Widget poolDetailsScreen(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Pool Image
        ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: Assets.images.swimmingPool.image(),
        ),
        const SizedBox(height: 16),

        // Pool Details
        const Text("Pool Details",
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Text(
          "Size: Standard\n"
          "Depth: 3ft(Shallow) 6ft+ Deep end\n"
          "Water Temperature: Maintained at Comfortable level\n"
          "Hygiene: Regular cleaning & Chlorine Treated water",
          style: TextStyle(color: Colors.grey[700]),
        ),
        const SizedBox(height: 16),

        // Time & Access
        const Text("Time & Access",
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Row(
          children: [
            Text("Operating Hours: 6:00AM-12:00AM",
                style: TextStyle(color: Colors.grey[700])),
            const SizedBox(width: 8),
            const Text("Open",
                style: TextStyle(
                    color: Colors.green, fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 16),

        // Amenities
        const Text(
          "Amenities",
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          childAspectRatio: 1.25, // Adjusted to give more height
          mainAxisSpacing: 10,
          crossAxisSpacing: 10,
          children: [
            amenityItem(Assets.images.amenities0.path, 'Poolside Lounge'),
            amenityItem(
                Assets.images.amenities1.path, 'Changing Rooms & Showers'),
            amenityItem(Assets.images.amenities2.path,
                'Poolside Bar & Snacks Services'),
            amenityItem(
                Assets.images.amenities3.path, 'Temperature Controlled Water'),
          ],
        ),
      ],
    ).paddingOnly(bottom: 20);
  }

  Widget amenityItem(String imagePath, String title) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Expanded(
          child: ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Image.asset(
              imagePath,
              fit: BoxFit.cover,
              width: double.infinity,
            ),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          title,
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 12,
            color: Colors.black,
            overflow: TextOverflow.ellipsis,
          ),
          maxLines: 2,
        ),
      ],
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
                          'from': RouteConst.swimmingPoolPage,
                          'time': slot['time'],
                          'requestType': 'Swimming',
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
