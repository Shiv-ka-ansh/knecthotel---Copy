import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/gen/assets.gen.dart';

class GymPageController extends GetxController
    with GetSingleTickerProviderStateMixin {
  static const int noOfTabs = 2;
  late TabController tabController;
  final dateController = TextEditingController();
  final timeController = TextEditingController();
  final selectedIndex = 0.obs;

  final gymEssentials = [
    Assets.images.gymEssentials0.image(),
    Assets.images.gymEssentials1.image(),
    Assets.images.gymEssentials2.image(),
    Assets.images.gymEssentials3.image(),
    Assets.images.gymEssentials4.image(),
    Assets.images.gymEssentials5.image(),
    Assets.images.gymEssentials6.image(),
    Assets.images.gymEssentials7.image(),
    Assets.images.gymEssentials8.image(),
    Assets.images.gymEssentials9.image(),
    Assets.images.gymEssentials10.image(),
    Assets.images.gymEssentials11.image(),
  ];

  final gymSlots = [
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
    super.onClose();
  }
}
