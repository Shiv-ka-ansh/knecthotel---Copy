import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:loading_animation_widget/loading_animation_widget.dart';

import 'app/config/app_colors.dart';
import 'app/config/strings.dart';
import 'app/routes/pages.dart';
import 'app/routes/route_const.dart';
import 'app/services/app_component.dart';
import 'gen/fonts.gen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await GetStorage.init();
  await ScreenUtil.ensureScreenSize();
  AppBaseComponent.instance.startListen(); // Await to ensure setup completion
  Future.delayed(const Duration(seconds: 1), () {
    runApp(const MyApp());
  });
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ScreenUtilInit(
      designSize: kIsWeb ? const Size(1080, 670) : const Size(360, 690),
      builder: (_, child) => GetMaterialApp(
        debugShowCheckedModeBanner: false,
        theme: ThemeData.light().copyWith(
          appBarTheme:
              const AppBarTheme(backgroundColor: AppColors.primaryColor),
          scaffoldBackgroundColor: AppColors.scaffoldBg,
          primaryColor: AppColors.primaryColor,
        ),
  // For development: skip phone/OTP auth and go directly to dashboard.
  // Change back to languageSelectionScreen for normal flow.
  initialRoute: RouteConst.dashboard,
        getPages: Pages.pages,
        builder: (context, child) {
          return Stack(
            children: [
              child!,
              _buildLoadingOverlay(),
              _buildNetworkStatusBanner(),
            ],
          );
        },
      ),
    );
  }
}

/// Shows a loading overlay when a process is running
Widget _buildLoadingOverlay() {
  return StreamBuilder<bool>(
    initialData: false,
    stream: AppBaseComponent.instance.progressStream,
    builder: (context, snapshot) {
      return Obx(
        () => AppBaseComponent.instance.completed.value
            ? const Offstage()
            : Positioned.fill(
                child: AnimatedOpacity(
                  opacity: snapshot.data! ? 1 : 0,
                  duration: const Duration(milliseconds: 200),
                  child: Container(
                    color: Colors.black.withOpacity(0.3),
                    child: Center(
                      child: LoadingAnimationWidget.hexagonDots(
                        color: AppColors.primaryColor,
                        size: 40,
                      ),
                    ),
                  ),
                ),
              ),
      );
    },
  );
}

/// Displays a network status banner when offline
Widget _buildNetworkStatusBanner() {
  return StreamBuilder<bool>(
    initialData: true,
    stream: AppBaseComponent.instance.networkStream,
    builder: (context, snapshot) {
      return Positioned(
        top: 0,
        child: SafeArea(
          child: AnimatedContainer(
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: AppColors.primaryColor,
              boxShadow: [
                BoxShadow(
                  offset: const Offset(0, 0),
                  blurRadius: 14,
                  spreadRadius: 0,
                  color: AppColors.whiteColor.withOpacity(0.3),
                ),
              ],
              borderRadius:
                  const BorderRadius.vertical(bottom: Radius.circular(15)),
            ),
            height: snapshot.data! ? 0 : 100,
            width: Get.width,
            curve: Curves.decelerate,
            duration: const Duration(seconds: 1),
            child: const Material(
              type: MaterialType.transparency,
              child: Text(
                Strings.strNoInternetAvailable,
                overflow: TextOverflow.fade,
                style: TextStyle(
                  fontFamily: FontFamily.openSansBold,
                  color: AppColors.whiteColor,
                  fontSize: 18,
                ),
              ),
            ),
          ),
        ),
      );
    },
  );
}
