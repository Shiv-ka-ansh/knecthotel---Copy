import 'package:get/get.dart';

class LanguageSelectionController extends GetxController {
  final selectedLanguage = "English".obs;
  final List<String> languages = [
    "English",
    "Hindi",
    "मराठी",
    "தமிழ்",
    "తెలుగు",
    "ગુજરાતી",
    "ಕನ್ನಡ",
    "മലയാളം"
  ];
}
