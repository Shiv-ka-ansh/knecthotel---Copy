
import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/amenities/controller/book_slot_controller.dart';

class BookSlotBindings extends Bindings {
@override
void dependencies() {
    Get.lazyPut(() => BookSlotController());
}
}
