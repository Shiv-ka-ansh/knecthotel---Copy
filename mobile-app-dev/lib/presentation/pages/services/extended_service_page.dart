import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/pages/services/controller/extended_service_page_controller.dart';

class ExtendedServicePage extends GetView<ExtendedServicePageController> {
  const ExtendedServicePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: AppBar(
        backgroundColor: AppColors.transparentColor,
        title: Text(
          controller.data['name'] ?? Strings.strServices,
          style: const TextStyle(
            color: AppColors.blackColor,
            fontFamily: FontFamily.openSansBold,
          ),
        ),
        centerTitle: true,
        elevation: 0,
      ),
      body: ListView.separated(
        padding: const EdgeInsets.symmetric(vertical: 20),
        itemCount: controller.services.length,
        separatorBuilder: (context, index) => const SizedBox(height: 10),
        itemBuilder: (context, index) {
          final service = controller.services[index];
          return GestureDetector(
            onTap: () {
              controller.selectedIndex(index);
              controller.services[index].onClick();
            },
            child: Obx(
              () => Card(
                color: controller.selectedIndex.value == index
                    ? AppColors.textFieldBg
                    : AppColors.scaffoldBg,
                elevation: controller.selectedIndex.value == index ? 2 : 0,
                child: Row(
                  crossAxisAlignment:
                      CrossAxisAlignment.center, // Align items properly
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: service.img.image(
                        height: 80,
                        fit: BoxFit.cover,
                      ),
                    ),
                    const SizedBox(
                      width: 15,
                    ), // Add space between image and text
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment
                            .center, // Ensures text is centered
                        children: [
                          Text(
                            service.name,
                            style: const TextStyle(
                              fontSize: 16,
                              fontFamily: FontFamily.openSansMedium,
                              color: AppColors.blackColor,
                            ),
                          ),
                          const SizedBox(height: 5),
                          Text(
                            service.description, // Replace with actual subtitle
                            style: const TextStyle(
                              fontSize: 12,
                              fontFamily: FontFamily.openSansRegular,
                              color: Colors.black54,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Icon(
                      size: 20,
                      Icons.arrow_forward_ios_outlined,
                      color: AppColors.primaryDarkColor,
                    ).paddingOnly(right: 15),
                  ],
                ),
              ),
            ),
          );
        },
      ).paddingOnly(top: 10, bottom: 20, left: 15, right: 15),
    );
  }
}
