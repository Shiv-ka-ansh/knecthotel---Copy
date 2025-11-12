import 'dart:async';

import 'package:flutter/material.dart';
import 'package:get/get.dart';

class SosRequestFormController extends GetxController {
  final roomNumberController = TextEditingController();
  final RxString selectedEmergencyType = ''.obs;
  final RxInt totalSeconds = 600.obs; // e.g. 10 minutes
  Timer? _timer;

  List<String> emergencyTypes = [
    'Fire',
    'Medical Emergency',
    'Security',
  ];

  String get formattedTime {
    final minutes = (totalSeconds.value ~/ 60).toString().padLeft(2, '0');
    final seconds = (totalSeconds.value % 60).toString().padLeft(2, '0');
    return "$minutes:$seconds";
  }

  void startTimer({int from = 600}) {
    totalSeconds.value = from;
    _timer?.cancel();

    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (totalSeconds.value > 0) {
        totalSeconds.value--;
      } else {
        timer.cancel();
      }
    });
  }

  @override
  void onInit() {
    selectedEmergencyType.value = emergencyTypes[0];
    roomNumberController.text = '203';
    super.onInit();
    startTimer();
  }

  @override
  void onClose() {
    _timer?.cancel();
    roomNumberController.dispose();
    super.onClose();
  }
}
