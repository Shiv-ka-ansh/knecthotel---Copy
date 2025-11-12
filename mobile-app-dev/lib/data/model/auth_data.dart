// ignore_for_file: public_member_api_docs, sort_constructors_first
import 'dart:convert';

class AuthData {
  final String customerId;
  final String phone;
  final String countryCode;
  final bool isVerified;
  final String token;

  AuthData({
    required this.customerId,
    required this.phone,
    required this.countryCode,
    required this.isVerified,
    required this.token,
  });

  AuthData copyWith({
    String? customerId,
    String? phone,
    String? countryCode,
    bool? isVerified,
    String? token,
  }) {
    return AuthData(
      customerId: customerId ?? this.customerId,
      phone: phone ?? this.phone,
      countryCode: countryCode ?? this.countryCode,
      isVerified: isVerified ?? this.isVerified,
      token: token ?? this.token,
    );
  }

  Map<String, dynamic> toMap() {
    return <String, dynamic>{
      'customerId': customerId,
      'phone': phone,
      'countryCode': countryCode,
      'isVerified': isVerified,
      'token': token,
    };
  }

  factory AuthData.fromMap(Map<String, dynamic> map) {
    return AuthData(
      customerId: map['customerId'] ?? "",
      phone: map['phone'] ?? "",
      countryCode: map['countryCode'] ?? "",
      isVerified: map['isVerified'] ?? false,
      token: map['token'] ?? "",
    );
  }

  String toJson() => json.encode(toMap());

  factory AuthData.fromJson(String source) =>
      AuthData.fromMap(json.decode(source) as Map<String, dynamic>);

  @override
  String toString() {
    return 'AuthData(customerId: $customerId, phone: $phone, countryCode: $countryCode, isVerified: $isVerified, token: $token)';
  }

  @override
  bool operator ==(covariant AuthData other) {
    if (identical(this, other)) return true;

    return other.customerId == customerId &&
        other.phone == phone &&
        other.countryCode == countryCode &&
        other.isVerified == isVerified &&
        other.token == token;
  }

  @override
  int get hashCode {
    return customerId.hashCode ^
        phone.hashCode ^
        countryCode.hashCode ^
        isVerified.hashCode ^
        token.hashCode;
  }
}
