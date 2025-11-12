import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_credit_card/flutter_credit_card.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:knecthotel/app/services/logger.dart';

class AccountPageController extends GetxController {
  final TextEditingController firstNameController = TextEditingController();
  final TextEditingController lastNameController = TextEditingController();
  final TextEditingController phoneNumberController = TextEditingController();
  final TextEditingController dobController = TextEditingController();
  final TextEditingController anniversaryController = TextEditingController();
  final TextEditingController messageController = TextEditingController();
  final TextEditingController pinController = TextEditingController();

  final int pinLength = 4;
  final RxString countryCode = "+91".obs;

  final cardNumber = ''.obs;
  final expiryDate = ''.obs;
  final cardHolderName = ''.obs;
  final cvvCode = ''.obs;
  final isCvvFocused = false.obs;

  final formKey = GlobalKey<FormState>();
  Rx<File?> selectedProfileImage = Rx<File?>(null);
  Rx<File?> selectedScannedImage = Rx<File?>(null);

  Future pickImageFromGallery() async {
    final returnedImage =
        await ImagePicker().pickImage(source: ImageSource.gallery);
    if (returnedImage == null) {
      Logger.prints('Unable to open gallery');
      return;
    }
    selectedProfileImage.value = File(returnedImage.path);
  }

  Future pickImageFromCamera() async {
    final returnedImage =
        await ImagePicker().pickImage(source: ImageSource.camera);
    if (returnedImage == null) {
      Logger.prints('Unable to open camera');
      return;
    }
    selectedScannedImage.value = File(returnedImage.path);
  }

  void onCreditCardModelChange(CreditCardModel creditCardModel) {
    cardNumber.value = creditCardModel.cardNumber;
    expiryDate.value = creditCardModel.expiryDate;
    cardHolderName.value = creditCardModel.cardHolderName;
    cvvCode.value = creditCardModel.cvvCode;
    isCvvFocused.value = creditCardModel.isCvvFocused;
  }

  @override
  void onClose() {
    firstNameController.dispose();
    lastNameController.dispose();
    phoneNumberController.dispose();
    dobController.dispose();
    anniversaryController.dispose();
    super.onClose();
  }
}
