
import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/amenities/controller/gym_page_controller.dart';

class GymPageBindings extends Bindings {
@override
void dependencies() {
    Get.lazyPut(() => GymPageController());
}
}
