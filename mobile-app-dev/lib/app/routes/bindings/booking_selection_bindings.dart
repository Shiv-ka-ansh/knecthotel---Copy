import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/bookings/controller/booking_selection_controller.dart';

class BookingSelectionBindings extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<BookingSelectionController>(() => BookingSelectionController());
  }
}
