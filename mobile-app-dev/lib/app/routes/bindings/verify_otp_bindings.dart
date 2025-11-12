import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/auth/controller/verify_otp_controller.dart';

class VerifyOtpBindings extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut(() => VerifyOtpController());
  }
}
