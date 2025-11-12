import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';

class ReceptionRequestController extends GetxController {
  final TextEditingController descriptionController = TextEditingController();
  RxString selectedRequestType = ''.obs;

  @override
  void onClose() {
    descriptionController.dispose();
    super.onClose();
  }
}
