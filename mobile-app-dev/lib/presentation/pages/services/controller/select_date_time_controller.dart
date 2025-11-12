import 'package:flutter/material.dart';
import 'package:get/get.dart';

class SelectDateTimeController extends GetxController {
  final RxMap<String, dynamic> data = <String, dynamic>{}.obs;
  final startDateController = TextEditingController();
  final startTimeController = TextEditingController();
  final endDateController = TextEditingController();
  final endTimeController = TextEditingController();
  final eventController = TextEditingController();

  @override
  void onInit() {
    // Retrieve full data from Get.arguments
    if (Get.arguments != null && Get.arguments is Map<String, dynamic>) {
      data.assignAll(Get.arguments);
    }

    super.onInit();
  }

  @override
  void onClose() {
    startDateController.dispose();
    startTimeController.dispose();
    endDateController.dispose();
    endTimeController.dispose();
    eventController.dispose();
    super.onClose();
  }
}
