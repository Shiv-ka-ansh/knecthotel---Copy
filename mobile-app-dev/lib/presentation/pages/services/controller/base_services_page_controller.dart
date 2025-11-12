import 'package:get/get.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/data/model/amenities.dart';
import 'package:knecthotel/gen/assets.gen.dart';

class BaseServicesPageController extends GetxController {
  final RxInt selectedIndex = (-1).obs;
  final RxMap<String, dynamic> data = <String, dynamic>{}.obs;
  List<Amenities> amenities = [
    Amenities(
      icon: Assets.images.icReception,
      name: Strings.strReception,
      onClick: () => Get.toNamed(RouteConst.receptionRequestFormPage),
    ),
    Amenities(
        icon: Assets.images.icFood,
        name: Strings.strInRoomDining,
        onClick: () => Get.toNamed(RouteConst.foodServicesPage)),
    Amenities(
      icon: Assets.images.icHouseKeeping,
      name: Strings.strHousekeeping,
      onClick: () => Get.toNamed(RouteConst.extendedServicePage, arguments: {
        'name': Strings.strHousekeepingService,
      }),
    ),
    Amenities(
      icon: Assets.images.icGym,
      name: Strings.strGym,
      onClick: () => Get.toNamed(RouteConst.gymPage),
    ),
    Amenities(
      icon: Assets.images.icSpa,
      name: Strings.strSpa,
      onClick: () => Get.toNamed(RouteConst.spaPage),
    ),
    Amenities(
      icon: Assets.images.icSwimmingPool,
      name: Strings.strSwimmingPool,
      onClick: () => Get.toNamed(RouteConst.swimmingPoolPage),
    ),
    Amenities(
      icon: Assets.images.icConcierge,
      name: Strings.strConciergeService,
      onClick: () => Get.toNamed(RouteConst.extendedServicePage,
          arguments: {'name': Strings.strConciergeService}),
    ),
    Amenities(
      icon: Assets.images.icRoomControls,
      name: Strings.strInRoomControls,
      onClick: () => Get.toNamed(RouteConst.inRoomControlForm),
    ),
    Amenities(
      icon: Assets.images.icConferenceHall,
      name: Strings.strConferenceHall,
      onClick: () => Get.toNamed(RouteConst.selectDateTimePage, arguments: {
        'from': RouteConst.extendedServicePage,
        'name': Strings.strConferenceHall,
        'image': Assets.images.conferenceHall.path,
      }),
    ),
    Amenities(
      icon: Assets.images.icCommunityHall,
      name: Strings.strCommunityHall,
      onClick: () => Get.toNamed(RouteConst.selectDateTimePage, arguments: {
        'from': RouteConst.extendedServicePage,
        'name': Strings.strCommunityHall,
        'image': Assets.images.comunityHall.path,
      }),
    ),
  ];

  @override
  void onInit() {
    // Retrieve full data from Get.arguments
    if (Get.arguments != null && Get.arguments is Map<String, dynamic>) {
      data.assignAll(Get.arguments);
    }

    super.onInit();
  }
}
