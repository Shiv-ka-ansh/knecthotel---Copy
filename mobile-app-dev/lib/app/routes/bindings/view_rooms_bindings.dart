import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/bookings/controller/view_rooms_controller.dart';

class ViewRoomsBindings extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut(() => ViewRoomsController());
  }
}
