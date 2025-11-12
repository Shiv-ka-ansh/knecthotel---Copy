
import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/amenities/controller/swimming_pool_page_controller.dart';

class SwimmingPoolPageBindings extends Bindings {
@override
void dependencies() {
    Get.lazyPut(() => SwimmingPoolPageController());
}
}
