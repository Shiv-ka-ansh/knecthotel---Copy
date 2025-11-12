import 'dart:ui';

import 'package:knecthotel/gen/assets.gen.dart';

class Amenities {
  final SvgGenImage icon;
  final String name;
  final VoidCallback onClick;

  Amenities({required this.icon, required this.name, required this.onClick});
}
