
import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/bookings/controller/booking_service_status_controller.dart';

class BookingServiceStatusBindings extends Bindings {
@override
void dependencies() {
    Get.lazyPut(() => BookingServiceStatusController());
}
}
