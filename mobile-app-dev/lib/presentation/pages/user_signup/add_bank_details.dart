import 'package:flutter/material.dart';
import 'package:flutter_credit_card/flutter_credit_card.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/gen/assets.gen.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/pages/user_signup/controller/add_bank_details_controller.dart';
import 'package:knecthotel/presentation/widgets/common_button.dart';

class AddBankDetails extends GetView<AddBankDetailsController> {
  const AddBankDetails({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: AppBar(
        backgroundColor: AppColors.transparentColor,
        title: const Text(
          Strings.strAddBankDetails,
          style: TextStyle(
            color: AppColors.blackColor,
            fontFamily: FontFamily.openSansBold,
          ),
        ),
        centerTitle: true,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Align(
                alignment: Alignment.topRight,
                child: InkWell(
                  onTap: () {},
                  child: Container(
                    width: 70,
                    decoration: BoxDecoration(
                      color: AppColors.primaryDarkColor,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: InkWell(
                      onTap: () => Get.toNamed(RouteConst.uploadPicture),
                      child: const Padding(
                        padding: EdgeInsets.all(5),
                        child: Center(
                          child: Text(
                            Strings.strSkip,
                            style: TextStyle(
                              color: AppColors.whiteColor,
                              fontFamily: FontFamily.openSansMedium,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                )),
            Obx(
              () => CreditCardWidget(
                enableFloatingCard: controller.useFloatingAnimation.value,
                glassmorphismConfig: null,
                cardNumber: controller.cardNumber.value,
                cardHolderName: controller.cardHolderName.value,
                expiryDate: controller.expiryDate.value,
                cvvCode: controller.cvvCode.value,
                bankName: Strings.strBankName,
                showBackView: controller.isCvvFocused.value,
                obscureCardNumber: true,
                isChipVisible: false,
                obscureCardCvv: true,
                isHolderNameVisible: true,
                cardBgColor: AppColors.primaryDarkColor,
                backgroundImage: Assets.images.creditCardBg.path,
                isSwipeGestureEnabled: true,
                onCreditCardWidgetChange: (CreditCardBrand creditCardBrand) {},
              ),
            ).paddingOnly(top: 15, left: 10, right: 10),
            CreditCardForm(
              formKey: controller.formKey,
              obscureCvv: true,
              obscureNumber: true,
              //autovalidateMode: AutovalidateMode.onUnfocus,
              cardNumber: controller.cardNumber.value,
              cvvCode: controller.cvvCode.value,
              isHolderNameVisible: true,
              isCardNumberVisible: true,
              isExpiryDateVisible: true,
              cardHolderName: controller.cardHolderName.value,
              expiryDate: controller.expiryDate.value,
              inputConfiguration: InputConfiguration(
                cardNumberDecoration: _inputDecoration(
                  Strings.strHintCardNumber,
                  Strings.strCardNumber,
                ).copyWith(
                  suffix: Assets.images.creditCardIc.svg(),
                ),
                cardHolderDecoration: _inputDecoration(
                  Strings.strCardHolderName,
                  Strings.strCardHolderName,
                ),
                expiryDateDecoration: _inputDecoration(
                  Strings.strHintExpiryDate,
                  Strings.expiryDate,
                ),
                cvvCodeDecoration: _inputDecoration(
                  Strings.strHintCvv,
                  Strings.strCvv,
                ),
              ),
              onCreditCardModelChange: controller.onCreditCardModelChange,
            ),
            const Text(
              Strings.strSecurePaymentText,
              style: TextStyle(
                color: Colors.black54,
                fontFamily: FontFamily.openSansMedium,
                fontSize: 12,
              ),
            ).paddingOnly(top: 15, left: 20, right: 20),
            const SizedBox(height: 50),
            CommonButton(
              onPress: () {
                Get.toNamed(RouteConst.uploadPicture);
              },
              text: Strings.strConfirm,
            ).paddingOnly(bottom: 30)
          ],
        ).paddingAll(20),
      ),
    );
  }

  InputDecoration _inputDecoration(String hintText, String labelText) {
    return InputDecoration(
      labelText: labelText,
      floatingLabelBehavior: FloatingLabelBehavior.auto,
      labelStyle: const TextStyle(
        color: AppColors.blackColor,
        fontSize: 16,
        fontFamily: FontFamily.openSansSemiBold,
      ),
      hintText: hintText,
      hintStyle: const TextStyle(
        color: AppColors.unSelectedColor,
        fontFamily: FontFamily.openSansRegular,
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      border: OutlineInputBorder(
          borderSide: BorderSide.none, borderRadius: BorderRadius.circular(8)),
      errorBorder: OutlineInputBorder(
          borderSide: BorderSide.none, borderRadius: BorderRadius.circular(8)),
      enabledBorder: OutlineInputBorder(
          borderSide: BorderSide.none, borderRadius: BorderRadius.circular(8)),
      focusedBorder: OutlineInputBorder(
          borderSide: BorderSide.none, borderRadius: BorderRadius.circular(8)),
      disabledBorder: OutlineInputBorder(
          borderSide: BorderSide.none, borderRadius: BorderRadius.circular(8)),
      focusedErrorBorder: OutlineInputBorder(
          borderSide: BorderSide.none, borderRadius: BorderRadius.circular(8)),
      filled: true,
      fillColor: AppColors.textFieldBg,
    );
  }
}
