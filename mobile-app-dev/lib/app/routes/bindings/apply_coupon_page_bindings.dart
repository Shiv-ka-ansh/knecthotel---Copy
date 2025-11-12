
import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/common/controller/apply_coupon_page_controller.dart';

class ApplyCouponPageBindings extends Bindings {
@override
void dependencies() {
    Get.lazyPut(() => ApplyCouponPageController());
}
}
