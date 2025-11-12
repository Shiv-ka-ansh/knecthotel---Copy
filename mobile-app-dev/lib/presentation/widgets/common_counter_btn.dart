import 'package:flutter/material.dart';
import 'package:get/state_manager.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/gen/fonts.gen.dart';

class CommonCounterBtn extends StatelessWidget {
  final RxInt counterTxt;
  final Color bgColor;
  final Color textColor;
  final Color borderColor;
  final Color positiveBtnColor;
  final Color negativeBtnColor;
  final int minValue;
  const CommonCounterBtn({
    super.key,
    required this.counterTxt,
    this.bgColor = AppColors.textFieldBg,
    this.textColor = AppColors.blackColor,
    this.borderColor = AppColors.primaryDarkColor,
    this.positiveBtnColor = AppColors.transparentColor,
    this.negativeBtnColor = AppColors.transparentColor,
    this.minValue = 1,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 30,
      width: 100,
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: borderColor, width: 1.1),
      ),
      child: Obx(
        () => Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            InkWell(
              onTap: () {
                if (counterTxt.value > minValue) {
                  counterTxt.value--;
                }
              },
              child: Container(
                padding: const EdgeInsets.all(1),
                decoration: BoxDecoration(
                  color: negativeBtnColor,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Icon(
                  size: 18,
                  Icons.remove,
                  color: negativeBtnColor == AppColors.transparentColor
                      ? AppColors.primaryDarkColor
                      : AppColors.whiteColor,
                ),
              ),
            ),
            Text(
              counterTxt.value.toString(),
              style: TextStyle(
                fontSize: 16,
                color: textColor,
                fontFamily: FontFamily.openSansSemiBold,
              ),
            ),
            InkWell(
              onTap: () {
                counterTxt.value++;
              },
              child: Container(
                padding: const EdgeInsets.all(1),
                decoration: BoxDecoration(
                  color: positiveBtnColor,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Icon(
                  size: 18,
                  Icons.add,
                  color: positiveBtnColor == AppColors.transparentColor
                      ? AppColors.primaryDarkColor
                      : AppColors.whiteColor,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
