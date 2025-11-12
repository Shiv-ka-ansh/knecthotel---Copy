import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/data/model/serving_departments.dart';
import 'package:multi_dropdown/multi_dropdown.dart';

class HotelFeatureSignupPageController extends GetxController {
  final hotelNoOfRoomsController = TextEditingController();
  final hotelNoOfStaffController = TextEditingController();
  final hotelPhoneController = TextEditingController();
  final hotelEmailController = TextEditingController();
  final checkInTimeController = TextEditingController();
  final checkOutTimeController = TextEditingController();
  final RxString dialCode = '+91'.obs;

  final MultiSelectController<String> rootTypeController =
      MultiSelectController<String>();
  final MultiSelectController<String> roomFeatureController =
      MultiSelectController<String>();

  final List<ServingDepartment> servingDepartments = [
    ServingDepartment(name: 'Reception'),
    ServingDepartment(name: 'Housekeeping'),
    ServingDepartment(name: 'In-Room Dinning'),
    ServingDepartment(name: 'Gym'),
    ServingDepartment(name: 'Community Hall'),
    ServingDepartment(name: 'Conference Hall'),
    ServingDepartment(name: 'Spa'),
    ServingDepartment(name: 'Salon'),
    ServingDepartment(name: 'Swimming Pool'),
    ServingDepartment(name: 'SOS'),
    ServingDepartment(name: 'Chat With Hotel Staff'),
    ServingDepartment(name: 'Order Management'),
    ServingDepartment(name: 'In-Room Control'),
  ];

  final List<String> roomTypes = [
    'Single',
    'Double',
    'Twin',
    'Deluxe',
    'Studio Room/Apartments',
    'Junior Suites',
    'Suite',
    'Presidential Suite',
    'Connecting Suite',
    'Rooms With a View'
  ];

  final List<String> roomFeatures = [
    'Sea Side',
    'Balcony View',
  ];

  @override
  void onClose() {
    hotelNoOfRoomsController.dispose();
    hotelNoOfStaffController.dispose();
    super.onClose();
  }
}
