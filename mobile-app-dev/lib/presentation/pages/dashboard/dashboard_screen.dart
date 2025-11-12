import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/gen/assets.gen.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/pages/account/account_page.dart';
import 'package:knecthotel/presentation/pages/bookings/booking_service_request.dart';
import 'package:knecthotel/presentation/pages/dashboard/controller/dashboard_controller.dart';
import 'package:knecthotel/presentation/pages/home/home_page.dart';
import 'package:knecthotel/presentation/pages/services/base_services_page.dart';
import 'package:knecthotel/presentation/widgets/custom_fab.dart';

class DashboardScreen extends GetView<DashboardController> {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      floatingActionButton: Obx(
        () => controller.selectedPage.value == 0
            ? const CustomFAB()
            : const SizedBox(),
      ),
      body: PageView(
        controller: controller.pageController,
        physics: const NeverScrollableScrollPhysics(),
        children: const [
          HomePage(),
          BaseServicesPage(),
          BookingServiceRequest(),
          AccountPage(),
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(5),
        height: 88,
        decoration: BoxDecoration(
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(12),
            topRight: Radius.circular(12),
          ),
          color: AppColors.primaryDarkColor,
          boxShadow: [
            BoxShadow(
              blurRadius: 10,
              color: AppColors.blackColor.withOpacity(0.1),
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: Row(
          children: [
            Obx(
              () => NavBarButton(
                icon: Assets.images.icHome,
                index: 0,
                title: Strings.strHome,
                value: controller.selectedPage.value,
                onTap: () {
                  controller.selectedPage.value = 0;
                },
              ),
            ),
            Obx(
              () => NavBarButton(
                icon: Assets.images.icServices,
                index: 1,
                title: Strings.strServices,
                value: controller.selectedPage.value,
                onTap: () {
                  controller.selectedPage.value = 1;
                },
              ),
            ),
            Obx(
              () => NavBarButton(
                icon: Assets.images.icBookings,
                index: 2,
                title: Strings.strBooking,
                value: controller.selectedPage.value,
                onTap: () {
                  controller.selectedPage.value = 2;
                },
              ),
            ),
            Obx(
              () => NavBarButton(
                icon: Assets.images.icAccount,
                index: 3,
                title: Strings.strAccount,
                value: controller.selectedPage.value,
                onTap: () {
                  controller.selectedPage.value = 3;
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class NavBarButton extends StatelessWidget {
  const NavBarButton({
    super.key,
    required this.icon,
    required this.title,
    required this.index,
    required this.value,
    required this.onTap,
  });

  final SvgGenImage icon;
  final String title;
  final int index;
  final int value;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          alignment: Alignment.center,
          color: AppColors.transparentColor,
          child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(6),
                color: index == value
                    ? AppColors.primaryColor
                    : AppColors.transparentColor,
              ),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    icon
                        .svg(
                          colorFilter: const ColorFilter.mode(
                            AppColors.whiteColor,
                            BlendMode.srcIn,
                          ),
                        )
                        .paddingOnly(bottom: 6),
                    Text(
                      title,
                      style: TextStyle(
                        fontFamily: index == value
                            ? FontFamily.openSansSemiBold
                            : FontFamily.openSansRegular,
                        color: AppColors.whiteColor,
                        fontSize: 10,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              )).marginSymmetric(horizontal: 20, vertical: 6),
        ),
      ),
    );
  }
}
