import 'package:flutter/widgets.dart';
import 'package:get/get.dart';
import 'package:knecthotel/gen/assets.gen.dart';

class ViewRoomsController extends GetxController {
  List<Image> rooms = [
    Assets.images.room1.image(fit: BoxFit.cover),
    Assets.images.room2.image(fit: BoxFit.cover),
    Assets.images.room3.image(fit: BoxFit.cover),
    Assets.images.room4.image(fit: BoxFit.cover),
  ];
}
