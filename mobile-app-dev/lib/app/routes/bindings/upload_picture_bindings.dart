import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/user_signup/controller/upload_picture_controller.dart';

class UploadPictureBindings extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut(() => UploadPictureController());
  }
}
