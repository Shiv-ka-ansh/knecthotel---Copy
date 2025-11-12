
import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/services/controller/toiletries_order_summary_controller.dart';

class ToiletriesOrderSummaryBindings extends Bindings {
@override
void dependencies() {
    Get.lazyPut(() => ToiletriesOrderSummaryController());
}
}
