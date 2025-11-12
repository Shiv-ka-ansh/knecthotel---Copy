import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../app/config/app_colors.dart';
import '../../gen/fonts.gen.dart';

class CommonTextfield extends StatelessWidget {
  const CommonTextfield({
    super.key,
    this.title,
    required this.controller,
    this.keyboardType,
    this.hintText,
    this.suffix,
    this.onTap,
    this.prefix,
    this.onChanged,
    this.contentPadding,
    this.bgColor,
    this.textColor,
    this.textSize = 14,
    this.maxLines = 1,
    this.isReadOnly = false,
  });

  final String? title;
  final TextEditingController controller;
  final Color? bgColor;
  final Color? textColor;
  final double? textSize;
  final String? hintText;
  final Widget? suffix;
  final Widget? prefix;
  final VoidCallback? onTap;
  final int? maxLines;
  final bool isReadOnly;
  final EdgeInsetsGeometry? contentPadding;
  final TextInputType? keyboardType;
  final Function(String newValue)? onChanged;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (title != null)
          Text.rich(TextSpan(children: [
            TextSpan(
                text: title,
                style: TextStyle(
                  fontFamily: FontFamily.openSansSemiBold,
                  fontSize: textSize,
                  color: textColor ?? AppColors.blackColor,
                )),
          ])).paddingOnly(bottom: 10),
        SizedBox(
          height: maxLines != null ? null : 60,
          child: TextField(
            maxLines: maxLines,
            onChanged: onChanged,
            controller: controller,
            keyboardType: keyboardType,
            onTap: onTap,
            readOnly: isReadOnly,
            style: TextStyle(
                color: textColor ?? Colors.black,
                fontSize: 16,
                fontFamily: FontFamily.openSansMedium),
            decoration: InputDecoration(
              hintText: hintText,
              hintStyle: TextStyle(
                  color: textColor ?? AppColors.lightTextColor,
                  fontSize: 16,
                  fontFamily: FontFamily.openSansRegular),
              suffixIcon: suffix,
              prefixIcon: prefix,
              contentPadding: contentPadding,
              border: OutlineInputBorder(
                  borderSide: BorderSide.none,
                  borderRadius: BorderRadius.circular(12)),
              errorBorder: OutlineInputBorder(
                  borderSide: BorderSide.none,
                  borderRadius: BorderRadius.circular(12)),
              enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide.none,
                  borderRadius: BorderRadius.circular(12)),
              focusedBorder: OutlineInputBorder(
                  borderSide: isReadOnly
                      ? BorderSide.none
                      : const BorderSide(color: AppColors.primaryColor),
                  borderRadius: BorderRadius.circular(12)),
              disabledBorder: OutlineInputBorder(
                  borderSide: BorderSide.none,
                  borderRadius: BorderRadius.circular(12)),
              focusedErrorBorder: OutlineInputBorder(
                  borderSide: BorderSide.none,
                  borderRadius: BorderRadius.circular(12)),
              filled: true,
              fillColor: WidgetStateColor.resolveWith((states) {
                if (!isReadOnly && states.contains(WidgetState.focused)) {
                  return AppColors.scaffoldBg; // Fill color when focused
                }
                return bgColor ?? AppColors.textFieldBg;
              }),
            ),
          ),
        )
      ],
    );
  }
}
