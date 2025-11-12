import 'package:get/get.dart';
import 'package:knecthotel/gen/assets.gen.dart';

class ToiletriesOrderSummaryController extends GetxController {
  final cartItems = <Map<String, dynamic>>[
    {
      'name': 'Shampoo',
      'image': Assets.images.toiletries0.path,
      'price': 10.0,
      'service': 'Wash only',
      'quantity': 2,
    },
    {
      'name': 'Conditioner',
      'image': Assets.images.toiletries1.path,
      'price': 10.0,
      'service': 'Wash only',
      'quantity': 1,
    },
  ].obs;
}
