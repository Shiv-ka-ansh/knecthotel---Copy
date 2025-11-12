import 'package:flutter/material.dart';
import 'package:knecthotel/app/config/app_colors.dart';

class AnimatedCheckWidget extends StatefulWidget {
  final double radius;
  final double maxShadowRadius;
  final Color backgroundColor;
  final Color iconColor;
  final Color shadowColor;

  const AnimatedCheckWidget({
    super.key,
    this.radius = 60.0,
    this.maxShadowRadius = 25.0,
    this.backgroundColor = AppColors.primaryDarkColor,
    this.iconColor = Colors.white,
    this.shadowColor = Colors.black26,
  });

  @override
  AnimatedCheckWidgetState createState() => AnimatedCheckWidgetState();
}

class AnimatedCheckWidgetState extends State<AnimatedCheckWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController controller;
  late Animation<double> scaleAnimation;
  late Animation<double> shadowSizeAnimation;
  bool isChecked = false;

  @override
  void initState() {
    super.initState();
    controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );

    scaleAnimation = CurvedAnimation(
      parent: controller,
      curve: Curves.easeOutBack,
    );

    shadowSizeAnimation = Tween<double>(
      begin: 0,
      end: widget.maxShadowRadius,
    ).animate(CurvedAnimation(parent: controller, curve: Curves.easeOut));
  }

  /// Trigger animation externally
  void animateCheck() {
    setState(() {
      isChecked = !isChecked;
      if (isChecked) {
        controller.forward();
      } else {
        controller.reverse();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (context, child) {
        return Container(
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: widget.shadowColor,
                blurRadius: 0,
                spreadRadius: shadowSizeAnimation.value,
                offset: const Offset(0, 0),
              ),
            ],
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                width: widget.radius,
                height: widget.radius,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: widget.backgroundColor,
                ),
              ),
              ScaleTransition(
                scale: scaleAnimation,
                child: Icon(
                  Icons.check,
                  color: widget.iconColor,
                  size: widget.radius * 0.6,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }
}
