import 'package:flutter/material.dart';
import 'package:flutter_dash/flutter_dash.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/pages/amenities/controller/spa_salon_page_controller.dart';
import 'package:knecthotel/presentation/widgets/common_dropdown.dart';
import 'package:knecthotel/presentation/widgets/common_textfield.dart';

class SpaSalonPage extends GetView<SpaSalonPageController> {
  const SpaSalonPage({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: controller.tabController.length,
      child: Scaffold(
        backgroundColor: AppColors.scaffoldBg,
        appBar: AppBar(
          backgroundColor: AppColors.transparentColor,
          title: const Text(
            Strings.strSpaSalon,
            style: TextStyle(
              color: AppColors.blackColor,
              fontFamily: FontFamily.openSansBold,
            ),
          ),
          centerTitle: true,
          elevation: 0,
        ),
        floatingActionButton: Obx(
          () => controller.selectedIndex.value == 0
              ? Builder(
                  builder: (context) {
                    return InkWell(
                      onTap: () {
                        controller.isMenuOpen.value = true;
                        _showMenu(context).then((_) {
                          controller.isMenuOpen.value =
                              false; // Reset when menu closes
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppColors.primaryColor,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          controller.isMenuOpen.value ? 'Close' : 'Browse',
                          style: const TextStyle(
                              color: AppColors.whiteColor,
                              fontFamily: FontFamily.openSansBold),
                        ),
                      ),
                    );
                  },
                )
              : const SizedBox(),
        ),
        body: Column(
          children: [
            TabBar(
              isScrollable: true,
              controller: controller.tabController,
              labelColor: AppColors.blackColor,
              dividerColor: AppColors.transparentColor,
              indicatorColor: AppColors.primaryDarkColor,
              indicatorWeight: 0.2,
              tabs: [
                Obx(
                  () => Text(
                    Strings.strBrowserServices,
                    style: TextStyle(
                      fontFamily: FontFamily.openSansMedium,
                      fontSize: 15,
                      color: controller.selectedIndex.value == 0
                          ? AppColors.blackColor
                          : AppColors.unSelectedColor,
                    ),
                  ).paddingAll(4),
                ),
                Obx(
                  () => Text(
                    Strings.strBookAppoinment,
                    style: TextStyle(
                      fontFamily: FontFamily.openSansMedium,
                      fontSize: 15,
                      color: controller.selectedIndex.value == 1
                          ? AppColors.blackColor
                          : AppColors.unSelectedColor,
                    ),
                  ).paddingAll(4),
                )
              ],
            ).paddingOnly(bottom: 30),
            Expanded(
              child: TabBarView(
                controller: controller.tabController,
                children: [_tabOne(), _tabTwo(context)],
              ),
            ),
          ],
        ).paddingSymmetric(horizontal: 25),
      ),
    );
  }

  Widget _tabOne() {
    return SingleChildScrollView(
      child: Column(
        children: [buildServiceListView()],
      ),
    );
  }

  Widget _tabTwo(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CommonDropdown(
            title: Strings.strSelectType,
            items: Strings.lstSpaServiceType,
            hint: '',
            selectedOption: controller.selectedServiceType,
          ).paddingOnly(bottom: 20),
          CommonDropdown(
            title: Strings.strSelectType,
            items: switch (controller.selectedServiceType.value) {
              "Massage" => Strings.lstMassageType,
              "Facial" => Strings.lstFacialType,
              "Body Treatments" => Strings.lstBodyTreatmentsType,
              "Salon Services" => Strings.lstSalonServiceType,
              "Couple offers" => Strings.lstCoupleOffersType,
              _ => [],
            },
            hint: '',
            selectedOption: controller.selectedSubServiceType,
          ).paddingOnly(bottom: 20),
          CommonTextfield(
            title: Strings.strTypeShortDescription,
            controller: controller.descriptionController,
            maxLines: 3,
          ).paddingOnly(bottom: 20),
          Dash(
            direction: Axis.horizontal,
            length: (MediaQuery.of(context).size.width - 50),
            dashLength: 2,
            dashColor: Colors.grey,
          ).paddingSymmetric(vertical: 10),
          CommonTextfield(
            isReadOnly: true,
            controller: controller.dateController,
            hintText: Strings.strSelectDate,
            suffix: const Icon(Icons.calendar_month_outlined),
            onTap: () async {
              var date = await showDatePicker(
                context: context,
                lastDate: DateTime.now().add(const Duration(days: 10)),
                firstDate: DateTime(1900),
                builder: (context, child) => Theme(
                  data: ThemeData.light().copyWith(
                    colorScheme: const ColorScheme.light().copyWith(
                      primary: AppColors.primaryColor,
                    ),
                  ),
                  child: child!,
                ),
              );
              if (date != null) {
                controller.dateController.text =
                    DateFormat("dd/MM/yyyy").format(date);
              }
            },
          ).paddingOnly(bottom: 20),
          CommonTextfield(
            isReadOnly: true,
            controller: controller.timeController,
            hintText: Strings.strSelectTime,
            suffix: const Icon(Icons.access_time),
            onTap: () async {
              var time = await showTimePicker(
                initialTime: TimeOfDay.now(),
                context: context,
                builder: (context, child) => Theme(
                  data: ThemeData.light().copyWith(
                    colorScheme: const ColorScheme.light().copyWith(
                      primary: AppColors.primaryColor,
                    ),
                  ),
                  child: child!,
                ),
              );
              if (time != null) {
                controller.timeController.text = time.format(context);
              }
            },
          ).paddingOnly(bottom: 20),
          Dash(
            direction: Axis.horizontal,
            length: (MediaQuery.of(context).size.width - 50),
            dashLength: 2,
            dashColor: Colors.grey,
          ).paddingSymmetric(vertical: 10),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 2),
            child: Text(
              Strings.strAvilableSlots,
              style: TextStyle(
                fontSize: 16,
                fontFamily: FontFamily.openSansMedium,
                color: AppColors.blackColor,
              ),
            ),
          ),
          const SizedBox(height: 10),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: controller.availableSlots.length,
            itemBuilder: (context, index) {
              return _buildSlotItem(controller.availableSlots[index]);
            },
          ),
        ],
      ).paddingOnly(top: 15, bottom: 55),
    );
  }

  Widget buildServiceListView() {
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: controller.services.length,
      itemBuilder: (context, index) {
        var category = controller.services[index];
        return buildServiceCategory(
            context, category["category"], category["items"]);
      },
    );
  }

  Widget buildServiceCategory(
      context, String category, List<Map<String, dynamic>> items) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Text(
            category,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.grey,
            ),
          ),
        ),
        Column(
          children: items.map((service) => buildServiceTile(service)).toList(),
        ),
        Dash(
          direction: Axis.horizontal,
          length: (MediaQuery.of(context).size.width - 50),
          dashLength: 2,
          dashColor: Colors.grey,
        ).paddingSymmetric(vertical: 10),
      ],
    );
  }

  Widget _buildSlotItem(Map<String, dynamic> slot) {
    bool isAvailable = slot["isAvailable"];
    bool isLimited = slot.containsKey("isLimited") ? slot["isLimited"] : false;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 2),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Container(
            decoration: BoxDecoration(
              color: isAvailable ? AppColors.textFieldBg : AppColors.cardColor,
              borderRadius: BorderRadius.circular(12),
              boxShadow: const [
                BoxShadow(
                  color: Colors.black26,
                  blurRadius: 4,
                  spreadRadius: 1,
                ),
              ],
            ),
            child: ListTile(
              title: Text(
                slot["time"],
                style: const TextStyle(
                  color: AppColors.blackColor,
                  fontFamily: FontFamily.openSansRegular,
                  fontSize: 14,
                ),
              ),
              trailing: ElevatedButton(
                onPressed: isAvailable
                    ? () {
                        Get.toNamed(RouteConst.bookSlotPage, arguments: {
                          'from': RouteConst.spaPage,
                          'time': slot['time'],
                          'requestType': controller.selectedServiceType,
                        });
                      }
                    : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryColor,
                  visualDensity: VisualDensity.compact,
                  disabledBackgroundColor: Colors.grey.shade600,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                ),
                child: const Text(
                  Strings.strBookSlot,
                  style: TextStyle(
                    color: AppColors.whiteColor,
                    fontFamily: FontFamily.openSansRegular,
                    fontSize: 14,
                  ),
                ),
              ),
            ),
          ),
          !isAvailable
              ? const Text(
                  Strings.strSlotNotAvailable,
                  style: TextStyle(
                    fontFamily: FontFamily.openSansMedium,
                    fontSize: 12,
                    color: AppColors.errorColor,
                  ),
                ).paddingOnly(right: 5, top: 2)
              : const SizedBox(),
          isLimited
              ? const Text(
                  Strings.strOnlyOneSlotRemaining,
                  style: TextStyle(
                    fontFamily: FontFamily.openSansMedium,
                    fontSize: 12,
                    color: AppColors.errorColor,
                  ),
                ).paddingOnly(right: 5, top: 2)
              : const SizedBox(),
        ],
      ),
    );
  }

  Widget buildServiceTile(Map<String, dynamic> service) {
    return Theme(
      data: ThemeData.light().copyWith(
        dividerColor: AppColors.transparentColor,
      ),
      child: ExpansionTile(
        visualDensity: VisualDensity.compact,
        tilePadding: EdgeInsets.zero,
        showTrailingIcon: false,
        title: ListTile(
          contentPadding: EdgeInsets.zero,
          leading: ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: (service["image"] as Image),
          ),
          title: Text(service["title"],
              style: const TextStyle(
                  fontSize: 16, fontFamily: FontFamily.openSansSemiBold)),
          subtitle: Row(
            children: [
              Text(
                service["price"],
                style: const TextStyle(
                    fontFamily: FontFamily.openSansRegular,
                    color: Colors.black45),
              ),
              const Icon(Icons.keyboard_arrow_down).paddingOnly(left: 5)
            ],
          ),
        ),
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.textFieldBg,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Center(
              child: Text(
                service["description"],
                style: const TextStyle(
                  fontFamily: FontFamily.openSansRegular,
                  fontSize: 12,
                  color: AppColors.blackColor,
                ),
              ),
            ),
          )
        ],
      ),
    );
  }

  _showMenu(BuildContext context) async {
    final RenderBox button = context.findRenderObject() as RenderBox;
    final RenderBox overlay =
        Overlay.of(context).context.findRenderObject() as RenderBox;

    final Offset buttonPosition =
        button.localToGlobal(Offset.zero, ancestor: overlay);
    final Size buttonSize = button.size;
    final Size overlaySize = overlay.size;

    final RelativeRect position = RelativeRect.fromLTRB(
      buttonPosition.dx, // Align to FAB
      buttonPosition.dy - (buttonSize.height * 6.5), // Place above FAB
      overlaySize.width - buttonPosition.dx - buttonSize.width, // Right align
      buttonPosition.dy, // Ensures menu appears above FAB
    );

    return await showMenu(
      context: context,
      position: position,
      color: AppColors.primaryColor,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      items: [
        _buildMenuItem("Massage"),
        _buildMenuItem("Facial"),
        _buildMenuItem("Body Treatments"),
        _buildMenuItem("Salon Services"),
        _buildMenuItem("Couple Offers"),
      ],
    );
  }

  PopupMenuEntry<dynamic> _buildMenuItem(String title) {
    return PopupMenuItem(
      child: Text(
        title,
        style: const TextStyle(color: Colors.white, fontSize: 16),
      ),
    );
  }
}
