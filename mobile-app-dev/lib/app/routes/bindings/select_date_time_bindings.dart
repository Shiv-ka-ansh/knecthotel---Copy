
import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/services/controller/select_date_time_controller.dart';

class SelectDateTimeBindings extends Bindings {
@override
void dependencies() {
    Get.lazyPut(() => SelectDateTimeController());
}
}
