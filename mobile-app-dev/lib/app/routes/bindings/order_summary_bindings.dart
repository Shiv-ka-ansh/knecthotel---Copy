
import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/services/controller/order_summary_controller.dart';

class OrderSummaryBindings extends Bindings {
@override
void dependencies() {
    Get.lazyPut(() => OrderSummaryController());
}
}
