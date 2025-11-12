import 'package:flutter/widgets.dart';
import 'package:get/get.dart';

class WifiPageController extends GetxController {
  final TextEditingController wifiController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();

  @override
  void onInit() {
    wifiController.text = "KnectHotel";
    passwordController.text = "KnectHotel123";
    super.onInit();
  }

  @override
  void onClose() {
    wifiController.dispose();
    passwordController.dispose();
    super.onClose();
  }
}
