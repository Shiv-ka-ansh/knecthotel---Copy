import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/dashboard/controller/dashboard_controller.dart';

class DashboardBindings extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut(() => DashboardController(), fenix: true);
  }
}
