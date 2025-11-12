import 'package:flutter/material.dart';
import 'package:get/get.dart';

class ConciergeServiceFormController extends GetxController {
  RxBool touristAttractionSelected = false.obs;
  RxBool entertainmentSelected = false.obs;
  RxBool nearbyRestaurantsSelected = false.obs;

  final visitingPlaceController = TextEditingController();
  final RxMap<String, dynamic> data = <String, dynamic>{}.obs;

  @override
  void onInit() {
    super.onInit();

    // Retrieve full data from Get.arguments
    if (Get.arguments != null && Get.arguments is Map<String, dynamic>) {
      data.assignAll(Get.arguments);
      visitingPlaceController.text = data['visitingPlace'] ?? '';
    }
  }

  @override
  void onClose() {
    visitingPlaceController.dispose();
    super.onClose();
  }
}
