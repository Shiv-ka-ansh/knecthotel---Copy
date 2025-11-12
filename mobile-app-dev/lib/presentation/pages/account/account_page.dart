import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_credit_card/flutter_credit_card.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/gen/assets.gen.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/pages/account/controller/account_page_controller.dart';
import 'package:knecthotel/presentation/widgets/common_textfield.dart';
import 'package:knecthotel/presentation/widgets/phone_number.dart';

class AccountPage extends GetView<AccountPageController> {
  const AccountPage({super.key});

  @override
  AccountPageController get controller => Get.put(AccountPageController());

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        child: Column(
          children: [
            Container(
              color: AppColors.scaffoldBg,
              padding: const EdgeInsets.symmetric(vertical: 5),
              child: _topBar(),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                _profileImage().paddingOnly(top: 10, bottom: 20),
                CommonTextfield(
                  isReadOnly: true,
                  suffix: IconButton(
                      onPressed: () {
                        _showEditFieldDialog(Strings.strFirstName,
                            controller.firstNameController);
                      },
                      icon: const Icon(
                        Icons.edit_outlined,
                        color: AppColors.primaryColor,
                      )),
                  controller: controller.firstNameController,
                  title: Strings.strFirstName,
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 15, vertical: 15),
                ).paddingOnly(bottom: 20),
                CommonTextfield(
                  isReadOnly: true,
                  suffix: IconButton(
                      onPressed: () {
                        _showEditFieldDialog(
                            Strings.strLastName, controller.lastNameController);
                      },
                      icon: const Icon(
                        Icons.edit_outlined,
                        color: AppColors.primaryColor,
                      )),
                  controller: controller.lastNameController,
                  title: Strings.strLastName,
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 15, vertical: 15),
                ).paddingOnly(bottom: 20),
                PhoneNumberWidget(
                  isReadOnly: true,
                  showLabel: true,
                  showBorder: false,
                  suffix: IconButton(
                      onPressed: () {
                        _showEditFieldDialog(
                          Strings.strPhoneNumber,
                          controller.phoneNumberController,
                          isPhoneNo: true,
                        );
                      },
                      icon: const Icon(
                        Icons.edit_outlined,
                        color: AppColors.primaryColor,
                      )),
                  fillColor: AppColors.textFieldBg,
                  dialCode: controller.countryCode,
                  labelText: Strings.strEnterYourPhoneNumber,
                  controller: controller.phoneNumberController,
                  countryCodeColor: AppColors.blackColor,
                ).paddingOnly(bottom: 20),
                CommonTextfield(
                  isReadOnly: true,
                  controller: controller.dobController,
                  title: Strings.strBirthDay,
                  suffix: IconButton(
                      onPressed: () async {
                        var date = await showDatePicker(
                          context: context,
                          lastDate: DateTime.now(),
                          firstDate: DateTime(1900),
                          builder: (context, child) => Theme(
                              data: ThemeData.light().copyWith(
                                  colorScheme: const ColorScheme.light()
                                      .copyWith(
                                          primary: AppColors.primaryColor)),
                              child: child!),
                        );
                        if (date != null) {
                          controller.dobController.text =
                              DateFormat("dd/MM/yyyy").format(date);
                        }
                      },
                      icon: const Icon(
                        Icons.edit_outlined,
                        color: AppColors.primaryColor,
                      )),
                ).paddingOnly(bottom: 20),
                CommonTextfield(
                  isReadOnly: true,
                  controller: controller.anniversaryController,
                  title: Strings.strAnniversary,
                  suffix: IconButton(
                      onPressed: () async {
                        var date = await showDatePicker(
                          context: context,
                          lastDate: DateTime.now(),
                          firstDate: DateTime(1900),
                          builder: (context, child) => Theme(
                              data: ThemeData.light().copyWith(
                                  colorScheme: const ColorScheme.light()
                                      .copyWith(
                                          primary: AppColors.primaryColor)),
                              child: child!),
                        );
                        if (date != null) {
                          controller.anniversaryController.text =
                              DateFormat("dd/MM/yyyy").format(date);
                        }
                      },
                      icon: const Icon(
                        Icons.edit_outlined,
                        color: AppColors.primaryColor,
                      )),
                ).paddingOnly(bottom: 20),
                _savedCardsSection().paddingOnly(bottom: 20),
                _verifyDocumentSection().paddingOnly(bottom: 20),
                _scanPassportSection().paddingOnly(bottom: 20),
                _messageSection().paddingOnly(bottom: 20),
              ],
            ).paddingAll(25),
          ],
        ),
      ),
    );
  }

  Stack _topBar() {
    return Stack(
      alignment: Alignment.center,
      children: [
        // Back Button (Left Aligned)
        Align(
          alignment: Alignment.centerLeft,
          child: IconButton(
            icon: const Icon(
              Icons.arrow_back,
              size: 25,
              color: AppColors.blackColor,
            ),
            onPressed: () {
              Get.back();
            },
          ),
        ),
        // Centered Title
        const Text(
          Strings.strAccount,
          style: TextStyle(
            fontSize: 22,
            color: AppColors.blackColor,
            fontFamily: FontFamily.openSansBold,
          ),
        ),
      ],
    );
  }

  Stack _profileImage() {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        // Profile Image with Border
        Obx(
          () => CircleAvatar(
            radius: 60, // Adjust size
            backgroundColor: Colors.green.shade200, // Outer Border Color
            child: CircleAvatar(
              radius: 58, // Inner Profile Image
              backgroundImage: controller.selectedProfileImage.value != null
                  ? FileImage(controller.selectedProfileImage.value!)
                  : AssetImage(Assets.images.placeholderProfile.path),
            ),
          ),
        ),

        // "Checked-in" Tag
        Positioned(
          top: -25,
          right: -35,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.green.shade100,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Text(
              "checked-in",
              style: TextStyle(color: Colors.green, fontSize: 16),
            ),
          ),
        ),

        // Plus (+) Icon
        Positioned(
          bottom: 2,
          right: 2,
          child: GestureDetector(
            onTap: () async {
              await controller.pickImageFromGallery();
            },
            child: Container(
              width: 25,
              height: 25,
              decoration: BoxDecoration(
                color: AppColors.primaryDarkColor,
                shape: BoxShape.rectangle,
                borderRadius: BorderRadius.circular(5),
              ),
              child: const Icon(
                Icons.add,
                color: Colors.white,
                size: 20,
              ),
            ),
          ),
        ),
      ],
    );
  }

  void _showEditFieldDialog(String label, TextEditingController textController,
      {bool isPhoneNo = false}) {
    TextEditingController nameController = TextEditingController();
    nameController.text = textController.text;

    Get.dialog(
      Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(15),
        ),
        child: Container(
          padding: const EdgeInsets.all(20),
          width: Get.width * 0.8,
          decoration: BoxDecoration(
            color: AppColors.primaryDarkColor, // Using your defined color
            borderRadius: BorderRadius.circular(15),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Edit $label",
                style: const TextStyle(
                  color: AppColors.whiteColor,
                  fontSize: 18,
                  fontFamily: FontFamily.openSansSemiBold,
                ),
              ),
              const SizedBox(height: 10),
              Container(
                height: 40,
                decoration: const BoxDecoration(
                  border: Border(
                      bottom:
                          BorderSide(color: AppColors.whiteColor, width: 1)),
                ),
                child: TextField(
                    controller: nameController,
                    style: const TextStyle(
                      color: AppColors.whiteColor,
                      fontFamily: FontFamily.openSansRegular,
                    ),
                    decoration: const InputDecoration(
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(horizontal: 5),
                    ),
                    keyboardType:
                        isPhoneNo ? TextInputType.number : TextInputType.name,
                    inputFormatters: isPhoneNo
                        ? [
                            FilteringTextInputFormatter.digitsOnly,
                            LengthLimitingTextInputFormatter(15),
                          ]
                        : []),
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  TextButton(
                    onPressed: () => Get.back(),
                    style: TextButton.styleFrom(
                      side: const BorderSide(color: AppColors.primaryColor),
                      foregroundColor: AppColors.whiteColor,
                    ),
                    child: const Text(
                      Strings.strCancel,
                      style: TextStyle(fontFamily: FontFamily.openSansMedium),
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      textController.text = nameController.text;
                      Get.back(); // Close dialog with result
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryColor,
                      foregroundColor: AppColors.whiteColor,
                    ),
                    child: const Text(
                      Strings.strSave,
                      style: TextStyle(fontFamily: FontFamily.openSansMedium),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _savedCardsSection() {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: AppColors.primaryDarkColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            Strings.strSavedCards,
            style: TextStyle(
              color: AppColors.whiteColor,
              fontSize: 20,
              fontFamily: FontFamily.openSansSemiBold,
            ),
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Assets.images.cardStack.image(width: 250),
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 10),
                    decoration: BoxDecoration(
                        color: AppColors.primaryColor,
                        borderRadius: BorderRadius.circular(8)),
                    child: const Text("+2",
                        style: TextStyle(
                          color: AppColors.whiteColor,
                          fontFamily: FontFamily.openSansBold,
                          fontSize: 18,
                        )),
                  ),
                  const SizedBox(
                    height: 30,
                  ),
                  InkWell(
                    onTap: () => _showSaveCardPopup(),
                    child: const Icon(
                      size: 30,
                      Icons.edit_outlined,
                      color: AppColors.whiteColor,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _verifyDocumentSection() {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: AppColors.primaryDarkColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            Strings.strVerifyDocument,
            style: TextStyle(
              color: AppColors.whiteColor,
              fontSize: 20,
              fontFamily: FontFamily.openSansBold,
            ),
          ),
          const SizedBox(height: 5),
          const Text(
            Strings.strQuickCheckout,
            style: TextStyle(
              color: AppColors.lightTextColor,
              fontSize: 14,
              fontFamily: FontFamily.openSansRegular,
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            Strings.strGovermentId,
            style: TextStyle(
              color: AppColors.whiteColor,
              fontSize: 16,
              fontFamily: FontFamily.openSansMedium,
            ),
          ),
          const SizedBox(height: 10),
          GestureDetector(
            onTap: () {
              _showVerifyIdDialog();
            },
            child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.textFieldBg,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Center(
                  child: Text(
                    Strings.strUploadGovermentId,
                    style: TextStyle(
                      color: AppColors.primaryColor,
                      fontSize: 16,
                      fontFamily: FontFamily.openSansRegular,
                    ),
                  ),
                )).paddingOnly(top: 10, bottom: 20),
          ),
        ],
      ),
    );
  }

  Widget _scanPassportSection() {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: AppColors.primaryDarkColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            Strings.strScanPassport,
            style: TextStyle(
              color: AppColors.whiteColor,
              fontSize: 20,
              fontFamily: FontFamily.openSansBold,
            ),
          ),
          const Text(
            Strings.strQuickCheckout,
            style: TextStyle(
              color: AppColors.lightTextColor,
              fontSize: 14,
              fontFamily: FontFamily.openSansRegular,
            ),
          ),
          const SizedBox(height: 25),
          GestureDetector(
            onTap: () async {
              await controller.pickImageFromCamera();
            },
            child: Center(
              child: Assets.images.camScan.image(width: 120, height: 120),
            ),
          ).paddingOnly(bottom: 10),
        ],
      ),
    );
  }

  Widget _messageSection() {
    return Stack(
      children: [
        ClipPath(
          clipper: MessageClipper(),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.textFieldBg,
              border: Border.all(color: AppColors.whiteColor, width: 1.5),
              borderRadius: BorderRadius.circular(20),
            ),
            child: TextField(
              maxLines: 4,
              controller: controller.messageController,
              style: const TextStyle(
                fontFamily: FontFamily.openSansRegular,
                fontSize: 16,
                color: AppColors.blackColor,
              ),
              decoration: const InputDecoration(
                hintText: Strings.strMessageHint,
                hintStyle: TextStyle(
                  fontFamily: FontFamily.openSansRegular,
                  color: Colors.grey,
                  fontSize: 16,
                ),
                border: InputBorder.none,
              ),
            ),
          ),
        ),
        Positioned(
          bottom: 4,
          right: 4,
          child: GestureDetector(
            onTap: () {
              _showBookingDetailsDialog();
            },
            child: Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.primaryDarkColor,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(
                Icons.send,
                color: Colors.white,
                size: 20,
              ),
            ),
          ),
        ),
      ],
    );
  }

  void _showBookingDetailsDialog() {
    Get.dialog(
      Dialog(
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: AppColors.whiteColor, width: 1.5)),
        backgroundColor: AppColors.primaryDarkColor,
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Phone Number
              const Text(
                "0100234517",
                style: TextStyle(
                  fontFamily: FontFamily.openSansBold,
                  fontSize: 16,
                  color: AppColors.whiteColor,
                ),
              ),
              const SizedBox(height: 12),

              // Details Section
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _bookingDetailRow("Hotel name", "Village in (Jaipur)"),
                  _bookingDetailRow("Check-in time", "11:00am"),
                  _bookingDetailRow("Assigned room", "502 (deluxe)"),
                  _bookingDetailRow("Arrival time", "2:00 pm"),
                ],
              ),

              const SizedBox(height: 20),

              // OK Button
              SizedBox(
                width: 70,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryColor,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                  ),
                  onPressed: () => Get.back(),
                  child: const Text(
                    Strings.strOk,
                    style: TextStyle(
                      fontFamily: FontFamily.openSansMedium,
                      fontSize: 14,
                      color: AppColors.whiteColor,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showSaveCardPopup() {
    Get.dialog(
      Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: Colors.white30, width: 1.5),
        ),
        backgroundColor: AppColors.primaryColor,
        child: Padding(
          padding: const EdgeInsets.all(20),
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
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  TextButton(
                    onPressed: () => Get.back(),
                    style: TextButton.styleFrom(
                      side: const BorderSide(color: AppColors.primaryDarkColor),
                      foregroundColor: AppColors.whiteColor,
                    ),
                    child: const Text(
                      Strings.strCancel,
                      style: TextStyle(fontFamily: FontFamily.openSansMedium),
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      Get.back();
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryDarkColor,
                      foregroundColor: AppColors.whiteColor,
                    ),
                    child: const Text(
                      Strings.strSave,
                      style: TextStyle(fontFamily: FontFamily.openSansMedium),
                    ),
                  ),
                ],
              )
            ],
          ),
        ),
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

  void _showVerifyIdDialog() {
    // Define controllers and focus nodes for each input field
    final controllers = List.generate(3, (index) => TextEditingController());
    final focusNodes = List.generate(3, (index) => FocusNode());

    Get.dialog(
      Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: Colors.white30, width: 1.5),
        ),
        backgroundColor: AppColors.primaryColor,
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Title
              const Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  Strings.strEnterIdNo,
                  style: TextStyle(
                    fontFamily: FontFamily.openSansBold,
                    fontSize: 16,
                    color: AppColors.whiteColor,
                  ),
                ),
              ),
              const SizedBox(height: 12),

              // ID Number Fields with Auto-Jump
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: List.generate(3, (index) {
                  return _idInputField(
                    textController: controllers[index],
                    focusNode: focusNodes[index],
                    nextFocusNode: index < 2 ? focusNodes[index + 1] : null,
                  );
                }),
              ),
              const SizedBox(height: 20),

              // Camera Icon
              Assets.images.camScan
                  .image(width: 100, height: 100)
                  .paddingSymmetric(vertical: 8),
              const SizedBox(height: 20),

              // Verify Button
              SizedBox(
                width: 80,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryDarkColor,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                  ),
                  onPressed: () => Get.back(),
                  child: const Text(
                    Strings.strVerify,
                    style: TextStyle(
                      fontFamily: FontFamily.openSansMedium,
                      fontSize: 14,
                      color: AppColors.whiteColor,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

// Helper function to create ID input field
  Widget _idInputField({
    required TextEditingController textController,
    required FocusNode focusNode,
    FocusNode? nextFocusNode,
  }) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        padding: const EdgeInsets.symmetric(horizontal: 10),
        decoration: BoxDecoration(
          color: AppColors.textFieldBg,
          borderRadius: BorderRadius.circular(10),
        ),
        child: TextField(
          maxLength: controller.pinLength,
          textAlign: TextAlign.center,
          keyboardType: TextInputType.number,
          controller: textController,
          focusNode: focusNode,
          onChanged: (value) {
            if (value.length == controller.pinLength) {
              if (nextFocusNode != null) {
                FocusScope.of(Get.context!).requestFocus(nextFocusNode);
              } else {
                focusNode.unfocus(); // Hide keyboard on last field
              }
            }
          },
          style: const TextStyle(
            fontFamily: FontFamily.openSansMedium,
            fontSize: 16,
            color: AppColors.blackColor,
          ),
          decoration: const InputDecoration(
            counterText: "",
            border: InputBorder.none,
            hintText: "0000",
            hintStyle: TextStyle(
              fontFamily: FontFamily.openSansRegular,
              color: AppColors.lightTextColor,
              fontSize: 16,
            ),
          ),
        ),
      ),
    );
  }

// Helper function to create rows
  Widget _bookingDetailRow(String title, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontFamily: FontFamily.openSansRegular,
              fontSize: 14,
              color: AppColors.whiteColor,
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              fontFamily: FontFamily.openSansMedium,
              fontSize: 14,
              color: AppColors.whiteColor,
            ),
          ),
        ],
      ),
    );
  }
}

// Custom Clipper for Cutout Effect
class MessageClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    Path path = Path()
      ..addRRect(RRect.fromRectAndRadius(
          Rect.fromLTWH(0, 0, size.width, size.height),
          const Radius.circular(20)))
      ..addRRect(RRect.fromRectAndRadius(
          Rect.fromLTWH(size.width - 50, size.height - 50, 50, 50),
          const Radius.circular(8))); // Rounded square cutout

    return path..fillType = PathFillType.evenOdd;
  }

  @override
  bool shouldReclip(CustomClipper<Path> oldClipper) => true;
}
