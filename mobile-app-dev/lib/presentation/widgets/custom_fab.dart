import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/gen/fonts.gen.dart';

class CustomFAB extends StatelessWidget {
  const CustomFAB({super.key});

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        // Text container
        Positioned(
          right: 55,
          bottom: 20,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: const BoxDecoration(
              color: AppColors.textFieldBg,
              borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(8), bottomLeft: Radius.circular(8)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black38,
                  blurRadius: 4,
                  offset: Offset(2, 2),
                ),
              ],
            ),
            child: const Text(
              Strings.strAskDoubts,
              style: TextStyle(
                fontSize: 16,
                fontFamily: FontFamily.openSansMedium,
              ),
            ).paddingOnly(right: 5),
          ),
        ),

        Positioned(
          right: 10,
          bottom: 10,
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              FloatingActionButton(
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8)),
                onPressed: () {
                  // Add your action here
                },
                backgroundColor: AppColors.textFieldBg,
                elevation: 3,
                mini: false,
                child: const Icon(
                  Icons.chat_bubble,
                  color: AppColors.primaryDarkColor,
                  size: 35,
                ),
              ),
              // Green indicator dot
              const Positioned(
                top: 2,
                right: 2,
                child: CircleAvatar(
                  backgroundColor: AppColors.successColor,
                  radius: 5,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
