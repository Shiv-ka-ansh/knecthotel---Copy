import 'package:flutter/material.dart';
import 'package:get/get.dart';

class SwimmingPoolPageController extends GetxController
    with GetSingleTickerProviderStateMixin {
  static const int noOfTabs = 3;
  late TabController tabController;
  final dateController = TextEditingController();
  final timeController = TextEditingController();
  final idController = TextEditingController();
  final selectedIndex = 0.obs;

  final availableSlots = [
    {"time": "8:00am-8:30am", "isAvailable": true},
    {"time": "8:30am-9:00pm", "isAvailable": false},
    {"time": "9:30pm-10:00pm", "isAvailable": true, "isLimited": true},
    {"time": "10:30pm-11:00pm", "isAvailable": true}
  ];

  @override
  void onInit() {
    super.onInit();
    tabController = TabController(length: noOfTabs, vsync: this);
    // Listen to tab changes and update selectedIndex
    tabController.addListener(() {
      selectedIndex.value = tabController.index;
    });
  }

  @override
  void onClose() {
    dateController.dispose();
    timeController.dispose();
    idController.dispose();
    super.onClose();
  }
}
