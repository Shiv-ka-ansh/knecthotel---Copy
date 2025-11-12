import 'package:get/get.dart';
import 'package:knecthotel/data/model/amenities.dart';

class AmenitiesPageController extends GetxController {
  final RxInt selectedIndex = (-1).obs;
  final RxMap<String, dynamic> data = <String, dynamic>{}.obs;
  final RxList<Amenities> amenities = <Amenities>[].obs;

  @override
  void onInit() {
    // Retrieve full data from Get.arguments
    if (Get.arguments != null && Get.arguments is Map<String, dynamic>) {
      data.assignAll(Get.arguments);
      if (data['amenities'] != null && data['amenities'] is List<Amenities>) {
        amenities.assignAll(data['amenities']);
      }
    }

    super.onInit();
  }
}
