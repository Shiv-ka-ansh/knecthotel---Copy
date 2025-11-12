
import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/services/controller/food_services_controller.dart';

class FoodServicesBindings extends Bindings {
@override
void dependencies() {
    Get.lazyPut(() => FoodServicesController());
}
}
