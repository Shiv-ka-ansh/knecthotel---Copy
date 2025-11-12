
import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/amenities/controller/room_control_form_controller.dart';

class RoomControlFormBindings extends Bindings {
@override
void dependencies() {
    Get.lazyPut(() => RoomControlFormController());
}
}
