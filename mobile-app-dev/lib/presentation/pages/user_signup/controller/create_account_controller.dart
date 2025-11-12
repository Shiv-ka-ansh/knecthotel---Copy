import 'package:flutter/widgets.dart';
import 'package:get/get.dart';

class CreateAccountController extends GetxController {
  final TextEditingController firstNameController = TextEditingController();
  final TextEditingController lastNameController = TextEditingController();
  final TextEditingController dobController = TextEditingController();
  final TextEditingController anniversaryController = TextEditingController();
  final RxBool termsAccepted = false.obs;
  final RxString countryCode = "+91".obs;

  @override
  void onClose() {
    firstNameController.dispose();
    lastNameController.dispose();
    dobController.dispose();
    anniversaryController.dispose();
    super.onClose();
  }
}
