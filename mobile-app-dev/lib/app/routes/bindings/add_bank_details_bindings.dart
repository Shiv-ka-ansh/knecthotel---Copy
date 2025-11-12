import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/user_signup/controller/add_bank_details_controller.dart';

class AddBankDetailsBindings extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut(() => AddBankDetailsController());
  }
}
