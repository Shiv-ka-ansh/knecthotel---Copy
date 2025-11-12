
import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/services/controller/confirm_booking_page_controller.dart';

class ConfirmBookingPageBindings extends Bindings {
@override
void dependencies() {
    Get.lazyPut(() => ConfirmBookingPageController());
}
}
