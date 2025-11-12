
import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/onboarding/controller/select_signup_page_controller.dart';

class SelectSignupPageBindings extends Bindings {
@override
void dependencies() {
    Get.lazyPut(() => SelectSignupPageController());
}
}
