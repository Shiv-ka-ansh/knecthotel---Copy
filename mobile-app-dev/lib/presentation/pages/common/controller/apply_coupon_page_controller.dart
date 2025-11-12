import 'package:confetti/confetti.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'package:knecthotel/data/model/coupon.dart';

class ApplyCouponPageController extends GetxController {
  final couponCodeController = TextEditingController();
  final couponAppliedStatus = (-1).obs;
  final ConfettiController leftConfettiController =
      ConfettiController(duration: const Duration(milliseconds: 500));
  final ConfettiController rightConfettiController =
      ConfettiController(duration: const Duration(milliseconds: 500));

  List<Coupon> coupons = [
    Coupon(
      code: 'HAPPYBIRTHDAY25',
      description:
          'Get extra 25% off on this bday sale on minimum spend of 3000',
      expiry: 'Expiring early on 12-5-2025',
      terms: 'T&C will display here in bluttet points',
      color: Colors.redAccent.shade100,
    ),
    Coupon(
      code: 'FIRSTUSER500',
      description: 'Get INR500 off on your first payment',
      expiry: '',
      terms: 'T&C will display here in bluttet points',
      color: Colors.orangeAccent.shade100,
    ),
    Coupon(
      code: 'NAMASTE10',
      description: 'Get 10% off on your first housekeeping',
      expiry: '',
      terms: 'T&C will display here in bluttet points',
      color: Colors.lightBlue.shade100,
    ),
    Coupon(
      code: 'NAMASTE50',
      description: 'Get 50% off on your booking on services',
      expiry: '',
      terms: 'T&C will display here in bluttet points',
      color: Colors.green.shade100,
    ),
  ];

  void playConfetti() {
    leftConfettiController.stop();
    rightConfettiController.stop();

    leftConfettiController.play();
    rightConfettiController.play();
  }

  @override
  void onClose() {
    couponCodeController.dispose();
    leftConfettiController.dispose();
    rightConfettiController.dispose();
    super.onClose();
  }
}
