import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/common/controller/confirm_order_controller.dart';

class ConfirmOrderBindings extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut(() => ConfirmOrderController());
  }
}
