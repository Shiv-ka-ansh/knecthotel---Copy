
import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/services/controller/toiletries_checkout_page_controller.dart';

class ToiletriesCheckoutPageBindings extends Bindings {
@override
void dependencies() {
    Get.lazyPut(() => ToiletriesCheckoutPageController());
}
}
