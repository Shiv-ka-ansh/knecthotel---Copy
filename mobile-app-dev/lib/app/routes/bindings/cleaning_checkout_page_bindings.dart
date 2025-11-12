
import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/services/controller/cleaning_checkout_page_controller.dart';

class CleaningCheckoutPageBindings extends Bindings {
@override
void dependencies() {
    Get.lazyPut(() => CleaningCheckoutPageController());
}
}
