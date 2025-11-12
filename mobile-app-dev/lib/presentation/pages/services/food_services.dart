import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/pages/services/controller/food_services_controller.dart';
import 'package:knecthotel/presentation/widgets/common_button.dart';
import 'package:knecthotel/presentation/widgets/common_counter_btn.dart';

class FoodServices extends GetView<FoodServicesController> {
  const FoodServices({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: controller.tabController.length,
      child: Scaffold(
        backgroundColor: AppColors.scaffoldBg,
        appBar: AppBar(
          backgroundColor: AppColors.transparentColor,
          title: const Text(
            Strings.strFoodServices,
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
            Theme(
              data: Theme.of(context).copyWith(
                splashFactory: NoSplash.splashFactory, // Disables ripple effect
                highlightColor:
                    Colors.transparent, // Removes highlight color on tap
              ),
              child: TabBar(
                controller: controller.tabController,
                labelColor: AppColors.blackColor,
                dividerColor: AppColors.transparentColor,
                isScrollable: true,
                indicatorColor: AppColors.transparentColor,
                padding: EdgeInsets.zero,
                tabs: [
                  Obx(
                    () => Container(
                      decoration: BoxDecoration(
                        color: controller.selectedIndex.value == 0
                            ? AppColors.primaryDarkColor
                            : AppColors.scaffoldBg,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        Strings.strFastFood,
                        maxLines: 1,
                        style: TextStyle(
                          fontFamily: FontFamily.openSansMedium,
                          overflow: TextOverflow.ellipsis,
                          fontSize: 13,
                          color: controller.selectedIndex.value == 0
                              ? AppColors.whiteColor
                              : AppColors.unSelectedColor,
                        ),
                      ).paddingAll(4),
                    ),
                  ),
                  Obx(
                    () => Container(
                      decoration: BoxDecoration(
                        color: controller.selectedIndex.value == 1
                            ? AppColors.primaryDarkColor
                            : AppColors.scaffoldBg,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        Strings.strStarter,
                        maxLines: 1,
                        style: TextStyle(
                          fontFamily: FontFamily.openSansMedium,
                          overflow: TextOverflow.ellipsis,
                          fontSize: 13,
                          color: controller.selectedIndex.value == 1
                              ? AppColors.whiteColor
                              : AppColors.unSelectedColor,
                        ),
                      ).paddingAll(4),
                    ),
                  ),
                  Obx(
                    () => Container(
                      decoration: BoxDecoration(
                        color: controller.selectedIndex.value == 2
                            ? AppColors.primaryDarkColor
                            : AppColors.scaffoldBg,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        Strings.strMainCourse,
                        maxLines: 1,
                        style: TextStyle(
                          overflow: TextOverflow.ellipsis,
                          fontFamily: FontFamily.openSansMedium,
                          fontSize: 13,
                          color: controller.selectedIndex.value == 2
                              ? AppColors.whiteColor
                              : AppColors.unSelectedColor,
                        ),
                      ).paddingAll(4),
                    ),
                  ),
                  Obx(
                    () => Container(
                      decoration: BoxDecoration(
                        color: controller.selectedIndex.value == 3
                            ? AppColors.primaryDarkColor
                            : AppColors.scaffoldBg,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        Strings.strBeverages,
                        maxLines: 1,
                        style: TextStyle(
                          overflow: TextOverflow.ellipsis,
                          fontFamily: FontFamily.openSansMedium,
                          fontSize: 13,
                          color: controller.selectedIndex.value == 3
                              ? AppColors.whiteColor
                              : AppColors.unSelectedColor,
                        ),
                      ).paddingAll(4),
                    ),
                  )
                ],
              ).paddingOnly(bottom: 30),
            ),
            Expanded(
              child: TabBarView(
                controller: controller.tabController,
                children: [
                  _tabOne(),
                  _tabTwo(),
                  _tabThree(),
                  _tabFour(),
                ],
              ),
            ),
            CommonButton(
              onPress: () {
                Get.toNamed(RouteConst.foodCheckOut);
              },
              text: Strings.strDone,
            ).paddingOnly(bottom: 40)
          ],
        ).paddingSymmetric(horizontal: 25),
      ),
    );
  }

  Widget _tabOne() {
    return _foodList(controller.filteredFoodList);
  }

  Widget _tabTwo() {
    return _foodList(controller.filteredFoodList);
  }

  Widget _tabThree() {
    return _foodList(controller.filteredFoodList);
  }

  Widget _tabFour() {
    return _beveragesList(controller.filteredBeveragesList);
  }

