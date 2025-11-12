import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/auth/controller/registration_controller.dart';

class RegistrationBindings extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<RegistrationController>(() => RegistrationController());
  }
}
