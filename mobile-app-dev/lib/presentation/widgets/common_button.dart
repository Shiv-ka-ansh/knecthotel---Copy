import 'package:flutter/material.dart';

import '../../app/config/app_colors.dart';
import '../../gen/fonts.gen.dart';

class CommonButton extends StatelessWidget {
  const CommonButton({
    super.key,
    required this.onPress,
    required this.text,
    this.textSize = 16,
    this.textColor = AppColors.whiteColor,
    this.isLight = false,
    this.bgColor = AppColors.primaryColor,
    this.borderColor = AppColors.unSelectedColor,
    this.borderRadius = 12,
  });

  final VoidCallback onPress;
  final String text;
  final bool isLight;
  final Color bgColor;
  final Color borderColor;
  final double borderRadius;
  final double textSize;
  final Color textColor;

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
        style: ElevatedButton.styleFrom(
            backgroundColor: isLight ? AppColors.whiteColor : bgColor,
            minimumSize: const Size(double.infinity, 54),
            shape: RoundedRectangleBorder(
                side: isLight
                    ? BorderSide(color: borderColor, width: 1)
                    : BorderSide.none,
                borderRadius: BorderRadius.circular(borderRadius))),
        onPressed: onPress,
        child: Text(
          text,
          style: TextStyle(
              fontFamily: FontFamily.openSansSemiBold,
              fontSize: textSize,
              color: isLight ? AppColors.unSelectedColor : textColor),
        ));
  }
}
