import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/bookings/controller/booking_service_request_controller.dart';

class BookingServiceRequestBindings extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut(() => BookingServiceRequestController());
  }
}
