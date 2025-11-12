import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/user_signup/controller/create_account_controller.dart';

class CreateAccountBindings extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut(() => CreateAccountController());
  }
}
