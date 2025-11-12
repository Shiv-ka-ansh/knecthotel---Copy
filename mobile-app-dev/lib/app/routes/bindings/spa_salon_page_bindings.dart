
import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/amenities/controller/spa_salon_page_controller.dart';

class SpaSalonPageBindings extends Bindings {
@override
void dependencies() {
    Get.lazyPut(() => SpaSalonPageController());
}
}
