import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/gen/assets.gen.dart';

class FoodServicesController extends GetxController
    with GetSingleTickerProviderStateMixin {
  static const int noOfTabs = 4;
  late TabController tabController;

  final toggleButtonSelected = true.obs;

  final selectedIndex = 0.obs;
  late final List<RxInt> selectedFoodQuantities;
  late final List<RxInt> selectedBeveragesQuantities;
  final RxList<dynamic> filteredFoodList = <dynamic>[].obs;
  final RxList<dynamic> filteredBeveragesList = <dynamic>[].obs;

  final List<Map<String, dynamic>> fastFoodItems = [
    {
      "name": "Veg Sandwich",
      "image": Assets.images.aFoodImg0.path,
      "price": 110,
      "description": "Chilled coffee blended with milk and ice cream.",
      "isVeg": true,
      'quantity': 1,
    },
    {
      "name": "Veg Cheese Sandwich",
      "image": Assets.images.aFoodImg1.path,
      "price": 110,
      "description": "Chilled coffee blended with milk and ice cream.",
      "isVeg": true,
      'quantity': 1,
    },
    {
      "name": "Veg Frankie",
      "image": Assets.images.aFoodImg2.path,
      "price": 110,
      "isVeg": true,
      "description": "Chilled coffee blended with milk and ice cream.",
      'quantity': 1,
    },
    {
      "name": "Veg Burger",
      "image": Assets.images.aFoodImg3.path,
      "price": 110,
      "isVeg": true,
      "description": "Chilled coffee blended with milk and ice cream.",
      'quantity': 1,
    },
    {
      "name": "Non-Veg Sandwich",
      "image": Assets.images.aFoodImg0.path,
      "price": 110,
      "isVeg": false,
      "description": "Chilled coffee blended with milk and ice cream.",
      'quantity': 1,
    },
    {
      "name": "Non-Veg Cheese Sandwich",
      "image": Assets.images.aFoodImg1.path,
      "price": 110,
      "isVeg": false,
      "description": "Chilled coffee blended with milk and ice cream.",
      'quantity': 1,
    },
    {
      "name": "Non-Veg Frankie",
      "image": Assets.images.aFoodImg2.path,
      "price": 110,
      "isVeg": false,
      "description": "Chilled coffee blended with milk and ice cream.",
      'quantity': 1,
    },
    {
      "name": "Non-Veg Burger",
      "image": Assets.images.aFoodImg3.path,
      "price": 110,
      "description": "Chilled coffee blended with milk and ice cream.",
      "isVeg": false,
      'quantity': 1,
    },
  ];

  final List<Map<String, dynamic>> beverages = [
    // Alcoholic Beverages
    {
      "name": "Lager",
      "image": Assets.images.beverages1.path,
      "description": "A light and refreshing beer with a crisp finish.",
      "price": 599,
      "isAlcoholic": true,
      "quantity": 1,
      "category": "Beer",
    },
    {
      "name": "Budweiser",
      "image": Assets.images.beverages2.path,
      "description": "Classic American-style lager known for its smoothness.",
      "price": 599,
      "isAlcoholic": true,
      "quantity": 1,
      "category": "Beer",
    },
    {
      "name": "Corona",
      "image": Assets.images.beverages3.path,
      "description": "Popular Mexican beer with a refreshing citrus flavor.",
      "price": 599,
      "isAlcoholic": true,
      "quantity": 1,
      "category": "Beer",
    },
    {
      "name": "Sula Rose'",
      "image": Assets.images.beverages4.path,
      "description": "Indian rosé wine with fruity and floral notes.",
      "price": 599,
      "isAlcoholic": true,
      "quantity": 1,
      "category": "Wine",
    },
    {
      "name": "Sangria",
      "image": Assets.images.beverages1.path,
      "description": "Wine-based cocktail infused with fruits and juices.",
      "price": 599,
      "isAlcoholic": true,
      "quantity": 1,
      "category": "Wine",
    },
    {
      "name": "White wine",
      "image": Assets.images.beverages2.path,
      "description":
          "A light and crisp white wine, ideal for pairing with meals.",
      "price": 599,
      "isAlcoholic": true,
      "quantity": 1,
      "category": "Wine",
    },
    {
      "name": "Champagne",
      "image": Assets.images.beverages3.path,
      "description": "Sparkling wine known for its celebratory bubbles.",
      "price": 599,
      "isAlcoholic": true,
      "quantity": 1,
      "category": "Wine",
    },
    {
      "name": "Vodka",
      "image": Assets.images.beverages4.path,
      "description": "Clear spirit with a clean taste, perfect for cocktails.",
      "price": 599,
      "isAlcoholic": true,
      "quantity": 1,
      "category": "Liquor",
    },
    {
      "name": "Whiskey",
      "image": Assets.images.beverages1.path,
      "description": "Aged spirit with complex flavors of oak and caramel.",
      "price": 599,
      "isAlcoholic": true,
      "quantity": 1,
      "category": "Liquor",
    },
    {
      "name": "Rum",
      "image": Assets.images.beverages2.path,
      "description": "Sweet and bold spirit made from sugarcane or molasses.",
      "price": 599,
      "isAlcoholic": true,
      "quantity": 1,
      "category": "Liquor",
    },
    {
      "name": "Scotch",
      "image": Assets.images.beverages3.path,
      "description": "Whisky made in Scotland with peaty and smoky flavor.",
      "price": 599,
      "isAlcoholic": true,
      "quantity": 1,
      "category": "Liquor",
    },

    // Non-Alcoholic Beverages
    {
      "name": "Coca-Cola",
      "image": Assets.images.beverages1.path,
      "description": "Classic fizzy soda with a bold cola flavor.",
      "price": 50,
      "isAlcoholic": false,
      "quantity": 1,
      "category": "Soft Drinks",
    },
    {
      "name": "Lemonade",
      "image": Assets.images.beverages2.path,
      "description": "Cool and refreshing drink with tangy lemon flavor.",
      "price": 40,
      "isAlcoholic": false,
      "quantity": 1,
      "category": "Juices",
    },
    {
      "name": "Milk",
      "image": Assets.images.beverages3.path,
      "description": "Fresh and nutritious cow's milk, great for all ages.",
      "price": 30,
      "isAlcoholic": false,
      "quantity": 1,
      "category": "Dairy",
    },
    {
      "name": "Orange Juice",
      "image": Assets.images.beverages4.path,
      "description": "100% natural orange juice packed with Vitamin C.",
      "price": 60,
      "isAlcoholic": false,
      "quantity": 1,
      "category": "Juices",
    },
    {
      "name": "Cold Coffee",
      "image": Assets.images.beverages1.path,
      "description": "Chilled coffee blended with milk and ice cream.",
      "price": 80,
      "isAlcoholic": false,
      "quantity": 1,
      "category": "Café",
    },
  ];

  @override
  void onInit() {
    super.onInit();
    tabController = TabController(length: noOfTabs, vsync: this);

    // Listen to tab changes and update selectedIndex
    tabController.addListener(() {
      selectedIndex.value = tabController.index;
    });
    selectedFoodQuantities =
        List<RxInt>.generate(fastFoodItems.length, (_) => 0.obs);
    selectedBeveragesQuantities =
        List<RxInt>.generate(beverages.length, (_) => 0.obs);
    updateFilteredList();
  }

  void updateFilteredList() {
    filteredFoodList.value = fastFoodItems
        .where((item) => item['isVeg'] == toggleButtonSelected.value)
        .toList();
    filteredBeveragesList.value = beverages
        .where((item) => item['isAlcoholic'] == toggleButtonSelected.value)
        .toList();
  }
}
