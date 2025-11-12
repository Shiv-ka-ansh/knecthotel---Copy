import 'package:fl_country_code_picker/fl_country_code_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/gen/fonts.gen.dart';

class PhoneNumberWidget extends StatelessWidget {
  final TextEditingController controller;
  final RxString dialCode;
  final String? hintText;
  final String labelText;
  final Color textColor;
  final Color? countryCodeColor;
  final Color fillColor;
  final double borderRadius;
  final bool showLabel;
  final bool showBorder;
  final bool isRequired;
  final bool isReadOnly;
  final bool showDivider;
  final Widget? suffix;

  const PhoneNumberWidget({
    super.key,
    required this.controller,
    required this.dialCode,
    this.hintText,
    this.labelText = Strings.strPhoneNumber,
    this.textColor = Colors.black,
    this.fillColor = AppColors.whiteColor,
    this.showBorder = true,
    this.showDivider = false,
    this.borderRadius = 12,
    this.showLabel = true,
    this.isRequired = false,
    this.isReadOnly = false,
    this.suffix,
    this.countryCodeColor,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        showLabel
            ? Text.rich(
                TextSpan(
                  children: [
                    TextSpan(
                      text: labelText,
                      style: const TextStyle(
                        fontFamily: FontFamily.openSansMedium,
                        color: AppColors.blackColor,
                        fontSize: 14,
                      ),
                    ),
                    isRequired
                        ? const TextSpan(
                            text: "*",
                            style: TextStyle(color: AppColors.errorColor),
                          )
                        : const TextSpan(),
                  ],
                ),
              )
            : const SizedBox(),
        showLabel ? const SizedBox(height: 10) : const SizedBox(),
        TextField(
          readOnly: isReadOnly,
          controller: controller,
          keyboardType: TextInputType.number,
          inputFormatters: [
            FilteringTextInputFormatter.digitsOnly,
            LengthLimitingTextInputFormatter(15),
          ],
          style: TextStyle(
            color: textColor,
            fontSize: 16,
            fontFamily: FontFamily.openSansMedium,
          ),
          decoration: InputDecoration(
              hintStyle: const TextStyle(color: AppColors.lightTextColor),
              prefixIcon: SizedBox(
                width: 100,
                child: GestureDetector(
                  onTap: () async {
                    final picked = await const FlCountryCodePicker()
                        .showPicker(context: context);
                    // Null check
                    if (picked != null) {
                      dialCode.value = picked.dialCode;
                    }
                  },
                  child: Obx(
                    () => Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        Text(
                          dialCode.value.startsWith("+")
                              ? dialCode.value
                              : "+${dialCode.value}",
                          style: TextStyle(
                            fontFamily: FontFamily.openSansMedium,
                            fontSize: 16,
                            color:
                                countryCodeColor ?? AppColors.primaryDarkColor,
                          ),
                        ),
                        Icon(
                          Icons.keyboard_arrow_down_outlined,
                          color: countryCodeColor ?? AppColors.primaryColor,
                        ),
                        showDivider
                            ? const SizedBox(
                                height: 30,
                                child: VerticalDivider(
                                  width: 1,
                                  thickness: 1.5,
                                  color: AppColors.blackColor,
                                ),
                              )
                            : const SizedBox(),
                      ],
                    ),
                  ),
                ),
              ),
              suffixIcon: suffix,
              hintText: hintText,
              border: InputBorder.none,
              contentPadding: const EdgeInsets.only(
                  left: 20, right: 15, top: 15, bottom: 15),
              enabledBorder: OutlineInputBorder(
                borderSide: showBorder
                    ? const BorderSide(color: AppColors.borderColor)
                    : BorderSide.none,
                borderRadius: BorderRadius.circular(borderRadius),
              ),
              focusedBorder: OutlineInputBorder(
                borderSide: isReadOnly
                    ? BorderSide.none
                    : const BorderSide(color: AppColors.primaryColor),
                borderRadius: BorderRadius.circular(borderRadius),
              ),
              filled: true,
              fillColor: WidgetStateColor.resolveWith((states) {
                if (!isReadOnly && states.contains(WidgetState.focused)) {
                  return AppColors.scaffoldBg; // Fill color when focused
                }
                return fillColor;
              })),
        ),
      ],
    );
  }
}
