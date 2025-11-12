
import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/amenities/controller/concierge_service_form_controller.dart';

class ConciergeServiceFormBindings extends Bindings {
@override
void dependencies() {
    Get.lazyPut(() => ConciergeServiceFormController());
}
}
