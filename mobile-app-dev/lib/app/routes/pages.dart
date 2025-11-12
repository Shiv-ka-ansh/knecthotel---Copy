import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/app/routes/bindings/add_bank_details_bindings.dart';
import 'package:knecthotel/app/routes/bindings/amenities_bindings.dart';
import 'package:knecthotel/app/routes/bindings/apply_coupon_page_bindings.dart';
import 'package:knecthotel/app/routes/bindings/book_slot_bindings.dart';
import 'package:knecthotel/app/routes/bindings/booking_selection_bindings.dart';
import 'package:knecthotel/app/routes/bindings/booking_service_request_bindings.dart';
import 'package:knecthotel/app/routes/bindings/booking_service_status_bindings.dart';
import 'package:knecthotel/app/routes/bindings/cleaning_checkout_page_bindings.dart';
import 'package:knecthotel/app/routes/bindings/concierge_page_bindings.dart';
import 'package:knecthotel/app/routes/bindings/concierge_service_form_bindings.dart';
import 'package:knecthotel/app/routes/bindings/confirm_booking_page_bindings.dart';
import 'package:knecthotel/app/routes/bindings/confirm_order_bindings.dart';
import 'package:knecthotel/app/routes/bindings/create_account_bindings.dart';
import 'package:knecthotel/app/routes/bindings/dashboard_bindings.dart';
import 'package:knecthotel/app/routes/bindings/extended_service_page_bindings.dart';
import 'package:knecthotel/app/routes/bindings/food_check_out_bindings.dart';
import 'package:knecthotel/app/routes/bindings/food_services_bindings.dart';
import 'package:knecthotel/app/routes/bindings/gym_page_bindings.dart';
import 'package:knecthotel/app/routes/bindings/hotel_compatibility_signup_page_bindings.dart';
import 'package:knecthotel/app/routes/bindings/hotel_feature_signup_page_bindings.dart';
import 'package:knecthotel/app/routes/bindings/hotel_info_signup_page_bindings.dart';
import 'package:knecthotel/app/routes/bindings/language_selection_bindings.dart';
import 'package:knecthotel/app/routes/bindings/laundary_order_summary_bindings.dart';
import 'package:knecthotel/app/routes/bindings/laundry_checkout_page_bindings.dart';
import 'package:knecthotel/app/routes/bindings/order_summary_bindings.dart';
import 'package:knecthotel/app/routes/bindings/payment_page_bindings.dart';
import 'package:knecthotel/app/routes/bindings/reception_complaint_form_bindings.dart';
import 'package:knecthotel/app/routes/bindings/reception_request_bindings.dart';
import 'package:knecthotel/app/routes/bindings/registration_bindings.dart';
import 'package:knecthotel/app/routes/bindings/room_control_form_bindings.dart';
import 'package:knecthotel/app/routes/bindings/select_date_time_bindings.dart';
import 'package:knecthotel/app/routes/bindings/select_document_page_bindings.dart';
import 'package:knecthotel/app/routes/bindings/select_signup_page_bindings.dart';
import 'package:knecthotel/app/routes/bindings/sos_request_form_bindings.dart';
import 'package:knecthotel/app/routes/bindings/spa_salon_page_bindings.dart';
import 'package:knecthotel/app/routes/bindings/swimming_pool_page_bindings.dart';
import 'package:knecthotel/app/routes/bindings/toiletries_checkout_page_bindings.dart';
import 'package:knecthotel/app/routes/bindings/toiletries_order_summary_bindings.dart';
import 'package:knecthotel/app/routes/bindings/upload_picture_bindings.dart';
import 'package:knecthotel/app/routes/bindings/verify_document_bindings.dart';
import 'package:knecthotel/app/routes/bindings/verify_otp_bindings.dart';
import 'package:knecthotel/app/routes/bindings/view_rooms_bindings.dart';
import 'package:knecthotel/app/routes/bindings/wifi_page_bindings.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/app/services/app_component.dart';
import 'package:knecthotel/presentation/pages/amenities/book_slot.dart';
import 'package:knecthotel/presentation/pages/amenities/concierge_page.dart';
import 'package:knecthotel/presentation/pages/amenities/concierge_service_form.dart';
import 'package:knecthotel/presentation/pages/bookings/booking_service_request.dart';
import 'package:knecthotel/presentation/pages/bookings/booking_service_status.dart';
import 'package:knecthotel/presentation/pages/common/apply_coupon_page.dart';
import 'package:knecthotel/presentation/pages/common/confirm_order.dart';
import 'package:knecthotel/presentation/pages/amenities/gym_page.dart';
import 'package:knecthotel/presentation/pages/amenities/payment_page.dart';
import 'package:knecthotel/presentation/pages/amenities/request_status_form.dart';
import 'package:knecthotel/presentation/pages/amenities/reception_request_form.dart';
import 'package:knecthotel/presentation/pages/amenities/room_control_form.dart';
import 'package:knecthotel/presentation/pages/amenities/sos_request_form.dart';
import 'package:knecthotel/presentation/pages/amenities/spa_salon_page.dart';
import 'package:knecthotel/presentation/pages/amenities/swimming_pool_page.dart';
import 'package:knecthotel/presentation/pages/bookings/booking_selection.dart';
import 'package:knecthotel/presentation/pages/bookings/view_rooms.dart';
import 'package:knecthotel/presentation/pages/home/amenities_page.dart';
import 'package:knecthotel/presentation/pages/amenities/wifi_page.dart';
import 'package:knecthotel/presentation/pages/hotel_signup/hotel_compatibility_signup_page.dart';
import 'package:knecthotel/presentation/pages/hotel_signup/hotel_feature_signup_page.dart';
import 'package:knecthotel/presentation/pages/hotel_signup/hotel_info_signup_page.dart';
import 'package:knecthotel/presentation/pages/onboarding/select_signup_page.dart';
import 'package:knecthotel/presentation/pages/services/cleaning_checkout_page.dart';
import 'package:knecthotel/presentation/pages/services/confirm_booking_page.dart';
import 'package:knecthotel/presentation/pages/services/extended_service_page.dart';
import 'package:knecthotel/presentation/pages/services/food_check_out.dart';
import 'package:knecthotel/presentation/pages/services/food_services.dart';
import 'package:knecthotel/presentation/pages/services/laundary_order_summary.dart';
import 'package:knecthotel/presentation/pages/services/laundry_checkout_page.dart';
import 'package:knecthotel/presentation/pages/services/order_summary.dart';
import 'package:knecthotel/presentation/pages/services/select_date_time.dart';
import 'package:knecthotel/presentation/pages/services/toiletries_checkout_page.dart';
import 'package:knecthotel/presentation/pages/services/toiletries_order_summary.dart';
import 'package:knecthotel/presentation/pages/user_signup/add_bank_details.dart';
import 'package:knecthotel/presentation/pages/user_signup/create_account.dart';
import 'package:knecthotel/presentation/pages/dashboard/dashboard_screen.dart';
import 'package:knecthotel/presentation/pages/onboarding/language_selection.dart';
import 'package:knecthotel/presentation/pages/auth/registration_screen.dart';
import 'package:knecthotel/presentation/pages/auth/verify_otp_screen.dart';
import 'package:knecthotel/presentation/pages/user_signup/select_document_page.dart';
import 'package:knecthotel/presentation/pages/user_signup/upload_picture.dart';
import 'package:knecthotel/presentation/pages/user_signup/verify_document.dart';

