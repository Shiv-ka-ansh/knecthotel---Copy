import 'package:flutter/material.dart';
import 'package:get/get.dart';

class HotelInfoSignupPageController extends GetxController {
  final RxString dialCode = '+91'.obs;
  final List<String> hotelCategoryList = [
    '3 Star',
    '4 Star',
    '5 Star',
    '7 Star',
  ];
  final RxString selectedhotelCategory = ''.obs;

  final hotelNameController = TextEditingController();
  final hotelPhoneController = TextEditingController();
  final hotelEmailController = TextEditingController();

  final hotelAddressController = TextEditingController();
  final hotelCityController = TextEditingController();
  final hotelStateController = TextEditingController();
  final hotelCountryController = TextEditingController();
  final hotelPinCodeController = TextEditingController();

  @override
  void onInit() {
    selectedhotelCategory.value = hotelCategoryList[0];
    super.onInit();
  }

  @override
  void onClose() {
    hotelNameController.dispose();
    hotelPhoneController.dispose();
    hotelEmailController.dispose();
    hotelAddressController.dispose();
    hotelCityController.dispose();
    hotelStateController.dispose();
    hotelCountryController.dispose();
    hotelPinCodeController.dispose();
    super.onClose();
  }
}
