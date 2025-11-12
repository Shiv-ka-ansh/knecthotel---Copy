import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/pages/services/controller/toiletries_checkout_page_controller.dart';
import 'package:knecthotel/presentation/widgets/common_button.dart';
import 'package:knecthotel/presentation/widgets/common_counter_btn.dart';

class ToiletriesCheckoutPage extends GetView<ToiletriesCheckoutPageController> {
  const ToiletriesCheckoutPage({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: controller.tabController.length,
      child: Scaffold(
        backgroundColor: AppColors.scaffoldBg,
        appBar: AppBar(
          backgroundColor: AppColors.transparentColor,
          title: const Text(
            Strings.strSelectToiletries,
            style: TextStyle(
              color: AppColors.blackColor,
              fontFamily: FontFamily.openSansBold,
            ),
          ),
          centerTitle: true,
          elevation: 0,
        ),
        bottomNavigationBar: Container(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 30),
          color: Colors
              .transparent, // Optional if you want to keep background transparent
          child: CommonButton(
            onPress: () {
              Get.toNamed(RouteConst.toiletriesOrderSummaryPage);
            },
            text: Strings.strDone,
          ),
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
                    Strings.strBathingEssentials,
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
                    Strings.strLavtoryEssentials,
                    style: TextStyle(
                      fontFamily: FontFamily.openSansMedium,
                      fontSize: 15,
                      color: controller.selectedIndex.value == 1
                          ? AppColors.blackColor
                          : AppColors.unSelectedColor,
                    ),
                  ).paddingAll(4),
                ),
              ],
            ).paddingOnly(bottom: 20),
            Expanded(
              child: TabBarView(
                controller: controller.tabController,
                children: [_tabOne(), _tabTwo()],
              ),
            ),
          ],
        ).paddingSymmetric(horizontal: 20),
      ),
    );
  }

  Widget _tabOne() {
    return Obx(() => buildLaundryList(controller.bathingEssentials));
  }

  Widget _tabTwo() {
    return Obx(() => buildLaundryList(controller.bathingEssentials));
  }

  Widget buildLaundryList(List<Map<String, dynamic>> items) {
    return ListView.separated(
      padding: const EdgeInsets.only(top: 10),
      itemCount: items.length,
      separatorBuilder: (_, __) => const SizedBox(height: 25),
      itemBuilder: (context, index) {
        return buildLaundryItem(items, index);
      },
    );
  }

  Widget buildLaundryItem(List<Map<String, dynamic>> items, int index) {
    final item = items[index];

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Image
        Container(
          height: 60,
          width: 60,
          decoration: BoxDecoration(
            color: Colors.grey[300],
            borderRadius: BorderRadius.circular(8),
            image: DecorationImage(
              image: AssetImage(item['image']),
              fit: BoxFit.cover,
            ),
          ),
        ),
        const SizedBox(width: 12),

        // Details and dropdown
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(item['name'],
                  style: const TextStyle(
                      fontFamily: FontFamily.openSansBold, fontSize: 16)),
              Text('₹${item['price'].toStringAsFixed(2)}',
                  style: const TextStyle(color: Colors.black54, fontSize: 13)),
              const SizedBox(height: 4),
            ],
          ),
        ),

        // Quantity or Add Button
        Obx(
          () => controller.selectedQuantities[index].value > 0
              ? CommonCounterBtn(
                  counterTxt: controller.selectedQuantities[index],
                  borderColor: AppColors.transparentColor,
                  bgColor: AppColors.transparentColor,
                  positiveBtnColor: AppColors.primaryDarkColor,
                  negativeBtnColor: AppColors.primaryDarkColor,
                  minValue: 0,
                )
              : ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryDarkColor,
                    foregroundColor: AppColors.whiteColor,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed: () {
                    controller.selectedQuantities[index].value = 1;
                    controller.selectedQuantities[index].refresh();
                  },
                  child: const Text(Strings.strAdd),
                ),
        ),
      ],
    );
  }
}
