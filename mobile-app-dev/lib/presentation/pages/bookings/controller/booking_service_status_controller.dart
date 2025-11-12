import 'package:get/get.dart';

class BookingServiceStatusController extends GetxController {
  final RxMap<String, dynamic> data = <String, dynamic>{}.obs;

  @override
  void onInit() {
    super.onInit();

    // Retrieve full data from Get.arguments
    if (Get.arguments != null && Get.arguments is Map<String, dynamic>) {
      data.assignAll(Get.arguments);
    }
  }
}
