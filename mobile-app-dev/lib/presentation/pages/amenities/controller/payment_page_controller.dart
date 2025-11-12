import 'package:flutter/material.dart';
import 'package:flutter_credit_card/flutter_credit_card.dart';
import 'package:get/get.dart';

class PaymentPageController extends GetxController {
  final RxBool isExpanded = false.obs;
  final ExpansionTileController paymentCardController =
      ExpansionTileController();
  final selectedPayment = ''.obs;
  final RxMap<String, dynamic> data = <String, dynamic>{}.obs;

  final RxString countryCode = "+91".obs;
  final cardNumber = ''.obs;
  final expiryDate = ''.obs;
  final cardHolderName = ''.obs;
  final cvvCode = ''.obs;
  final isCvvFocused = false.obs;

  final formKey = GlobalKey<FormState>();

  final List<Map<String, dynamic>> swimmingPoolItem = [
    {
      "name": "Swimming Pool",
      "eligibility": "NOT ELIGIBLE FOR COUPON",
      "price": 110,
      "qty": 1,
    },
  ];

  void onCreditCardModelChange(CreditCardModel creditCardModel) {
    cardNumber.value = creditCardModel.cardNumber;
    expiryDate.value = creditCardModel.expiryDate;
    cardHolderName.value = creditCardModel.cardHolderName;
    cvvCode.value = creditCardModel.cvvCode;
    isCvvFocused.value = creditCardModel.isCvvFocused;
  }

  @override
  void onInit() {
    data.value = Get.arguments ?? {};
    super.onInit();
  }
}
