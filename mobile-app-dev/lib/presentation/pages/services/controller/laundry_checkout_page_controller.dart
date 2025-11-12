import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/gen/assets.gen.dart';

class LaundryCheckoutPageController extends GetxController
    with GetSingleTickerProviderStateMixin {
  static const int noOfTabs = 4;
  late TabController tabController;
  final selectedIndex = 0.obs;
  late final List<RxInt> selectedQuantities;

  final menClothes = <Map<String, dynamic>>[
    {
      'name': 'T-Shirts',
      'image': Assets.images.clothItem0.path,
      'price': 10.0,
      'service': 'Wash only',
      'quantity': 2,
    },
    {
      'name': 'Shirts',
      'image': Assets.images.clothItem1.path,
      'price': 10.0,
      'service': 'Wash only',
      'quantity': 0,
    },
    {
      'name': 'Jeans',
      'image': Assets.images.clothItem2.path,
      'price': 10.0,
      'service': 'Wash only',
      'quantity': 0,
    },
    {
      'name': 'Jacket',
      'image': Assets.images.clothItem3.path,
      'price': 10.0,
      'service': 'Wash only',
      'quantity': 0,
    },
    {
      'name': 'Shorts',
      'image': Assets.images.clothItem4.path,
      'price': 10.0,
      'service': 'Wash only',
      'quantity': 0,
    },
    {
      'name': 'Wollens',
      'image': Assets.images.clothItem5.path,
      'price': 10.0,
      'service': 'Wash only',
      'quantity': 0,
    },
  ].obs;

  final services = ['Wash only', 'Wash & Iron', 'Dry Clean'];

  @override
  void onInit() {
    tabController = TabController(length: noOfTabs, vsync: this);
    tabController.addListener(() {
      selectedIndex.value = tabController.index;
    });
    selectedQuantities = List<RxInt>.generate(menClothes.length, (_) => 0.obs);
    super.onInit();
  }
}
