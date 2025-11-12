import 'dart:io';

import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:knecthotel/app/services/logger.dart';

class VerifyDocumentController extends GetxController {
  Rx<File?> selectedImage = Rx<File?>(null);

  Future pickImageFromGallery() async {
    final returnedImage =
        await ImagePicker().pickImage(source: ImageSource.gallery);
    if (returnedImage == null) {
      Logger.prints('Unable to open gallery');
      return;
    }
    selectedImage.value = File(returnedImage.path);
  }

  Future pickImageFromCamera() async {
    final returnedImage =
        await ImagePicker().pickImage(source: ImageSource.camera);
    if (returnedImage == null) {
      Logger.prints('Unable to open camera');
      return;
    }
    selectedImage.value = File(returnedImage.path);
  }
}
