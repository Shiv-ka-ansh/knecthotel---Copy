import 'package:get/get.dart';
import 'package:knecthotel/app/config/strings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/data/model/service.dart';
import 'package:knecthotel/gen/assets.gen.dart';

class ExtendedServicePageController extends GetxController {
  final RxMap<String, dynamic> data = <String, dynamic>{}.obs;
  final RxInt selectedIndex = (-1).obs;
  final RxList<Service> services = <Service>[].obs;

  @override
  void onInit() {
    data.value = Get.arguments ?? {};
    switch (data['name']?.toString()) {
      case Strings.strConciergeService:
        services.assignAll([
          Service(
            img: Assets.images.taxiImg,
            name: Strings.strTaxiCabService,
            description: 'Book Cab excrusion',
            onClick: () {
              Get.toNamed(
                RouteConst.selectDateTimePage,
                arguments: {
                  'name': Strings.strTaxiCabService,
                },
              );
            },
          ),
          Service(
            img: Assets.images.touristAttractionImg,
            name: Strings.strNearbyAttraction,
            description: 'Visit nearby attractions',
            onClick: () {
              Get.toNamed(RouteConst.conciergePage, arguments: {
                'name': Strings.strConciergeService,
              });
            },
          ),
        ]);
        break;

      case Strings.strHousekeepingService:
        services.assignAll([
          Service(
            img: Assets.images.wholeRoomCleaning,
            name: Strings.strWholeRoomCleaning,
            description: 'Cleaning of whole room and Bedding',
            onClick: () {
              Get.toNamed(RouteConst.cleaningCheckoutPage, arguments: {
                'name': Strings.strWholeRoomCleaning,
                'image': Assets.images.wholeRoomCleaning.path,
              });
            },
          ),
          Service(
            img: Assets.images.partialCleaning,
            name: Strings.strPartialCleaning,
            description: 'Cleaning & Bathroom Sweeping',
            onClick: () {
              Get.toNamed(RouteConst.cleaningCheckoutPage, arguments: {
                'name': Strings.strPartialCleaning,
                'image': Assets.images.partialCleaning.path,
              });
            },
          ),
          Service(
            img: Assets.images.deliverToiletries,
            name: Strings.strDeliverToiletries,
            description: 'Ask for towel, shampoo etc',
            onClick: () {
              Get.toNamed(RouteConst.toiletriesCheckoutPage, arguments: {
                'name': Strings.strDeliverToiletries,
                'image': Assets.images.deliverToiletries.path,
              });
            },
          ),
          Service(
            img: Assets.images.laundryService,
            name: Strings.strLaundaryService,
            description: 'Ask for wash clothes',
            onClick: () {
              Get.toNamed(RouteConst.laundaryCheckoutPage, arguments: {
                'name': Strings.strLaundaryService,
                'image': Assets.images.laundryService.path,
              });
            },
          ),
        ]);
        break;
    }
    super.onInit();
  }
}
