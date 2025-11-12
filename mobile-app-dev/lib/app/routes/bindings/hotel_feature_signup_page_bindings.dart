
import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/hotel_signup/controller/hotel_feature_signup_page_controller.dart';

class HotelFeatureSignupPageBindings extends Bindings {
@override
void dependencies() {
    Get.lazyPut(() => HotelFeatureSignupPageController());
}
}
