
import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/amenities/controller/sos_request_form_controller.dart';

class SosRequestFormBindings extends Bindings {
@override
void dependencies() {
    Get.lazyPut(() => SosRequestFormController());
}
}
