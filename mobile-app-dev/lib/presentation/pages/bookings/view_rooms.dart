import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/pages/bookings/controller/view_rooms_controller.dart';
import 'package:knecthotel/presentation/widgets/common_button.dart';

class ViewRooms extends GetView<ViewRoomsController> {
  const ViewRooms({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: AppBar(
        backgroundColor: AppColors.transparentColor,
        title: const Text(
          Strings.strBookings,
          style: TextStyle(
            color: AppColors.blackColor,
            fontFamily: FontFamily.openSansBold,
          ),
        ),
        centerTitle: true,
        elevation: 0,
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: GridView.builder(
              itemCount: controller.rooms.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1, // Keeps images square
              ),
              itemBuilder: (context, index) {
                return ClipRRect(
                  borderRadius: BorderRadius.circular(20), // Rounded corners
                  child: controller.rooms[index],
                );
              },
            ).paddingOnly(top: 20),
          ),
          CommonButton(
            onPress: () {
              Get.dialog(
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
                        border:
                            Border.all(color: AppColors.whiteColor, width: 1.5),
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
              Get.toNamed(RouteConst.dashboard);
            },
            text: Strings.strProceedWithPreChekIn,
          ).paddingOnly(bottom: 40)
        ],
      ).paddingAll(25),
    );
  }
}
