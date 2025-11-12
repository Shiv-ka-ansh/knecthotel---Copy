import 'package:flutter/material.dart';
import 'package:get/get.dart';

class BookingSelectionController extends GetxController
    with GetSingleTickerProviderStateMixin {
  static const int noOfTabs = 2;
  late TabController tabController;
  final selectedIndex = 0.obs;
  final commentController = TextEditingController();

  final List<Map<String, dynamic>> upcomingBookings = [
    {
      'title': 'Namaste-Village Name',
      'room-type': 'Room type-single',
      'date': '19th feb 2025',
      'checkIn': 'Check-in time: 11:00 AM',
    },
    {
      'title': 'village-in',
      'room-type': 'Room type-Deluxe',
      'date': '25th may 2025',
      'checkIn': 'Check-in time: 9:00 AM',
    },
  ];

  final List<Map<String, dynamic>> pastBookings = [
    {
      "hotel_name": "village-in",
      "room_type": "Room type-Deluxe",
      "check_in_time": "Check-in time: 1:30am",
      "date": "23 Jan 2025",
      "status": "Booked"
    },
    {
      "hotel_name": "Radisson blu",
      "room_type": "Room type-Double",
      "check_in_time": "Check-in time: 12:00pm",
      "date": "18 Jan 2025",
      "status": "Cancelled"
    },
    {
      "hotel_name": "Radisson blu",
      "room_type": "Single",
      "check_in_time": "Check-in time: 12:00pm",
      "date": "10 Jan 2025",
      "status": "Booked"
    }
  ];

  @override
  void onInit() {
    super.onInit();
    tabController = TabController(length: noOfTabs, vsync: this);
    // Listen to tab changes and update selectedIndex
    tabController.addListener(() {
      selectedIndex.value = tabController.index;
    });
  }

  @override
  void onClose() {
    super.onClose();
    tabController.dispose();
    commentController.dispose();
  }
}
