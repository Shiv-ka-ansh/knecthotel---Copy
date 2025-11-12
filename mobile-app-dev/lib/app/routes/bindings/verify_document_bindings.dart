import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/user_signup/controller/verify_document_controller.dart';

class VerifyDocumentBindings extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<VerifyDocumentController>(() => VerifyDocumentController());
  }
}
