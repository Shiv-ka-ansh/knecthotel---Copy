import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/amenities/controller/reception_request_controller.dart';

class ReceptionRequestBindings extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut(() => ReceptionRequestController());
  }
}
