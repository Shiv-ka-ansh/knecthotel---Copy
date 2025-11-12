import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/hotel_signup/controller/hotel_info_signup_page_controller.dart';

class HotelInfoSignupPageBindings extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut(() => HotelInfoSignupPageController());
  }
}
