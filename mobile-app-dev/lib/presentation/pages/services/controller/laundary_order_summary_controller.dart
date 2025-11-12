import 'package:get/get.dart';
import 'package:knecthotel/gen/assets.gen.dart';

class LaundaryOrderSummaryController extends GetxController {
  final cartItems = [
    {
      'name': 'T-Shirts',
      'image': Assets.images.clothItem0.path,
      'service': 'wash only',
      'quantity': 1,
      'price': 10.0,
    },
    {
      'name': 'Shirts',
      'image': Assets.images.clothItem1.path,
      'service': 'wash only',
      'quantity': 1,
      'price': 10.0,
    },
    {
      'name': 'Jackets',
      'image': Assets.images.clothItem2.path,
      'service': 'wash only',
      'quantity': 1,
      'price': 10.0,
    },
  ];
}
