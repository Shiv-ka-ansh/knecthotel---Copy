import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/home/controller/amenities_page_controller.dart';

class AmenitiesBindings extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut(() => AmenitiesPageController());
  }
}
