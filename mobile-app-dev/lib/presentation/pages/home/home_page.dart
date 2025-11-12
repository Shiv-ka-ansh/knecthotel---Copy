import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/gen/assets.gen.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/pages/home/controller/home_page_controller.dart';

class HomePage extends GetView<HomePageController> {
  const HomePage({super.key});

  @override
  HomePageController get controller => Get.put(HomePageController());

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner Image
          Stack(
            children: [
              Assets.images.hotel1.image(
                width: double.infinity,
                height: 500,
                fit: BoxFit.cover,
              ),
              const Positioned(
                top: 150,
                left: 50,
                right: 50,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(
                      "Namaste Village",
                      maxLines: 1,
                      style: TextStyle(
                        fontSize: 26,
                        fontFamily: FontFamily.openSansBold,
                        color: AppColors.whiteColor,
                      ),
                    ),
                    Text(
                      "Jaipur",
                      style: TextStyle(
                        fontSize: 22,
                        fontFamily: FontFamily.openSansSemiBold,
                        color: AppColors.whiteColor,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          // Content Section
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _sectionTitle(Strings.strEasyReach, true, () {
                  Get.toNamed(RouteConst.amenitiesPage, arguments: {
                    "name": Strings.strEasyReach,
                    'amenities': controller.amenities,
                  });
                }).paddingOnly(bottom: 20, top: 20),
                _horizontalAmenitiesList().paddingOnly(bottom: 20),
                _sectionTitle(Strings.strAbout, false, () {})
                    .paddingOnly(bottom: 15),
                _aboutSection().paddingOnly(bottom: 20),
                _sectionTitle(Strings.strReviews, false, () {})
                    .paddingOnly(bottom: 15),
                _horizontalReviewsList().paddingOnly(bottom: 20),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionTitle(String title, bool showIcon, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            maxLines: 1,
            style: const TextStyle(
              fontSize: 20,
              fontFamily: FontFamily.openSansSemiBold,
              overflow: TextOverflow.ellipsis,
              color: AppColors.blackColor,
            ),
          ),
          showIcon
              ? const Icon(Icons.arrow_forward_ios,
                  size: 16, color: AppColors.blackColor)
              : const SizedBox(),
        ],
      ),
    );
  }

  // **Horizontal Scroll for Amenities**
  Widget _horizontalAmenitiesList() {
    return SizedBox(
      height: 80,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: controller.amenities.length,
        itemBuilder: (context, index) {
          final amenities = controller.amenities[index];
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8.0),
            child: GestureDetector(
              onTap: () {
                controller.amenities[index].onClick();
              },
              child: Container(
                width: 75,
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.textFieldBg,
                  borderRadius: BorderRadius.circular(8),
                  boxShadow: const [
                    BoxShadow(
                      color: Colors.black12,
                      blurRadius: 4,
                      spreadRadius: 1,
                    ),
                  ],
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    amenities.icon is AssetGenImage
                        ? (amenities.icon as AssetGenImage)
                            .image(width: 30, height: 30)
                        : (amenities.icon).svg(
                            colorFilter: const ColorFilter.mode(
                              AppColors.blackColor,
                              BlendMode.srcIn,
                            ),
                          ),
                    const SizedBox(height: 5),
                    Text(
                      maxLines: 1,
                      amenities.name,
                      style: const TextStyle(
                        overflow: TextOverflow.ellipsis,
                        fontFamily: FontFamily.openSansMedium,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _aboutSection() {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: AppColors.textFieldBg,
        borderRadius: BorderRadius.circular(8),
      ),
      child: const Text(
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Convallis eu vel vitae cras velit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Convallis eu vel vitae cras velit.",
        style: TextStyle(
          fontSize: 14,
          fontFamily: FontFamily.openSansRegular,
        ),
      ),
    );
  }

  // **Horizontal Scroll for Reviews**
  Widget _horizontalReviewsList() {
    return SizedBox(
      height: 120,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: controller.reviews.length,
        itemBuilder: (context, index) {
          return Card(
            elevation: 2,
            clipBehavior: Clip.hardEdge,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            child: Container(
              width: 180,
              padding: const EdgeInsets.all(15),
              decoration: const BoxDecoration(
                color: AppColors.whiteColor,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(controller.reviews[index]["name"]!,
                      maxLines: 1,
                      style: const TextStyle(
                          overflow: TextOverflow.ellipsis,
                          fontFamily: FontFamily.openSansBold,
                          color: AppColors.blackColor)),
                  const SizedBox(height: 5),
                  Text(controller.reviews[index]["review"]!,
                      style: const TextStyle(
                          fontFamily: FontFamily.openSansRegular,
                          color: AppColors.blackColor)),
                ],
              ),
            ),
          ).marginSymmetric(horizontal: 5);
        },
      ),
    );
  }
}
