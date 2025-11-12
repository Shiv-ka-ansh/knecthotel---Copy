import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/amenities/controller/wifi_page_controller.dart';

class WifiPageBindings extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut(() => WifiPageController());
  }
}
