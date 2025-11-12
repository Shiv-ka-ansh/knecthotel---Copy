import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/amenities/controller/request_status_controller.dart';

class RequestStatusFormBindings extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut(() => RequestStatusController());
  }
}
