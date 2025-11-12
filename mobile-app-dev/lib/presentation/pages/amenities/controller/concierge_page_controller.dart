import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/gen/assets.gen.dart';

class ConciergePageController extends GetxController
    with GetSingleTickerProviderStateMixin {
  static const int noOfTabs = 2;
  late TabController tabController;
  final idController = TextEditingController();
  final selectedIndex = 0.obs;
  final RxMap<String, dynamic> data = <String, dynamic>{}.obs;
  final RxString requestTxt = ''.obs;
  final TextEditingController descriptionController = TextEditingController();
  final TextEditingController feedbackController = TextEditingController();
  final ExpansionTileController progressStatusController =
      ExpansionTileController();
  final RxString selectedProgress = Strings.lstProgressStatus[0].obs;
  final RxInt selectedRating = 0.obs;

  final List<Map<String, String>> pastRequests = [
    {
      "id": "RD012345",
      "type": "Complaint",
      "room": "502",
      "date": "10 Jan 2025",
      "time": "11:00 AM",
      "status": "Completed"
    },
    {
      "id": "RD012346",
      "type": "Maintenance",
      "room": "305",
      "date": "15 Feb 2025",
      "time": "02:30 PM",
      "status": "Cancelled"
    },
  ];

  List<Map<String, dynamic>> conciergeServices = [
    {
      "category": "Nearby Attractions",
      "subCategories": [
        {
          "subCategory": "Cultural and Historic Sites",
          "items": [
            {
              "title": "National Museum",
              "distance": "80m",
              "description": "Showcasing Art & History",
              "image": Assets.images.attractionImg0.image(),
            },
            {
              "title": "Sun Temple",
              "distance": "80m",
              "description": "Peace & Spirituality",
              "image": Assets.images.attractionImg1.image(),
            },
            {
              "title": "Famous Landmark",
              "distance": "80m",
              "description": "Must-Visit Heritage Site",
              "image": Assets.images.attractionImg2.image(),
            },
          ],
        },
        {
          "subCategory": "Park and Outdoor Spaces",
          "items": [
            {
              "title": "Park",
              "distance": "80m",
              "description": "Showcasing Art & History",
              "image": Assets.images.attractionImg3.image(),
            },
            {
              "title": "Lake",
              "distance": "80m",
              "description": "Showcasing Art & History",
              "image": Assets.images.attractionImg4.image(),
            },
            {
              "title": "Adventure Park",
              "distance": "80m",
              "description": "Showcasing Art & History",
              "image": Assets.images.attractionImg5.image(),
            },
          ],
        },
        {
          "subCategory": "Shopping & Entertainment",
          "items": [
            {
              "title": "Phoenix Mall",
              "distance": "80m",
              "description": "Showcasing Art & History",
              "image": Assets.images.attractionImg6.image(),
            },
            {
              "title": "Inox Cinema's",
              "distance": "80m",
              "description": "Showcasing Art & History",
              "image": Assets.images.attractionImg7.image(),
            },
            {
              "title": "Meena Bazar",
              "distance": "80m",
              "description": "Showcasing Art & History",
              "image": Assets.images.attractionImg8.image(),
            },
          ],
        },
      ],
    },
    {
      "category": "Nearby Cafes & Restaurants",
      "subCategories": [
        {
          "subCategory": "Cozy Dinings",
          "items": [
            {
              "title": "Cappuccino Blast",
              "distance": "80m",
              "description": "Cozy Dinings",
              "image": Assets.images.restaurantImg9.image(),
            },
            {
              "title": "Dobara",
              "distance": "80m",
              "description": "Cozy Dinings",
              "image": Assets.images.restaurantImg10.image(),
            },
            {
              "title": "Boom Box",
              "distance": "80m",
              "description": "Cozy Dinings",
              "image": Assets.images.restaurantImg11.image(),
            },
          ]
        },
        {
          "subCategory": "Bar & Lounge",
          "items": [
            {
              "title": "Tonique",
              "distance": "80m",
              "description": "Bar & Lounge",
              "image": Assets.images.restaurantImg12.image(),
            },
            {
              "title": "SkyGlass",
              "distance": "80m",
              "description": "Bar & Lounge",
              "image": Assets.images.restaurantImg13.image(),
            },
            {
              "title": "Dobara",
              "distance": "80m",
              "description": "Bar & Lounge",
              "image": Assets.images.restaurantImg14.image(),
            },
          ],
        },
      ],
    }
  ];

  @override
  void onInit() {
    super.onInit();
    data.value = Get.arguments ?? {};
    requestTxt.value = data['requestType']?.toString() ?? '';
    descriptionController.text = data['description']?.toString() ?? '';
    tabController = TabController(length: noOfTabs, vsync: this);
    // Listen to tab changes and update selectedIndex
    tabController.addListener(() {
      selectedIndex.value = tabController.index;
    });
  }

  @override
  void onClose() {
    idController.dispose();
    descriptionController.dispose();
    feedbackController.dispose();
    super.onClose();
  }
}
