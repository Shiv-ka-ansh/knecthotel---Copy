import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';

class BookSlotController extends GetxController {
  final TextEditingController messageController = TextEditingController();
  final RxMap<String, dynamic> data = <String, dynamic>{}.obs;

  @override
  void onInit() {
    data.value = Get.arguments ?? {};
    super.onInit();
  }

  @override
  void onClose() {
    messageController.dispose();
    super.onClose();
  }
}
