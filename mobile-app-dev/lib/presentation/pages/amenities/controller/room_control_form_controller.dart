import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/strings.dart';

class RoomControlFormController extends GetxController {
  final roomController = TextEditingController();
  final descriptionController = TextEditingController();
  final timeController = TextEditingController();
  final dateController = TextEditingController();

  final RxString selectedIssueType = Strings.lstRoomIssueType[0].obs;

  @override
  void onInit() {
    roomController.text = '203';
    super.onInit();
  }

  @override
  void onClose() {
    roomController.dispose();
    descriptionController.dispose();
    timeController.dispose();
    dateController.dispose();
    super.onClose();
  }
}
