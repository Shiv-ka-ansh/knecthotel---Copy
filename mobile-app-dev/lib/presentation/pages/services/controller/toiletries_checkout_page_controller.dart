import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/gen/assets.gen.dart';

class ToiletriesCheckoutPageController extends GetxController
    with GetSingleTickerProviderStateMixin {
  static const int noOfTabs = 2;
  late TabController tabController;
  final selectedIndex = 0.obs;
  late final List<RxInt> selectedQuantities;

  final bathingEssentials = <Map<String, dynamic>>[
    {
      'name': 'Shampoo',
      'image': Assets.images.toiletries0.path,
      'price': 10.0,
      'service': 'Wash only',
      'quantity': 2,
    },
    {
      'name': 'Conditioner',
      'image': Assets.images.toiletries1.path,
      'price': 10.0,
      'service': 'Wash only',
      'quantity': 0,
    },
    {
      'name': 'Body Wash',
      'image': Assets.images.toiletries2.path,
      'price': 10.0,
      'service': 'Wash only',
      'quantity': 0,
    },
    {
      'name': 'Face Wash',
      'image': Assets.images.toiletries3.path,
      'price': 10.0,
      'service': 'Wash only',
      'quantity': 0,
    },
    {
      'name': 'Toothpaste',
      'image': Assets.images.toiletries4.path,
      'price': 10.0,
      'service': 'Wash only',
      'quantity': 0,
    },
    {
      'name': 'Deodorant',
      'image': Assets.images.toiletries5.path,
      'price': 10.0,
      'service': 'Wash only',
      'quantity': 0,
    },
  ].obs;

  @override
  void onInit() {
    tabController = TabController(length: noOfTabs, vsync: this);
    tabController.addListener(() {
      selectedIndex.value = tabController.index;
    });
    selectedQuantities =
        List<RxInt>.generate(bathingEssentials.length, (_) => 0.obs);
    super.onInit();
  }
}
