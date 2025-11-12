import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/onboarding/controller/language_selection_controller.dart';

class LanguageSelectionBindings extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut(() => LanguageSelectionController());
  }
}
