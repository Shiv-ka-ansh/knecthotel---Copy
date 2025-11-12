import 'package:get/get.dart';

class OrderSummaryController extends GetxController {
  final RxMap<String, dynamic> data = <String, dynamic>{}.obs;
  final RxList<Map<String, dynamic>> cartItems = <Map<String, dynamic>>[].obs;

  @override
  void onInit() {
    super.onInit();

    final args = Get.arguments;
    if (args is Map<String, dynamic>) {
      data.assignAll(args);

      final dynamic rawCart = data['cartItems'];
      if (rawCart is List) {
        cartItems.assignAll(List<Map<String, dynamic>>.from(rawCart));
      }
    }
  }
}
