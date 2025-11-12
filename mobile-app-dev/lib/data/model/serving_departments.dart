import 'package:get/get_rx/src/rx_types/rx_types.dart';

class ServingDepartment {
  final String name;
  RxBool isSelected;

  ServingDepartment({required this.name, bool isSelected = false})
      : isSelected = isSelected.obs;
}
