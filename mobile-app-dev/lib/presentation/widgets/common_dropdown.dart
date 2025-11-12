import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:dropdown_search/dropdown_search.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/gen/fonts.gen.dart';

class CommonDropdown extends StatelessWidget {
  final String title;
  final List<String> items;
  final String hint;
  final RxString selectedOption;
  final double textSize;
  final bool isTextBold;
  final double borderRadius;
  final EdgeInsets padding;

  const CommonDropdown({
    super.key,
    required this.title,
    required this.items,
    required this.hint,
    this.textSize = 14,
    required this.selectedOption,
    this.isTextBold = true,
    this.borderRadius = 8,
    this.padding = const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Title label
        Text(
          title,
          style: TextStyle(
            fontSize: textSize,
            fontFamily: isTextBold
                ? FontFamily.openSansSemiBold
                : FontFamily.openSansRegular,
            color: AppColors.blackColor,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: padding,
          decoration: BoxDecoration(
            color: AppColors.textFieldBg,
            borderRadius: BorderRadius.circular(borderRadius),
          ),
          child: Obx(() {
            return DropdownSearch<String>(
              items: items,
              selectedItem:
                  selectedOption.value.isEmpty ? null : selectedOption.value,
              dropdownDecoratorProps: DropDownDecoratorProps(
                dropdownSearchDecoration: InputDecoration(
                  hintText: hint,
                  hintStyle: const TextStyle(
                    fontFamily: FontFamily.openSansRegular,
                    color: AppColors.blackColor,
                    fontSize: 16,
                  ),
                  border: InputBorder.none,
                  isDense: true,
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                ),
              ),
              popupProps: PopupProps.menu(
                showSearchBox: false,
                menuProps: const MenuProps(
                  backgroundColor: AppColors.primaryDarkColor,
                ),
                itemBuilder: (context, item, isSelected) {
                  return ListTile(
                    title: Text(
                      item,
                      style: const TextStyle(
                        color: AppColors.whiteColor,
                        fontFamily: FontFamily.openSansRegular,
                        fontSize: 16,
                      ),
                    ),
                  );
                },
              ),
              onChanged: (value) {
                if (value != null) {
                  selectedOption.value = value;
                }
              },
              dropdownButtonProps: const DropdownButtonProps(
                icon: Icon(Icons.arrow_drop_down),
              ),
            );
          }),
        ),
      ],
    );
  }
}
