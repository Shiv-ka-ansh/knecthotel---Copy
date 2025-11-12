
import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/services/controller/laundry_checkout_page_controller.dart';

class LaundryCheckoutPageBindings extends Bindings {
@override
void dependencies() {
    Get.lazyPut(() => LaundryCheckoutPageController());
}
}