class Pages {
  static final pages = [
    getPage(
      name: RouteConst.selectSignup,
      page: const SelectSignupPage(),
      binding: SelectSignupPageBindings(),
    ),
    getPage(
      name: RouteConst.registration,
      page: const RegistrationScreen(),
      binding: RegistrationBindings(),
    ),
    getPage(
      name: RouteConst.hotelInfoSignup,
      page: const HotelInfoSignupPage(),
      binding: HotelInfoSignupPageBindings(),
    ),
    getPage(
      name: RouteConst.hotelFeatureSignup,
      page: const HotelFeatureSignupPage(),
      binding: HotelFeatureSignupPageBindings(),
    ),
    getPage(
      name: RouteConst.hotelCompatibilitySignup,
      page: const HotelCompatibilitySignupPage(),
      binding: HotelCompatibilitySignupPageBindings(),
    ),
    getPage(
      name: RouteConst.verifyOtp,
      page: const VerifyOtpScreen(),
      binding: VerifyOtpBindings(),
    ),
    getPage(
      name: RouteConst.createAccount,
      page: const CreateAccount(),
      binding: CreateAccountBindings(),
    ),
    getPage(
      name: RouteConst.dashboard,
      page: const DashboardScreen(),
      binding: DashboardBindings(),
    ),
    getPage(
      name: RouteConst.languageSelectionScreen,
      page: const LanguageSelection(),
      binding: LanguageSelectionBindings(),
    ),
    getPage(
      name: RouteConst.selectDocuments,
      page: const SelectDocumentPage(),
      binding: SelectDocumentPageBindings(),
    ),
    getPage(
      name: RouteConst.verifyDocuments,
      page: const VerifyDocument(),
      binding: VerifyDocumentBindings(),
    ),
    getPage(
      name: RouteConst.addBankDetails,
      page: const AddBankDetails(),
      binding: AddBankDetailsBindings(),
    ),
    getPage(
      name: RouteConst.uploadPicture,
      page: const UploadPicture(),
      binding: UploadPictureBindings(),
    ),
    getPage(
      name: RouteConst.bookingSelection,
      page: const BookingSelection(),
      binding: BookingSelectionBindings(),
    ),
    getPage(
      name: RouteConst.viewRooms,
      page: const ViewRooms(),
      binding: ViewRoomsBindings(),
    ),
    getPage(
      name: RouteConst.amenitiesPage,
      page: const AmenitiesPage(),
      binding: AmenitiesBindings(),
    ),
    getPage(
      name: RouteConst.wifiPage,
      page: const WifiPage(),
      binding: WifiPageBindings(),
    ),
    getPage(
      name: RouteConst.receptionRequestFormPage,
      page: const ReceptionRequestForm(),
      binding: ReceptionRequestBindings(),
    ),
    getPage(
      name: RouteConst.requestStatusPage,
      page: const RequestStatusForm(),
      binding: RequestStatusFormBindings(),
    ),
    getPage(
      name: RouteConst.gymPage,
      page: const GymPage(),
      binding: GymPageBindings(),
    ),
    getPage(
      name: RouteConst.bookSlotPage,
      page: const BookSlot(),
      binding: BookSlotBindings(),
    ),
    getPage(
      name: RouteConst.spaPage,
      page: const SpaSalonPage(),
      binding: SpaSalonPageBindings(),
    ),
    getPage(
      name: RouteConst.swimmingPoolPage,
      page: const SwimmingPoolPage(),
      binding: SwimmingPoolPageBindings(),
    ),
    getPage(
      name: RouteConst.paymentPage,
      page: const PaymentPage(),
      binding: PaymentPageBindings(),
    ),
    getPage(
      name: RouteConst.conciergePage,
      page: const ConciergePage(),
      binding: ConciergePageBindings(),
    ),
    getPage(
      name: RouteConst.conciergeServiceForm,
      page: const ConciergeServiceForm(),
      binding: ConciergeServiceFormBindings(),
    ),
    getPage(
      name: RouteConst.confirmOrderPage,
      page: const ConfirmOrder(),
      binding: ConfirmOrderBindings(),
    ),
    getPage(
      name: RouteConst.inRoomControlForm,
      page: const RoomControlForm(),
      binding: RoomControlFormBindings(),
    ),
    getPage(
      name: RouteConst.sosRequestForm,
      page: const SosRequestForm(),
      binding: SosRequestFormBindings(),
    ),
    getPage(
      name: RouteConst.extendedServicePage,
      page: const ExtendedServicePage(),
      binding: ExtendedServicePageBindings(),
    ),
    getPage(
      name: RouteConst.foodServicesPage,
      page: const FoodServices(),
      binding: FoodServicesBindings(),
    ),
    getPage(
      name: RouteConst.selectDateTimePage,
      page: const SelectDateTime(),
      binding: SelectDateTimeBindings(),
    ),
    getPage(
      name: RouteConst.foodCheckOut,
      page: const FoodCheckOut(),
      binding: FoodCheckOutBindings(),
    ),
    getPage(
      name: RouteConst.cleaningCheckoutPage,
      page: const CleaningCheckoutPage(),
      binding: CleaningCheckoutPageBindings(),
    ),
    getPage(
      name: RouteConst.orderSummaryPage,
      page: const OrderSummary(),
      binding: OrderSummaryBindings(),
    ),
    getPage(
      name: RouteConst.confirmBookingPage,
      page: const ConfirmBookingPage(),
      binding: ConfirmBookingPageBindings(),
    ),
    getPage(
      name: RouteConst.laundaryCheckoutPage,
      page: const LaundryCheckoutPage(),
      binding: LaundryCheckoutPageBindings(),
    ),
    getPage(
      name: RouteConst.laundaryOrderSummaryPage,
      page: const LaundaryOrderSummary(),
      binding: LaundaryOrderSummaryBindings(),
    ),
    getPage(
      name: RouteConst.toiletriesCheckoutPage,
      page: const ToiletriesCheckoutPage(),
      binding: ToiletriesCheckoutPageBindings(),
    ),
    getPage(
      name: RouteConst.toiletriesOrderSummaryPage,
      page: const ToiletriesOrderSummary(),
      binding: ToiletriesOrderSummaryBindings(),
    ),
    getPage(
      name: RouteConst.bookingServiceStatusPage,
      page: const BookingServiceStatus(),
      binding: BookingServiceStatusBindings(),
    ),
    getPage(
      name: RouteConst.bookingServiceRequest,
      page: const BookingServiceRequest(),
      binding: BookingServiceRequestBindings(),
    ),
    getPage(
      name: RouteConst.applyCouponPage,
      page: const ApplyCouponPage(),
      binding: ApplyCouponPageBindings(),
    )
  ];

  static GetPage<dynamic> getPage({
    required String name,
    required Widget page,
    Bindings? binding,
  }) =>
      GetPage(
        name: name,
        page: () => PopScope(
          canPop: AppBaseComponent.instance.completed.value,
          child: page,
        ),
        binding: binding,
        transition: Transition.cupertino,
      );
}
