import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/strings.dart';

class RequestStatusController extends GetxController {
  final RxMap<String, dynamic> data = <String, dynamic>{}.obs;
  final RxString requestTxt = ''.obs;
  final TextEditingController descriptionController = TextEditingController();
  final TextEditingController feedbackController = TextEditingController();
  final ExpansionTileController progressStatusController =
      ExpansionTileController();
  final RxString selectedProgress = Strings.lstProgressStatus[0].obs;
  final RxInt selectedRating = 0.obs;

  final List<Map<String, String>> pastRequests = [
    {
      "id": "RD012345",
      "type": "Complaint",
      "room": "502",
      "date": "10 Jan 2025",
      "time": "11:00 AM",
      "status": "Completed"
    },
    {
      "id": "RD012346",
      "type": "Maintenance",
      "room": "305",
      "date": "15 Feb 2025",
      "time": "02:30 PM",
      "status": "Cancelled"
    },
  ];

  @override
  void onInit() {
    super.onInit();
    data.value = Get.arguments ?? {};
    requestTxt.value = data['requestType']?.toString() ?? '';
    descriptionController.text = data['description']?.toString() ?? '';
  }

  @override
  void onClose() {
    descriptionController.dispose();
    feedbackController.dispose();
    super.onClose();
  }
}