  Widget _foodList(items) {
    return Obx(
      () => ListView.separated(
        itemCount: items.length + 1,
        separatorBuilder: (context, index) => const SizedBox(height: 20),
        itemBuilder: (context, index) {
          if (index == 0) {
            return Obx(
              () => Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _toggleButton(Strings.strVeg, true),
                  const SizedBox(width: 10),
                  _toggleButton(Strings.strNonVeg, false),
                ],
              ).paddingSymmetric(vertical: 10),
            );
          }

          final item = items[index - 1];
          return Theme(
              data: ThemeData.light().copyWith(
                dividerColor: AppColors.transparentColor,
              ),
              child: ExpansionTile(
                visualDensity: VisualDensity.compact,
                tilePadding: EdgeInsets.zero,
                showTrailingIcon: false,
                title: Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.asset(item["image"],
                          width: 50, height: 50, fit: BoxFit.cover),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(item["name"],
                              style: const TextStyle(
                                fontSize: 16,
                                fontFamily: FontFamily.openSansMedium,
                              )),
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(2),
                                decoration: BoxDecoration(
                                    border: Border.all(
                                  color: controller.toggleButtonSelected.value
                                      ? AppColors.successColor
                                      : AppColors.errorColor,
                                  width: 0.5,
                                )),
                                child: Icon(Icons.circle,
                                    size: 10,
                                    color: item["isVeg"]
                                        ? Colors.green
                                        : Colors.red),
                              ),
                              const SizedBox(width: 10),
                              Text("₹${item["price"]}",
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontFamily: FontFamily.openSansRegular,
                                    color: Colors.black54,
                                  )),
                            ],
                          ),
                        ],
                      ),
                    ),
                    Obx(
                      () => controller.selectedFoodQuantities[index].value > 0
                          ? CommonCounterBtn(
                              bgColor: AppColors.transparentColor,
                              borderColor: AppColors.transparentColor,
                              positiveBtnColor: AppColors.primaryDarkColor,
                              negativeBtnColor: AppColors.primaryDarkColor,
                              counterTxt:
                                  controller.selectedFoodQuantities[index],
                              minValue: 0,
                            )
                          : OutlinedButton(
                              style: OutlinedButton.styleFrom(
                                  shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              )),
                              onPressed: () {
                                controller.selectedFoodQuantities[index].value =
                                    1;
                                controller.selectedFoodQuantities[index]
                                    .refresh();
                              },
                              child: const Text(
                                Strings.strAdd,
                                style: TextStyle(
                                  inherit: true,
                                  fontSize: 14,
                                  fontFamily: FontFamily.openSansRegular,
                                  color: AppColors.blackColor,
                                ),
                              ),
                            ),
                    ),
                  ],
                ),
                children: [
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.textFieldBg,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      item["description"],
                      style: const TextStyle(
                        fontFamily: FontFamily.openSansRegular,
                        fontSize: 12,
                        color: AppColors.blackColor,
                      ),
                    ),
                  )
                ],
              ));
        },
      ),
    );
  }

  Widget _beveragesList(items) {
    return Obx(
      () => ListView.separated(
        itemCount: items.length + 1,
        separatorBuilder: (context, index) => const SizedBox(height: 20),
        itemBuilder: (context, index) {
          if (index == 0) {
            return Obx(
              () => Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _toggleButton(Strings.strAlcoholic, true),
                  const SizedBox(width: 10),
                  _toggleButton(Strings.strNonAlcoholic, false),
                ],
              ).paddingSymmetric(vertical: 10),
            );
          }

          final item = items[index - 1];

          return Theme(
              data: ThemeData.light().copyWith(
                dividerColor: AppColors.transparentColor,
              ),
              child: ExpansionTile(
                visualDensity: VisualDensity.compact,
                tilePadding: EdgeInsets.zero,
                showTrailingIcon: false,
                title: Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.asset(item["image"],
                          width: 50, height: 50, fit: BoxFit.cover),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(item["name"],
                              style: const TextStyle(
                                fontSize: 16,
                                fontFamily: FontFamily.openSansMedium,
                              )),
                        ],
                      ),
                    ),
                    Obx(
                      () => controller
                                  .selectedBeveragesQuantities[index].value >
                              0
                          ? CommonCounterBtn(
                              bgColor: AppColors.transparentColor,
                              borderColor: AppColors.transparentColor,
                              positiveBtnColor: AppColors.primaryDarkColor,
                              negativeBtnColor: AppColors.primaryDarkColor,
                              counterTxt:
                                  controller.selectedBeveragesQuantities[index],
                              minValue: 0,
                            )
                          : OutlinedButton(
                              style: OutlinedButton.styleFrom(
                                  shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              )),
                              onPressed: () {
                                controller.selectedBeveragesQuantities[index]
                                    .value = 1;
                                controller.selectedBeveragesQuantities[index]
                                    .refresh();
                              },
                              child: const Text(
                                Strings.strAdd,
                                style: TextStyle(
                                  inherit: true,
                                  fontSize: 14,
                                  fontFamily: FontFamily.openSansRegular,
                                  color: AppColors.blackColor,
                                ),
                              ),
                            ),
                    ),
                  ],
                ),
                children: [
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.textFieldBg,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      item["description"],
                      style: const TextStyle(
                        fontFamily: FontFamily.openSansRegular,
                        fontSize: 12,
                        color: AppColors.blackColor,
                      ),
                    ),
                  )
                ],
              ));
        },
      ),
    );
  }

  Widget _toggleButton(String text, bool isVeg) {
    return GestureDetector(
      onTap: () {
        controller.toggleButtonSelected.value = isVeg;
        controller.updateFilteredList();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: controller.toggleButtonSelected.value == isVeg
              ? Colors.green.withOpacity(0.1)
              : Colors.transparent,
          border: Border.all(
            color: controller.toggleButtonSelected.value == isVeg
                ? Colors.green
                : Colors.grey,
            width: 1.5,
          ),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          text,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: controller.toggleButtonSelected.value == isVeg
                ? Colors.green
                : Colors.grey,
          ),
        ),
      ),
    );
  }
}
