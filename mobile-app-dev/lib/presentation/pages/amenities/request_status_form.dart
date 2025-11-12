import 'package:flutter/material.dart';
import 'package:flutter_dash/flutter_dash.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/config/app_colors.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/gen/fonts.gen.dart';
import 'package:knecthotel/presentation/widgets/common_button.dart';
import 'package:knecthotel/presentation/widgets/common_textfield.dart';
import 'controller/request_status_controller.dart';

class RequestStatusForm extends GetView<RequestStatusController> {
  const RequestStatusForm({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: AppBar(
        backgroundColor: AppColors.transparentColor,
        title: Text(
          controller.data['from'] == RouteConst.receptionRequestFormPage
              ? Strings.strReceptionRequestForm
              : Strings.strBookingStatus,
          style: const TextStyle(
            color: AppColors.blackColor,
            fontFamily: FontFamily.openSansBold,
          ),
        ),
        centerTitle: true,
        elevation: 0,
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.fromLTRB(25, 0, 25, 30),
        child: Obx(
          () => CommonButton(
            onPress: () {},
            text: controller.selectedProgress.value ==
                    Strings.lstProgressStatus[0]
                ? Strings.strDone
                : Strings.strSubmitResponse,
          ),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Theme(
              data: ThemeData.light().copyWith(
                dividerColor: AppColors.transparentColor,
              ),
              child: ExpansionTile(
                initiallyExpanded: true,
                tilePadding: EdgeInsets.zero,
                controller: controller.progressStatusController,
                enabled: false,
                showTrailingIcon: false,
                title: _buildRequestCard(),
                children: [
                  Obx(
                    () => Column(
                      children: [
                        controller.selectedProgress.value ==
                                Strings.lstProgressStatus[0]
                            ? CommonTextfield(
                                isReadOnly: true,
                                controller: controller.descriptionController,
                                hintText:
                                    "${controller.requestTxt.value} ${Strings.strShortDescription}",
                                maxLines: 4,
                              )
                            : _feedbackSection(),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            _buildPastRequests(context).paddingOnly(top: 20),
          ],
        ).paddingAll(25),
      ),
    );
  }

  Widget _buildRequestCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.textFieldBg,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("RD012345",
                  style: TextStyle(
                    fontFamily: FontFamily.openSansBold,
                    fontSize: 16,
                  )),
              Obx(
                () => Text(controller.requestTxt.value,
                    style: const TextStyle(
                      fontFamily: FontFamily.openSansRegular,
                      fontSize: 14,
                      color: AppColors.blackColor,
                    )),
              ),
              const SizedBox(height: 8),
              const Text("Room Number- 502",
                  style: TextStyle(
                    fontFamily: FontFamily.openSansMedium,
                    color: Colors.black45,
                    fontSize: 14,
                  )),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              const Text("10 Jan 2025",
                  style: TextStyle(
                    fontFamily: FontFamily.openSansRegular,
                    fontSize: 12,
                    color: AppColors.blackColor,
                  )),
              const Text("11:00AM",
                  style: TextStyle(
                    fontFamily: FontFamily.openSansRegular,
                    fontSize: 12,
                    color: Colors.black45,
                  )),
              const SizedBox(height: 8),
              Obx(
                () => Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Text(
                      controller.selectedProgress.value,
                      style: TextStyle(
                        fontFamily: FontFamily.openSansRegular,
                        color: controller.selectedProgress.value ==
                                Strings.lstProgressStatus[0]
                            ? AppColors.successColor
                            : AppColors.errorColor,
                        fontSize: 14,
                      ),
                    ).paddingOnly(right: 4),
                    GestureDetector(
                      onTap: () {
                        if (controller.progressStatusController.isExpanded) {
                          controller.progressStatusController.collapse();
                        } else {
                          controller.progressStatusController.expand();
                        }
                      },
                      child: const Icon(
                        Icons.keyboard_arrow_down_outlined,
                      ),
                    ),
                  ],
                ),
              )
            ],
          ),
        ],
      ),
    );
  }

  Widget _feedbackSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 300,
          child: CommonTextfield(
            controller: controller.feedbackController,
            title: Strings.strEssentialFeedback,
            maxLines: 2,
          ),
        ),
        const SizedBox(height: 20),
        Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Rate our Service",
              style: TextStyle(
                fontSize: 18,
                fontFamily: FontFamily.openSansMedium,
              ),
            ),
            const SizedBox(height: 10),
            Obx(
              () => Row(
                children: List.generate(5, (index) {
                  return GestureDetector(
                    onTap: () {
                      controller.selectedRating.value = index + 1;
                    },
                    child: Column(
                      children: [
                        Icon(
                            index < controller.selectedRating.value
                                ? Icons.star
                                : Icons.star_border_outlined,
                            size: 40,
                            color: AppColors.primaryDarkColor
                            // Highlight selected stars
                            ),
                        Text(
                          Strings.lstRatings[index],
                          textAlign: TextAlign.end,
                          style: const TextStyle(
                            fontSize: 14,
                            fontFamily: FontFamily.openSansRegular,
                          ),
                        )
                      ],
                    ).paddingOnly(right: 10),
                  );
                }),
              ),
            ),
          ],
        )
      ],
    );
  }

  Widget _buildPastRequests(context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Dash(
          direction: Axis.horizontal,
          length: MediaQuery.of(context).size.width - 50,
          dashLength: 2,
          dashColor: Colors.grey,
        ).paddingSymmetric(vertical: 10),
        const Text(
          Strings.strPastRequests,
          style: TextStyle(
            fontFamily: FontFamily.openSansMedium,
            color: Colors.black45,
            fontSize: 16,
          ),
        ),
        const SizedBox(height: 8),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: controller.pastRequests.length + 1,
          itemBuilder: (context, index) {
            if (index == controller.pastRequests.length) {
              return Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  IconButton(
                    icon: const Icon(
                      Icons.add,
                      size: 25,
                      color: AppColors.primaryDarkColor,
                    ),
                    onPressed: () {
                      switch (controller.data['from']) {
                        case RouteConst.receptionRequestFormPage:
                          Get.offAndToNamed(
                              RouteConst.receptionRequestFormPage);
                          break;
                        case RouteConst.inRoomControlForm:
                          Get.offAndToNamed(RouteConst.inRoomControlForm);
                          break;
                        case RouteConst.swimmingPoolPage:
                          Get.offAndToNamed(
                            RouteConst.swimmingPoolPage,
                          );
                          break;
                        default:
                          Get.back();
                          break;
                      }
                    },
                  ),
                ],
              );
            }
            final request = controller.pastRequests[index];
            return _buildPastRequestCard(request);
          },
        ),
      ],
    );
  }

  Widget _buildPastRequestCard(request) {
    var isExpanded = false.obs;
    return Obx(() => Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.grey.shade300,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        request['id']?.toString() ?? "",
                        style: const TextStyle(
                          fontFamily: FontFamily.openSansBold,
                          fontSize: 16,
                        ),
                      ),
                      Text(
                        request['type']?.toString() ?? "",
                        style: const TextStyle(
                          fontFamily: FontFamily.openSansRegular,
                          fontSize: 14,
                          color: AppColors.blackColor,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        request['room']?.toString() ?? "",
                        style: const TextStyle(
                          fontFamily: FontFamily.openSansMedium,
                          color: AppColors.lightTextColor,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        request['date']?.toString() ?? "",
                        style: const TextStyle(
                          fontFamily: FontFamily.openSansRegular,
                          fontSize: 12,
                          color: AppColors.blackColor,
                        ),
                      ),
                      Text(
                        request['time']?.toString() ?? "",
                        style: const TextStyle(
                          fontFamily: FontFamily.openSansRegular,
                          fontSize: 12,
                          color: AppColors.lightTextColor,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Text(
                            request['status']?.toString() ?? "",
                            style: const TextStyle(
                              fontFamily: FontFamily.openSansMedium,
                              fontSize: 14,
                              color: AppColors.blackColor,
                            ),
                          ),
                          const SizedBox(width: 4),
                          GestureDetector(
                            onTap: () {
                              isExpanded.value = !isExpanded.value;
                            },
                            child: Icon(
                              isExpanded.value
                                  ? Icons.keyboard_arrow_up_outlined
                                  : Icons.keyboard_arrow_down_outlined,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
              if (isExpanded.value)
                Container(
                  width: double.infinity,
                  margin: const EdgeInsets.only(top: 8),
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppColors.textFieldBg,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    request['description']?.toString() ?? "No description",
                    maxLines: 4,
                    style: const TextStyle(
                      fontFamily: FontFamily.openSansMedium,
                      color: Colors.black45,
                      fontSize: 16,
                    ),
                  ),
                ),
            ],
          ),
        ));
  }
}
