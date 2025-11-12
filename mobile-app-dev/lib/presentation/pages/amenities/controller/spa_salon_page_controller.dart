import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/gen/assets.gen.dart';

class SpaSalonPageController extends GetxController
    with GetSingleTickerProviderStateMixin {
  static const int noOfTabs = 2;
  late TabController tabController;
  final dateController = TextEditingController();
  final timeController = TextEditingController();
  final RxString selectedServiceType = Strings.lstSpaServiceType[0].obs;
  final RxString selectedSubServiceType = ''.obs;
  final descriptionController = TextEditingController();
  final selectedIndex = 0.obs;
  final isMenuOpen = false.obs;

  List<Map<String, dynamic>> services = [
    {
      "category": "Massage",
      "items": [
        {
          "title": "Swedish Massage",
          "price": "₹599.0",
          "description":
              "A gentle, full-body massage that helps improve circulation and promote relaxation.",
          "image": Assets.images.spaImg0.image()
        },
        {
          "title": "Deep-tissue Massage",
          "price": "₹599.0",
          "description":
              "A gentle, full-body massage that helps improve circulation and promote relaxation.",
          "image": Assets.images.spaImg1.image()
        },
        {
          "title": "Aromatherapy Massage",
          "price": "₹599.0",
          "description":
              "A gentle, full-body massage that helps improve circulation and promote relaxation.",
          "image": Assets.images.spaImg2.image()
        },
        {
          "title": "Hot Stone Massage",
          "price": "₹599.0",
          "description":
              "A gentle, full-body massage that helps improve circulation and promote relaxation.",
          "image": Assets.images.spaImg3.image()
        },
        {
          "title": "Thai Massage",
          "price": "₹599.0",
          "description":
              "A gentle, full-body massage that helps improve circulation and promote relaxation.",
          "image": Assets.images.spaImg4.image()
        },
      ],
    },
    {
      "category": "Facial",
      "items": [
        {
          "title": "Hydrating Facial",
          "price": "₹599.0",
          "description":
              "A gentle, full-body massage that helps improve circulation and promote relaxation.",
          "image": Assets.images.spaImg5.image()
        },
        {
          "title": "Anti-aging Facial",
          "price": "₹599.0",
          "description":
              "A gentle, full-body massage that helps improve circulation and promote relaxation.",
          "image": Assets.images.spaImg6.image()
        },
        {
          "title": "Brightening Facial",
          "price": "₹599.0",
          "description":
              "A gentle, full-body massage that helps improve circulation and promote relaxation.",
          "image": Assets.images.spaImg7.image()
        },
        {
          "title": "Acne-Treatement Facial",
          "price": "₹599.0",
          "description":
              "A gentle, full-body massage that helps improve circulation and promote relaxation.",
          "image": Assets.images.spaImg8.image()
        },
      ],
    },
    {
      "category": "Body Treatments",
      "items": [
        {
          "title": "Body Scrub & Exfoliation",
          "price": "₹599.0",
          "description":
              "A gentle, full-body massage that helps improve circulation and promote relaxation.",
          "image": Assets.images.spaImg9.image()
        },
        {
          "title": "Detoxifying Body Wrap",
          "price": "₹599.0",
          "description":
              "A gentle, full-body massage that helps improve circulation and promote relaxation.",
          "image": Assets.images.spaImg10.image()
        },
        {
          "title": "Herbal Stem Therapy",
          "price": "₹599.0",
          "description":
              "A gentle, full-body massage that helps improve circulation and promote relaxation.",
          "image": Assets.images.spaImg11.image()
        },
      ],
    },
    {
      "category": "Salon Services",
      "items": [
        {
          "title": "Manicure & Padding",
          "price": "₹599.0",
          "description":
              "A gentle, full-body massage that helps improve circulation and promote relaxation.",
          "image": Assets.images.spaImg12.image()
        },
        {
          "title": "Hair Spa & Styling",
          "price": "₹599.0",
          "description":
              "A gentle, full-body massage that helps improve circulation and promote relaxation.",
          "image": Assets.images.spaImg13.image()
        },
        {
          "title": "Waxing & Threading",
          "price": "₹599.0",
          "description":
              "A gentle, full-body massage that helps improve circulation and promote relaxation.",
          "image": Assets.images.spaImg14.image()
        },
      ],
    },
    {
      "category": "Couple offers",
      "items": [
        {
          "title": "Couple Spa",
          "price": "₹599.0",
          "description":
              "A gentle, full-body massage that helps improve circulation and promote relaxation.",
          "image": Assets.images.spaImg15.image()
        },
        {
          "title": "Full-day Spa Retreat",
          "price": "₹599.0",
          "description":
              "A gentle, full-body massage that helps improve circulation and promote relaxation.",
          "image": Assets.images.spaImg16.image()
        },
        {
          "title": "Customized  Package",
          "price": "₹599.0",
          "description":
              "A gentle, full-body massage that helps improve circulation and promote relaxation.",
          "image": Assets.images.spaImg17.image()
        },
      ],
    },
  ];

  final availableSlots = [
    {"time": "8:00am-8:30am", "isAvailable": true},
    {"time": "8:30am-9:00pm", "isAvailable": false},
    {"time": "9:30pm-10:00pm", "isAvailable": true, "isLimited": true},
    {"time": "10:30pm-11:00pm", "isAvailable": true}
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
    dateController.dispose();
    timeController.dispose();
    descriptionController.dispose();
    super.onClose();
  }
}
