import 'package:get/get.dart';

class CleaningCheckoutPageController extends GetxController {
  final RxInt selectedQuantity = 1.obs;
  final RxMap<String, dynamic> data = <String, dynamic>{}.obs;
  final RxString selectedPaymentMode = 'Cash'.obs;

  @override
  void onInit() {
    // Retrieve full data from Get.arguments
    if (Get.arguments != null && Get.arguments is Map<String, dynamic>) {
      data.assignAll(Get.arguments);
    }
    super.onInit();
  }
}
