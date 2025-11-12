
import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/services/controller/laundary_order_summary_controller.dart';

class LaundaryOrderSummaryBindings extends Bindings {
@override
void dependencies() {
    Get.lazyPut(() => LaundaryOrderSummaryController());
}
}
