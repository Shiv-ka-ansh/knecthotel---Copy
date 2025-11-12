import 'dart:io';

import 'package:flutter/widgets.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';

import 'package:knecthotel/app/services/logger.dart';

class HotelCompatibilitySignupPageController extends GetxController {
  final gstController = TextEditingController();
  final RxBool dataPrivacyCheckbox = false.obs;
  final RxBool internetConnectivitySwitch = false.obs;
  final RxBool softwareCompatibilitySwitch = false.obs;

  Rx<File?> hotelLicenseImage = Rx<File?>(null);
  Rx<File?> businessLicenseImage = Rx<File?>(null);
  Rx<File?> touristLicenseImage = Rx<File?>(null);
  Rx<File?> tinNumberImage = Rx<File?>(null);
  Rx<File?> gstinNumberImage = Rx<File?>(null);

  Future pickImageFromGallery(Rx<File?> selectedImage) async {
    final returnedImage =
        await ImagePicker().pickImage(source: ImageSource.gallery);
    if (returnedImage == null) {
      Logger.prints('Unable to open gallery');
      return;
    }
    selectedImage.value = File(returnedImage.path);
  }
}
