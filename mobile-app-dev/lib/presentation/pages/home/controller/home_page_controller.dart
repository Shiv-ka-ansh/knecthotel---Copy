import 'package:get/get.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/data/model/amenities.dart';
import 'package:knecthotel/gen/assets.gen.dart';

class HomePageController extends GetxController {
  List<Amenities> amenities = [
    Amenities(
      icon: Assets.images.icWifi,
      name: 'Wi-Fi',
      onClick: () => Get.toNamed(RouteConst.wifiPage),
    ),
    // Amenities(
    //   icon: Assets.images.icReception,
    //   name: 'Reception',
    //   onClick: () => Get.toNamed(RouteConst.receptionRequestFormPage),
    // ),
    Amenities(
        icon: Assets.images.icFood,
        name: 'In-room Dining',
        onClick: () => Get.toNamed(RouteConst.foodServicesPage)),
    // Amenities(
    //     icon: Assets.images.icBar,
    //     name: 'Bar',
    //     onClick: () => Get.toNamed(RouteConst.conciergePage)),
    Amenities(
      icon: Assets.images.icHouseKeeping,
      name: 'House Keeping',
      onClick: () => Get.toNamed(RouteConst.extendedServicePage, arguments: {
        'name': 'Housekeeping Service',
      }),
    ),
    // Amenities(
    //   icon: Assets.images.icGym,
    //   name: 'Gym',
    //   onClick: () => Get.toNamed(RouteConst.gymPage),
    // ),
    // Amenities(
    //   icon: Assets.images.icSpa,
    //   name: 'Spa',
    //   onClick: () => Get.toNamed(RouteConst.spaPage),
    // ),
    // Amenities(
    //   icon: Assets.images.icSwimmingPool,
    //   name: 'Swimming Pool',
    //   onClick: () => Get.toNamed(RouteConst.swimmingPoolPage),
    // ),
    // Amenities(
    //   icon: Assets.images.icConcierge,
    //   name: 'Concierge service',
    //   onClick: () => Get.toNamed(RouteConst.conciergePage),
    // ),
    // Amenities(
    //   icon: Assets.images.icRoomControls,
    //   name: 'In-room controls',
    //   onClick: () => Get.toNamed(RouteConst.inRoomControlForm),
    // ),
    // Amenities(
    //     icon: Assets.images.icOrder,
    //     name: 'Order Management',
    //     onClick: () => Logger.prints('Order Management clicked')),
    // Amenities(
    //     icon: Assets.images.icWallet,
    //     name: 'Payment Management',
    //     onClick: () => Logger.prints('Payment Management clicked')),
  ];
  List<Map<String, String>> reviews = [
    {"name": "Shivani", "review": "Lorem ipsum dolor sit amet."},
    {"name": "Muskan", "review": "Lorem ipsum dolor sit amet."},
    {"name": "Rahul", "review": "Amazing place to visit!"},
    {"name": "Amit", "review": "Great service and food."},
  ];
}
