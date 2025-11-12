import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/widgets/common_button.dart';
import 'package:knecthotel/presentation/widgets/common_textfield.dart';
import 'controller/concierge_service_form_controller.dart';

class ConciergeServiceForm extends GetView<ConciergeServiceFormController> {
  const ConciergeServiceForm({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: AppBar(
        backgroundColor: AppColors.transparentColor,
        title: const Text(
          Strings.strConciergeServiceForm,
          style: TextStyle(
            color: AppColors.blackColor,
            fontFamily: FontFamily.openSansBold,
          ),
        ),
        centerTitle: true,
        elevation: 0,
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.symmetric(vertical: 25, horizontal: 20),
        child: CommonButton(
          onPress: () {
            Get.toNamed(RouteConst.paymentPage, arguments: {
              'from': RouteConst.conciergeServiceForm,
              'name': controller.data['visitingPlace'],
            });
          },
          text: Strings.strBook,
        ),
      ),
      body: Column(
        children: [
          CommonTextfield(
            controller: controller.visitingPlaceController,
            title: Strings.strVisitingPlace,
            isReadOnly: true,
          ).paddingOnly(bottom: 20),
          _buildServiceType(),
        ],
      ).paddingAll(20),
    );
  }

  Widget _buildCheckboxRow(String label, RxBool isChecked) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        children: [
          Expanded(
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 16,
                fontFamily: FontFamily.openSansMedium,
                color: Colors.black87,
              ),
            ),
          ),
          Obx(
            () => Checkbox(
              value: isChecked.value,
              onChanged: (value) {
                isChecked.value = value ?? false;
              },
              visualDensity: VisualDensity.compact,
              activeColor: AppColors.primaryDarkColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildServiceType() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.only(bottom: 8.0),
          child: Text(
            Strings.strServiceType,
            style: TextStyle(
              fontSize: 16,
              color: AppColors.blackColor,
              fontFamily: FontFamily.openSansBold,
            ),
          ),
        ),
        _buildCheckboxRow(
          Strings.strTouristAttraction,
          controller.touristAttractionSelected,
        ),
        _buildCheckboxRow(
          Strings.strEntertainment,
          controller.entertainmentSelected,
        ),
        _buildCheckboxRow(
          Strings.strNearbyRestaurants,
          controller.nearbyRestaurantsSelected,
        ),
      ],
    );
  }
}
