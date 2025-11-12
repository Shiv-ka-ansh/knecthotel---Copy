import 'package:get/get.dart';
import 'package:knecthotel/gen/assets.gen.dart';

class BookingServiceRequestController extends GetxController {
  List<Map<String, dynamic>> items = [
    {
      'image': Assets.images.foodOrderingImg.path,
      'statusImage': Assets.images.cookingStatus.path,
      'title': 'ordered Food',
      'subtitle': 'Food is Cooking',
      'time': '07:50',
      'statusSteps': ['ordered', 'Processing', 'Delivered'],
      'currentStep': 1,
    },
    {
      'image': Assets.images.wholeRoomCleaning.path,
      'title': 'Whole room cleaning',
      'statusImage': Assets.images.cleanStatus.path,
      'subtitle': 'On the Way',
      'time': '07:50',
      'statusSteps': ['ordered', 'Processing', 'Delivered'],
      'currentStep': 1,
    },
    {
      'image': Assets.images.laundryService.path,
      'title': 'Laundry service',
      'statusImage': Assets.images.laundaryStatusGif.path,
      'subtitle': 'On the Way',
      'time': '02:50',
      'statusSteps': ['ordered', 'Processing', 'Delivered'],
      'currentStep': 1,
    },
    {
      'image': Assets.images.conferenceHall.path,
      'title': 'Conference Hall',
      'statusImage': Assets.images.requestComplete.path,
      'subtitle': '1000-2000 per hour',
      'timeRange': '14 Feb - 16 Feb 2025',
      'time': '00:00',
      'statusSteps': ['ordered', 'Completed'],
      'currentStep': 1,
      'showFeedback': true,
    },
  ];
}
