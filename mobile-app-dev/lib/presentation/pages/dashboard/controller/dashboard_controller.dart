import 'package:flutter/material.dart';
import 'package:get/get.dart';

class DashboardController extends GetxController {
  late final PageController pageController;
  RxInt selectedPage = 0.obs;

  @override
  void onInit() {
    super.onInit();

    pageController = PageController(initialPage: 0);
    selectedPage.listen(
      (p0) {
        if (pageController.hasClients) {
          pageController.animateToPage(
            p0,
            duration: const Duration(milliseconds: 300),
            curve: Curves.decelerate,
          );
        }
      },
    );
  }

  @override
  void onClose() {
    pageController.dispose();

    super.onClose();
  }
}
