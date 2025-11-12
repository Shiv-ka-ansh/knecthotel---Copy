import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/services/controller/extended_service_page_controller.dart';

class ExtendedServicePageBindings extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut(() => ExtendedServicePageController());
  }
}
