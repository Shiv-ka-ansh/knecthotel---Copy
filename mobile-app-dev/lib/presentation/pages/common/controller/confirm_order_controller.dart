import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/presentation/widgets/animated_check_widget.dart';

class ConfirmOrderController extends GetxController {
  final GlobalKey<AnimatedCheckWidgetState> checkWidgetKey = GlobalKey();
  final RxMap<String, dynamic> data = <String, dynamic>{}.obs;

  final List<Map<String, dynamic>> foodItems = [
    {
      "name": "Veg Sandwich",
      "eligibility": "NOT ELIGIBLE FOR COUPON",
      "price": 110,
      "qty": 1,
      "isVeg": true,
    },
    {
      "name": "Non Veg Cheese Sandwich",
      "eligibility": "NOT ELIGIBLE FOR COUPON",
      "price": 120,
      "qty": 1,
      "isVeg": false,
    },
  ];
  final List<Map<String, dynamic>> wholeRoomCleaning = [
    {
      "name": "Whole Room Cleaning",
      "eligibility": "NOT ELIGIBLE FOR COUPON",
      "price": 110,
      "qty": 1,
    },
  ];
  final List<Map<String, dynamic>> taxiItem = [
    {
      "name": "TAxi/Cab Service",
      "eligibility": "NOT ELIGIBLE FOR COUPON",
      "price": 110,
      "qty": 1,
    },
  ];
  final List<Map<String, dynamic>> conferenceItem = [
    {
      "name": "Conference Hall",
      "eligibility": "NOT ELIGIBLE FOR COUPON",
      "price": 110,
      "qty": 1,
    },
  ];
  final List<Map<String, dynamic>> communityItem = [
    {
      "name": "Community Hall",
      "eligibility": "NOT ELIGIBLE FOR COUPON",
      "price": 110,
      "qty": 1,
    },
  ];
  final List<Map<String, dynamic>> roomCotrolsItem = [
    {
      "name": "Fix wi-fi",
      "eligibility": "NOT ELIGIBLE FOR COUPON",
      "price": 110,
      "qty": 1,
    },
  ];
  final List<Map<String, dynamic>> conciergeItem = [
    {
      "name": "Bar & Lounge",
      "eligibility": "NOT ELIGIBLE FOR COUPON",
      "price": 110,
      "qty": 1,
    },
  ];
  final List<Map<String, dynamic>> laundaryItems = [
    {
      "name": "T-Shirt",
      "eligibility": "NOT ELIGIBLE FOR COUPON",
      "price": 10,
      "qty": 1,
    },
    {
      "name": "Shirt",
      "eligibility": "NOT ELIGIBLE FOR COUPON",
      "price": 10,
      "qty": 1,
    },
  ];
  final List<Map<String, dynamic>> toileteryItems = [
    {
      "name": "Shampoo",
      "eligibility": "NOT ELIGIBLE FOR COUPON",
      "price": 10,
      "qty": 1,
    },
    {
      "name": "Conditioner",
      "eligibility": "NOT ELIGIBLE FOR COUPON",
      "price": 10,
      "qty": 1,
    },
  ];

  @override
  void onInit() {
    super.onInit();

    // Retrieve full data from Get.arguments
    if (Get.arguments != null && Get.arguments is Map<String, dynamic>) {
      data.assignAll(Get.arguments);
    }

    // Delay to ensure widget is built before animation
    Future.delayed(const Duration(milliseconds: 300), () {
      checkWidgetKey.currentState?.animateCheck();
    });
  }
}
