
import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/user_signup/controller/select_document_page_controller.dart';

class SelectDocumentPageBindings extends Bindings {
@override
void dependencies() {
    Get.lazyPut(() => SelectDocumentPageController());
}
}
