import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/gen/assets.gen.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/widgets/common_button.dart';
import 'controller/book_slot_controller.dart';

class BookSlot extends GetView<BookSlotController> {
  const BookSlot({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: AppBar(
        backgroundColor: AppColors.transparentColor,
        title: const Text(
          Strings.strBookSlot,
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
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                decoration: BoxDecoration(
                  color: AppColors.textFieldBg,
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
                  title: Obx(
                    () => Text(
                      controller.data['time']?.toString() ??
                          '8:30am-9:00pm',
                      style: const TextStyle(
                        color: AppColors.blackColor,
                        fontFamily: FontFamily.openSansRegular,
                        fontSize: 14,
                      ),
                    ),
                  ),
                  trailing: ElevatedButton(
                    onPressed: () {},
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryColor,
                      visualDensity: VisualDensity.compact,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 8),
                    ),
                    child: const Text(
                      'INR 899/-',
                      style: TextStyle(
                        color: AppColors.whiteColor,
                        fontFamily: FontFamily.openSansRegular,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ),
              ),
              const Text(
                Strings.strExcludeGst,
                style: TextStyle(
                  color: Colors.black45,
                  fontFamily: FontFamily.openSansRegular,
                  fontSize: 14,
                ),
              ).paddingOnly(top: 10),
            ],
          ),
          if (controller.data['from'] == RouteConst.spaPage)
            _messageSection().paddingOnly(top: 20),
          if (controller.data['from'] == RouteConst.swimmingPoolPage)
            _swimmingPoolComment().paddingOnly(top: 20),
          const Spacer(),
          CommonButton(
            onPress: () {
              final String from = (controller.data['from'] ?? '').toString();
              switch (from) {
                case RouteConst.swimmingPoolPage:
                  Get.toNamed(RouteConst.paymentPage, arguments: {
                    'from': RouteConst.swimmingPoolPage,
                  });
                  break;
                case RouteConst.gymPage:
                  Get.toNamed(RouteConst.paymentPage, arguments: {
                    'from': RouteConst.gymPage,
                  });
                  break;
                case RouteConst.spaPage:
                  Get.toNamed(RouteConst.paymentPage, arguments: {
                    'from': RouteConst.spaPage,
                  });
                  break;
              }
            },
            text: Strings.strConfirmBooking,
          ).paddingOnly(bottom: 40),
        ],
      ).paddingAll(25),
    );
  }

  Widget _swimmingPoolComment() {
    return Container(
      padding: const EdgeInsets.all(10),
      width: double.infinity,
      height: 80,
      decoration: BoxDecoration(
        border: Border.all(
          color: AppColors.whiteColor,
          width: 1,
        ),
        borderRadius: BorderRadius.circular(12),
        image: DecorationImage(
            image: AssetImage(Assets.images.swimmingPoolComment.path),
            fit: BoxFit.cover),
      ),
      child: const Center(
        child: Text(
          '"Make a splash—book your perfect   poolside escape today!',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: AppColors.whiteColor,
            fontFamily: FontFamily.openSansMedium,
            fontSize: 16,
          ),
        ),
      ),
    );
  }

  Widget _messageSection() {
    return Stack(
      children: [
        ClipPath(
          clipper: MessageClipper(),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.textFieldBg,
              border: Border.all(color: AppColors.whiteColor, width: 1.5),
              borderRadius: BorderRadius.circular(20),
            ),
            child: TextField(
              maxLines: 4,
              controller: controller.messageController,
              style: const TextStyle(
                fontFamily: FontFamily.openSansRegular,
                fontSize: 16,
                color: AppColors.blackColor,
              ),
              decoration: const InputDecoration(
                hintText: Strings.strMessageHint,
                hintStyle: TextStyle(
                  fontFamily: FontFamily.openSansRegular,
                  color: Colors.grey,
                  fontSize: 16,
                ),
                border: InputBorder.none,
              ),
            ),
          ),
        ),
        Positioned(
          bottom: 4,
          right: 4,
          child: GestureDetector(
            onTap: () {
              Get.toNamed(RouteConst.paymentPage, arguments: {
                'requestType': controller.data['requestType'] ?? '',
                'description': controller.messageController.text,
              });
            },
            child: Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.primaryDarkColor,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(
                Icons.send,
                color: Colors.white,
                size: 20,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

// Custom Clipper for Cutout Effect
class MessageClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    Path path = Path()
      ..addRRect(RRect.fromRectAndRadius(
          Rect.fromLTWH(0, 0, size.width, size.height),
          const Radius.circular(20)))
      ..addRRect(RRect.fromRectAndRadius(
          Rect.fromLTWH(size.width - 50, size.height - 50, 50, 50),
          const Radius.circular(8))); // Rounded square cutout

    return path..fillType = PathFillType.evenOdd;
  }

  @override
  bool shouldReclip(CustomClipper<Path> oldClipper) => true;
}
