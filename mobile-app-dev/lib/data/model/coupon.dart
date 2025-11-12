import 'dart:ui';

class Coupon {
  final String code;
  final String description;
  final String expiry;
  final String terms;
  final Color color;

  Coupon({
    required this.code,
    required this.description,
    required this.expiry,
    required this.terms,
    required this.color,
  });
}
