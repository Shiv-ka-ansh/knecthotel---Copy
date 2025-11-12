
import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/amenities/controller/payment_page_controller.dart';

class PaymentPageBindings extends Bindings {
@override
void dependencies() {
    Get.lazyPut(() => PaymentPageController());
}
}
