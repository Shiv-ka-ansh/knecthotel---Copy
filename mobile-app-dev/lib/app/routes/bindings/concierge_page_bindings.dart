
import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/amenities/controller/concierge_page_controller.dart';

class ConciergePageBindings extends Bindings {
@override
void dependencies() {
    Get.lazyPut(() => ConciergePageController());
}
}
