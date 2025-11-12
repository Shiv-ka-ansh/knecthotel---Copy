import 'package:flutter/material.dart';
import 'package:flutter_credit_card/flutter_credit_card.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/gen/fonts.gen.dart';

class AddBankDetailsController extends GetxController {
  var isLightTheme = false.obs;
  var cardNumber = ''.obs;
  var expiryDate = ''.obs;
  var cardHolderName = ''.obs;
  var cvvCode = ''.obs;
  var isCvvFocused = false.obs;
  var useBackgroundImage = false.obs;
  var useFloatingAnimation = true.obs;

  final formKey = GlobalKey<FormState>();

  @override
  void onReady() {
    _showEncryptionMessage();
    super.onReady();
  }

  void onCreditCardModelChange(CreditCardModel creditCardModel) {
    cardNumber.value = creditCardModel.cardNumber;
    expiryDate.value = creditCardModel.expiryDate;
    cardHolderName.value = creditCardModel.cardHolderName;
    cvvCode.value = creditCardModel.cvvCode;
    isCvvFocused.value = creditCardModel.isCvvFocused;
  }

  void _showEncryptionMessage() {
    Get.dialog(
      barrierDismissible: true,
      useSafeArea: true,
      GestureDetector(
        onTap: () => Get.back(),
        child: Dialog(
          child: SingleChildScrollView(
            child: Container(
              width: 350,
              height: 250,
              decoration: BoxDecoration(
                color: AppColors.primaryDarkColor,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.whiteColor, width: 1.5),
              ),
              child: const Center(
                child: Padding(
                  padding: EdgeInsets.all(30),
                  child: Text(Strings.strCardEncryptionMessage,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: AppColors.whiteColor,
                        fontFamily: FontFamily.openSansMedium,
                        fontSize: 20,
                      )),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
