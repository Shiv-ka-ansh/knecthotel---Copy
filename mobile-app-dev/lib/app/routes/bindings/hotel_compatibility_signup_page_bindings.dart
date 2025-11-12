
import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/hotel_signup/controller/hotel_compatibility_signup_page_controller.dart';

class HotelCompatibilitySignupPageBindings extends Bindings {
@override
void dependencies() {
    Get.lazyPut(() => HotelCompatibilitySignupPageController());
}
}
