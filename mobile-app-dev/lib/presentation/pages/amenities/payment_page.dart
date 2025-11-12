import 'package:flutter/material.dart';
import 'package:flutter_credit_card/flutter_credit_card.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/gen/assets.gen.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/widgets/common_button.dart';

import 'controller/payment_page_controller.dart';

class PaymentPage extends GetView<PaymentPageController> {
  const PaymentPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: AppBar(
        backgroundColor: AppColors.transparentColor,
        title: const Text(
          Strings.strPayment,
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
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _progressStep(context, Strings.strSelectOrder, true),
                _progressStep(context, Strings.strPayment, true),
                _progressStep(context, Strings.strInvoice, false),
              ],
            ),
            const SizedBox(height: 20),

            // Payment Options
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _paymentTile(Strings.strCOD, "cash", Assets.images.icCod),
                _sectionTitle(Strings.strOnlinePaymentOptions),
                _paymentTile(Strings.strUPI, "upi", Assets.images.icUpi),
                Theme(
                  data: ThemeData.light().copyWith(
                    dividerColor: AppColors.transparentColor,
                  ),
                  child: ExpansionTile(
                    controller: controller.paymentCardController,
                    tilePadding: EdgeInsets.zero,
                    showTrailingIcon: false,
                    title: _paymentTile(
                      Strings.strCreditDebitCard,
                      "card",
                      Assets.images.icCard,
                      isExpandable: true,
                    ),
                    children: [
                      _cardLayout(),
                    ],
                  ),
                ),
                _sectionTitle(Strings.strOtherPaymentOptions),
                _paymentTile(Strings.strEMI, "emi", Assets.images.icCard),
                _paymentTile(
                    Strings.strPayLater, "paylater", Assets.images.icPaylater),
                _paymentTile(Strings.strAtTimeOfCheckout, "checkout",
                    Assets.images.icAtTimeOfCheckout),
              ],
            ),
            const SizedBox(
              height: 80,
            ),
            CommonButton(
              onPress: () {
                final from = controller.data['from'];
                final name = controller.data['name'] ?? '';

                void navigateToConfirmOrder(Map<String, String> arguments) {
                  Get.toNamed(RouteConst.confirmOrderPage,
                      arguments: arguments);
                }

                switch (from) {
                  case RouteConst.conciergeServiceForm:
                    navigateToConfirmOrder({
                      'from': RouteConst.conciergePage,
                      "message": 'Your request to visit ',
                      "requestName": name,
                      'servicePerson': "Mr. Ajit Pathak",
                      "time": "10:00 min",
                    });
                    break;

                  case RouteConst.cleaningCheckoutPage:
                    navigateToConfirmOrder({
                      'from': RouteConst.cleaningCheckoutPage,
                      'name': controller.data['name'],
                      "message": 'Service request of ',
                      "requestName": name,
                      'servicePerson': "Mr. Ajit Pathak",
                      "time": "10:00 min",
                    });
                    break;

                  case Strings.strTaxiCabService:
                    navigateToConfirmOrder({
                      'from': Strings.strTaxiCabService,
                      "message": 'Your request to ',
                      "requestName": name,
                      'servicePerson': "Mr. Ajit Pathak",
                      "time": "10:00 min",
                    });
                    break;

                  case RouteConst.swimmingPoolPage:
                    Get.toNamed(RouteConst.orderSummaryPage, arguments: {
                      'from': RouteConst.swimmingPoolPage,
                      'cartItems': controller.swimmingPoolItem
                    });
                    break;
                  case RouteConst.gymPage:
                    showCheckinDailog(context);
                    break;
                  case RouteConst.spaPage:
                    showCheckinDailog(context);
                    break;

                  default:
                    Get.toNamed(RouteConst.requestStatusPage, arguments: {
                      'requestType': controller.data['requestType'] ?? '',
                      'description': controller.data['description'] ?? '',
                      'from': from ?? RouteConst.paymentPage,
                    });
                }
              },
              text: Strings.strConfirm,
            ).paddingOnly(bottom: 40),
          ],
        ).paddingSymmetric(vertical: 25, horizontal: 15),
      ),
    );
  }

  Widget _cardLayout() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        color: AppColors.primaryColor,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          CreditCardForm(
            formKey: controller.formKey,
            obscureCvv: true,
            obscureNumber: true,
            autovalidateMode: AutovalidateMode.onUnfocus,
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
          const SizedBox(height: 10),
          CommonButton(
            onPress: () {},
            bgColor: AppColors.primaryDarkColor,
            text: Strings.strConfirm,
          )
        ],
      ),
    );
  }

  InputDecoration _inputDecoration(String hintText, String labelText) {
    return InputDecoration(
      labelText: labelText,
      floatingLabelBehavior: FloatingLabelBehavior.auto,
      labelStyle: const TextStyle(
        color: AppColors.blackColor,
        fontSize: 14,
        fontFamily: FontFamily.openSansSemiBold,
      ),
      hintText: hintText,
      hintStyle: const TextStyle(
        color: AppColors.unSelectedColor,
        fontFamily: FontFamily.openSansRegular,
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
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

  // Progress Indicator Step
  Widget _progressStep(context, String text, bool isActive) {
    return Row(
      children: [
        Container(
          width: (MediaQuery.of(context).size.width / 9),
          height: 2,
          decoration: const BoxDecoration(
            shape: BoxShape.rectangle,
            color: AppColors.primaryDarkColor,
          ),
        ),
        CircleAvatar(
          backgroundColor: isActive ? AppColors.primaryDarkColor : Colors.grey,
          radius: 6,
          child: const Center(
            child: Icon(
              size: 10,
              Icons.check,
              color: AppColors.whiteColor,
            ),
          ),
        ),
        const SizedBox(width: 5),
        Text(
          text,
          style: const TextStyle(
              fontSize: 12, fontFamily: FontFamily.openSansRegular),
        ),
      ],
    );
  }

  // Section Title
  Widget _sectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(top: 16, bottom: 8),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 14,
          fontFamily: FontFamily.openSansRegular,
          color: Colors.black54,
        ),
      ),
    );
  }

  // Standard Payment Option Tile
  Widget _paymentTile(String title, String value, AssetGenImage icon,
      {bool isExpandable = false}) {
    return Obx(
      () => Card(
        color: AppColors.textFieldBg,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        child: RadioListTile<String>(
          contentPadding: const EdgeInsets.symmetric(horizontal: 4),
          title: Text(title),
          value: value,
          groupValue: controller.selectedPayment.value,
          onChanged: (val) => controller.selectedPayment.value = val!,
          secondary: isExpandable
              ? GestureDetector(
                  onTap: () {
                    if (controller.paymentCardController.isExpanded) {
                      controller.paymentCardController.collapse();
                    } else {
                      controller.paymentCardController.expand();
                    }
                    controller.isExpanded.value =
                        controller.paymentCardController.isExpanded;
                  },
                  child: Obx(
                    () => SizedBox(
                      width: 60,
                      child: Row(
                        children: [
                          icon.image(width: 30, height: 30),
                          const SizedBox(
                            width: 2,
                          ),
                          Icon(
                            controller.isExpanded.value
                                ? Icons.keyboard_arrow_up_outlined
                                : Icons.keyboard_arrow_down_outlined,
                          ),
                        ],
                      ),
                    ),
                  ),
                )
              : icon.image(width: 30, height: 30),
        ),
      ),
    );
  }

  Future<void> showCheckinDailog(BuildContext context) {
    return Get.dialog(
      barrierDismissible: true,
      useSafeArea: true,
      GestureDetector(
        onTap: () => Get.back(),
        child: Dialog(
          backgroundColor: Colors.transparent,
          child: Container(
            width: 300,
            padding: const EdgeInsets.symmetric(vertical: 25, horizontal: 20),
            decoration: BoxDecoration(
              color: AppColors.primaryDarkColor,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.whiteColor, width: 1.5),
            ),
            child: const Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Booking Confirmed !',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: AppColors.whiteColor,
                    fontFamily: FontFamily.openSansMedium,
                    fontSize: 20,
                  ),
                ),
                SizedBox(height: 15),
                Text(
                  'Time : 8:00am - 8:30am',
                  style: TextStyle(
                    color: AppColors.whiteColor,
                    fontFamily: FontFamily.openSansRegular,
                    fontSize: 16,
                  ),
                ),
                SizedBox(height: 10),
                Text(
                  'Day : Wednesday',
                  style: TextStyle(
                    color: AppColors.whiteColor,
                    fontFamily: FontFamily.openSansRegular,
                    fontSize: 16,
                  ),
                ),
                SizedBox(height: 10),
                Text(
                  'Date : 11february 2025',
                  style: TextStyle(
                    color: AppColors.whiteColor,
                    fontFamily: FontFamily.openSansRegular,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
