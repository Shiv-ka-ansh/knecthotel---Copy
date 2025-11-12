import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:knecthotel/presentation/pages/services/base_services_page.dart';

// Temporary launcher to run only the BaseServicesPage while developing.
// Usage:
// flutter run -d edge -t lib/main_only_base_services.dart

void main() {
  runApp(const _TempApp());
}

class _TempApp extends StatelessWidget {
  const _TempApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'BaseServicesPage - Dev',
      home: const BaseServicesPage(),
    );
  }
}
