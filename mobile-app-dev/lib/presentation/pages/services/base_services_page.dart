import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/gen/assets.gen.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/widgets/custom_fab.dart';

import 'controller/base_services_page_controller.dart';

class BaseServicesPage extends GetView<BaseServicesPageController> {
  const BaseServicesPage({super.key});

  @override
  BaseServicesPageController get controller =>
      Get.put(BaseServicesPageController());

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: AppBar(
        backgroundColor: AppColors.transparentColor,
        title: const Text(
          Strings.strServices,
          style: TextStyle(
            color: AppColors.blackColor,
            fontFamily: FontFamily.openSansBold,
          ),
        ),
        centerTitle: true,
        elevation: 0,
        actions: [
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              InkWell(
                onTap: () {
                  Get.toNamed(RouteConst.sosRequestForm);
                },
                child: const Icon(
                  size: 30,
                  Icons.notifications,
                  color: AppColors.errorColor,
                ),
              ),
              const Text(
                Strings.strSOS,
                style: TextStyle(
                  color: AppColors.blackColor,
                  fontFamily: FontFamily.openSansSemiBold,
                ),
              )
            ],
          ).paddingOnly(right: 15)
        ],
      ),
      floatingActionButton: const CustomFAB(),
      body: Padding(
        padding: const EdgeInsets.only(top: 10, bottom: 30),
        child: ListView.builder(
          padding: const EdgeInsets.symmetric(vertical: 10),
          itemCount: controller.amenities.length,
          itemBuilder: (context, index) {
            final service = controller.amenities[index];

            return Padding(
              padding: const EdgeInsets.only(bottom: 5),
              child: Obx(
                () => GestureDetector(
                  onTap: () {
                    controller.selectedIndex(index);
                    controller.amenities[index].onClick();
                  },
                  child: Card(
                    color: AppColors.scaffoldBg,
                    elevation: controller.selectedIndex.value == index ? 5 : 0,
                    child: Container(
                      decoration: BoxDecoration(
                        color: controller.selectedIndex.value == index
                            ? AppColors.primaryDarkColor
                            : AppColors.transparentColor,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: ListTile(
                        contentPadding: const EdgeInsets.symmetric(
                            vertical: 1, horizontal: 16),
                        leading: service.icon is AssetGenImage
                            ? (service.icon as AssetGenImage).image(
                                width: 30,
                                height: 30,
                                color: controller.selectedIndex.value == index
                                    ? AppColors.whiteColor
                                    : Colors.black,
                              )
                            : service.icon.svg(
                                colorFilter: ColorFilter.mode(
                                  controller.selectedIndex.value == index
                                      ? AppColors.whiteColor
                                      : Colors.black,
                                  BlendMode.srcIn,
                                ),
                              ),
                        title: Text(
                          service.name,
                          style: TextStyle(
                            fontSize: 16,
                            fontFamily: FontFamily.openSansMedium,
                            color: controller.selectedIndex.value == index
                                ? AppColors.whiteColor
                                : Colors.black,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            );
          },
        ).paddingSymmetric(horizontal: 20),
      ),
    );
  }
}
