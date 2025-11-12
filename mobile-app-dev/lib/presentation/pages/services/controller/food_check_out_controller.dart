import 'package:get/get.dart';

class FoodCheckOutController extends GetxController {
  final RxString selectedPaymentMode = 'Cash'.obs;
  late final List<RxInt> selectedQuantities;
  final List<Map<String, dynamic>> fastFoodItems = [
    {
      "name": "Veg Sandwich",
      "eligibility": "NOT ELIGIBLE FOR COUPON",
      "price": 110,
      "isVeg": true,
    },
    {
      "name": "Non Veg Cheese Sandwich ",
      "eligibility": "NOT ELIGIBLE FOR COUPON",
      "price": 110,
      "isVeg": false,
    },
  ];

  @override
  void onInit() {
    selectedQuantities =
        List<RxInt>.generate(fastFoodItems.length, (_) => 1.obs);
    super.onInit();
  }
}
