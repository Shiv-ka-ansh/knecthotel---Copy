
import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/services/controller/food_check_out_controller.dart';

class FoodCheckOutBindings extends Bindings {
@override
void dependencies() {
    Get.lazyPut(() => FoodCheckOutController());
}
}
