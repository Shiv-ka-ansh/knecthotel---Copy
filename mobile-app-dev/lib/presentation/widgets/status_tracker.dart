import 'package:flutter/material.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/gen/fonts.gen.dart';

class StatusTracker extends StatelessWidget {
  final List<String> steps;
  final int currentStep;

  const StatusTracker({
    super.key,
    required this.steps,
    required this.currentStep,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: steps.asMap().entries.map((entry) {
        final index = entry.key;
        final label = entry.value;
        final isDone = index <= currentStep;

        return Expanded(
          child: Column(
            children: [
              Row(
                children: [
                  if (index != 0)
                    Expanded(
                      child: Container(
                        height: 2,
                        color: isDone
                            ? AppColors.primaryDarkColor
                            : Colors.grey.shade300,
                      ),
                    ),
                  Container(
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(
                      color: isDone ? AppColors.primaryDarkColor : Colors.grey,
                      shape: BoxShape.circle,
                    ),
                    child: isDone
                        ? const Icon(
                            Icons.check,
                            color: Colors.white,
                            size: 10,
                          )
                        : null,
                  ),
                  if (index != steps.length - 1)
                    Expanded(
                      child: Container(
                        height: 2,
                        color: index < currentStep
                            ? AppColors.primaryDarkColor
                            : Colors.grey.shade300,
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  fontFamily: FontFamily.openSansRegular,
                  fontSize: 12,
                  color: isDone ? AppColors.blackColor : Colors.black54,
                ),
              )
            ],
          ),
        );
      }).toList(),
    );
  }
}
