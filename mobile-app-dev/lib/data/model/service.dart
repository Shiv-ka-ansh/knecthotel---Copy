import 'dart:ui';

import 'package:knecthotel/gen/assets.gen.dart';

class Service {
  final AssetGenImage img;
  final String name;
  final String description;
  final VoidCallback onClick;

  Service(
      {required this.img,
      required this.name,
      required this.description,
      required this.onClick});
}
