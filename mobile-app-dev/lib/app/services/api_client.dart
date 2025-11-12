import 'dart:convert';
import 'dart:developer';
import 'dart:io';
import 'package:compress_images_flutter/compress_images_flutter.dart';
import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:http/http.dart' as http;
import 'package:knecthotel/app/config/api_const.dart';
import 'package:knecthotel/app/config/db_keys.dart';
import 'package:knecthotel/app/routes/route_const.dart';
import 'package:knecthotel/data/model/auth_data.dart';

import 'custom_exception.dart';
import 'logger.dart';

class HttpClient {
  Future get(
    url, {
    Map<String, dynamic>? body,
    Map<String, String>? headers,
    Map<String, dynamic>? queryParameters,
  }) async {
    final uri = Uri.parse(ApiConst.baseUrl + url);
    final finalUri = uri.replace(queryParameters: queryParameters);

    try {
      final request = http.Request("GET", finalUri);
      Map<String, String> tempHeaders = {};

      Logger.prints("header $headers");
      if (GetStorage().read(DbKeys.currentUser) != null) {
        AuthData userData =
            AuthData.fromJson(GetStorage().read(DbKeys.currentUser));
        //print(userData.token);
        tempHeaders.addAll({"Authorization": "Bearer ${userData.token}"});
      }
      if (headers != null) {
        tempHeaders.addAll(headers);
      }

      if (body != null) {
        request.body = json.encode(body);
      }
      request.headers.addAll(tempHeaders);
      final response = await http.Response.fromStream(await request.send());

      Logger.prints('response api name$url ${response.body}');
      if (jsonDecode(response.body)["message"] != null &&
          jsonDecode(response.body)["message"] == "User unauthorized!") {
        Get.offAllNamed(RouteConst.registration);
      }

      return response;
    } on SocketException {
      throw CustomException('No Internet connection');
    } on HttpException {
      throw CustomException("Couldn't able to reach the url");
    } on FormatException {
      throw CustomException('Bad response');
    }
  }

  Future post(String url,
      {Map<String, String>? headers,
      dynamic body,
      bool needToEncode = false}) async {
    try {
      Logger.prints("ApiName ${ApiConst.baseUrl + url} ");
      Logger.prints('Request param: $body'
          ' api: ${ApiConst.baseUrl + url}');

      Map<String, String> tempHeaders = {};

      Logger.prints("header $headers");
      if (GetStorage().read(DbKeys.currentUser) != null) {
        AuthData userData =
            AuthData.fromJson(GetStorage().read(DbKeys.currentUser));

        tempHeaders.addAll({"Authorization": "Bearer ${userData.token}"});
      }
      if (headers != null) {
        tempHeaders.addAll(
            headers.map((key, value) => MapEntry(key, value.toString())));
      }
      // Add Content-Type header for proper body parsing
      tempHeaders.addAll({"Content-Type": "application/json"});

      final response = await http.post(
        Uri.parse(ApiConst.baseUrl + url),
        headers: tempHeaders,
        body: body != null ? jsonEncode(body) : null,
      );

      if (kDebugMode) {
        log("response apiname${ApiConst.baseUrl + url} ${response.body}");
      }
      Logger.prints('response api name$url ${response.body}');
      if (jsonDecode(response.body)["message"] != null &&
          jsonDecode(response.body)["message"] == "User unauthorized!") {
        Get.offAllNamed(RouteConst.registration);
      }
      return response;
    } on SocketException {
      throw CustomException('No Internet connection');
    } on HttpException {
      throw CustomException("Couldn't able to reach the url");
    } on FormatException {
      throw CustomException('Bad response');
    }
  }

  Future postFile(String url,
      {Map<String, String>? headers,
      Map<String, String>? body,
      Map<String, List<String>>? files,
      bool compressFile = false}) async {
    try {
      Map<String, String> tempHeaders = {};

      Logger.prints("header $headers");
      if (GetStorage().read(DbKeys.currentUser) != null) {
        AuthData userData =
            AuthData.fromJson(GetStorage().read(DbKeys.currentUser));
        Logger.prints(userData);
        tempHeaders.addAll({"Authorization": "Bearer ${userData.token}"});
      }
      if (headers != null) {
        tempHeaders.addAll(headers);
      }
      var request =
          http.MultipartRequest('POST', Uri.parse(ApiConst.baseUrl + url));
      request.headers.addAll(tempHeaders);
      if (body != null) {
        request.fields.addAll(body);
      }

      if (files != null) {
        final CompressImagesFlutter compressImagesFlutter =
            CompressImagesFlutter();
        for (var entry in files.entries) {
          for (var filePath in entry.value) {
            if (compressFile) {
              File? compressedPhoto = await compressImagesFlutter
                  .compressImage(filePath, quality: 25);
              // if compression failed, fall back to original file
              final pathToUse = compressedPhoto?.path ?? filePath;
              request.files.add(
                  await http.MultipartFile.fromPath(entry.key, pathToUse));
            } else {
              request.files
                  .add(await http.MultipartFile.fromPath(entry.key, filePath));
            }
          }
        }
      }

      http.StreamedResponse response = await request.send();
      var responseBody = await response.stream.bytesToString();
      Logger.prints('response api name$url $responseBody');
      if (jsonDecode(responseBody)["message"] != null &&
          jsonDecode(responseBody)["message"] == "User unauthorized!") {
        Get.offAllNamed(RouteConst.registration);
      }
      return responseBody;
    } on SocketException {
      throw CustomException('No Internet connection');
    } on HttpException {
      throw CustomException("Couldn't able to reach the url");
    } on FormatException {
      throw CustomException("Bad response");
    }
  }

  Future put(String url,
      {Map<String, String>? headers,
      dynamic body,
      bool needToEncode = false}) async {
    try {
      Logger.prints("ApiName ${ApiConst.baseUrl + url} ");
      Logger.prints('Request param: $body'
          ' api: ${ApiConst.baseUrl + url}');

      Map<String, String> tempHeaders = {};

      Logger.prints("header $headers");
      if (GetStorage().read(DbKeys.currentUser) != null) {
        AuthData userData =
            AuthData.fromJson(GetStorage().read(DbKeys.currentUser));
        tempHeaders.addAll({"Authorization": "Bearer ${userData.token}"});
      }
      if (headers != null) {
        tempHeaders.addAll(headers);
      }

      final response = await http
          .put(
        Uri.parse(ApiConst.baseUrl + url),
        headers: tempHeaders.isNotEmpty ? tempHeaders : null,
        body: needToEncode ? jsonEncode(body) : body,
      )
          .catchError((onError) {
        Logger.prints('onError $onError');
        throw CustomException(
            onError?.toString() ?? 'An unknown error occurred');
      });
      if (kDebugMode) {
        log("response apiname${ApiConst.baseUrl + url} ${response.body}");
      }
      Logger.prints('response api name$url ${response.body}');
      if (jsonDecode(response.body)["message"] != null &&
          jsonDecode(response.body)["message"] == "User unauthorized!") {
        Get.offAllNamed(RouteConst.registration);
      }
      return response;
    } on SocketException {
      throw CustomException('No Internet connection');
    } on HttpException {
      throw CustomException("Couldn't able to reach the url");
    } on FormatException {
      throw CustomException('Bad response');
    }
  }

  Future putFile(
    String url, {
    Map<String, String>? headers,
    Map<String, String>? body,
    Map<String, String>? files,
  }) async {
    try {
      Map<String, String> tempHeaders = {};

      Logger.prints("header $headers");
      if (GetStorage().read(DbKeys.currentUser) != null) {
        AuthData userData =
            AuthData.fromJson(GetStorage().read(DbKeys.currentUser));
        tempHeaders.addAll({"Authorization": "Bearer ${userData.token}"});
      }
      if (headers != null) {
        tempHeaders.addAll(headers);
      }
      var request =
          http.MultipartRequest('PUT', Uri.parse(ApiConst.baseUrl + url));
      request.headers.addAll(tempHeaders);
      if (body != null) {
        request.fields.addAll(body);
      }
      if (files != null) {
        for (var entry in files.entries) {
          // await each add to ensure files are attached before sending
          request.files.add(await http.MultipartFile.fromPath(entry.key, entry.value));
        }
      }
      http.StreamedResponse response = await request.send();
      var responseBody = await response.stream.bytesToString();
      Logger.prints('response api name$url $responseBody');
      if (jsonDecode(responseBody)["message"] != null &&
          jsonDecode(responseBody)["message"] == "User unauthorized!") {
        Get.offAllNamed(RouteConst.registration);
      }
      return responseBody;
    } on SocketException {
      throw CustomException('No Internet connection');
    } on HttpException {
      throw CustomException("Couldn't able to reach the url");
    } on FormatException {
      throw CustomException("Bad response");
    }
  }

  Future patch(String url,
      {Map<String, String>? headers,
      dynamic body,
      bool needToEncode = false}) async {
    try {
      Logger.prints("ApiName ${ApiConst.baseUrl + url} ");
      Logger.prints('Request param: $body'
          ' api: ${ApiConst.baseUrl + url}');

      Map<String, String> tempHeaders = {};

      Logger.prints("header $headers");
      if (GetStorage().read(DbKeys.currentUser) != null) {
        AuthData userData =
            AuthData.fromJson(GetStorage().read(DbKeys.currentUser));
        tempHeaders.addAll({"Authorization": "Bearer ${userData.token}"});
      }
      if (headers != null) {
        tempHeaders.addAll(headers);
      }

      final response = await http
          .patch(
        Uri.parse(ApiConst.baseUrl + url),
        headers: tempHeaders.isNotEmpty ? tempHeaders : null,
        body: needToEncode ? jsonEncode(body) : body,
      )
          .catchError((onError) {
        Logger.prints('onError $onError');
        throw CustomException(
            onError?.toString() ?? 'An unknown error occurred');
      });
      if (kDebugMode) {
        log("response apiname${ApiConst.baseUrl + url} ${response.body}");
      }
      Logger.prints('response api name$url ${response.body}');
      if (jsonDecode(response.body)["message"] != null &&
          jsonDecode(response.body)["message"] == "User unauthorized!") {
        Get.offAllNamed(RouteConst.registration);
      }
      return response.body;
    } on SocketException {
      throw CustomException('No Internet connection');
    } on HttpException {
      throw CustomException("Couldn't able to reach the url");
    } on FormatException {
      throw CustomException('Bad response');
    }
  }

  Future patchFile(
    String url, {
    Map<String, String>? headers,
    Map<String, String>? body,
    Map<String, String>? files,
  }) async {
    try {
      Map<String, String> tempHeaders = {};

      Logger.prints("header $headers");
      if (GetStorage().read(DbKeys.currentUser) != null) {
        AuthData userData =
            AuthData.fromJson(GetStorage().read(DbKeys.currentUser));
        tempHeaders.addAll({"Authorization": "Bearer ${userData.token}"});
      }
      if (headers != null) {
        tempHeaders.addAll(headers);
      }
      var request =
          http.MultipartRequest('PATCH', Uri.parse(ApiConst.baseUrl + url));
      request.headers.addAll(tempHeaders);
      if (body != null) {
        request.fields.addAll(body);
      }
      if (files != null) {
        for (var entry in files.entries) {
          request.files.add(await http.MultipartFile.fromPath(entry.key, entry.value));
        }
      }
      http.StreamedResponse response = await request.send();
      var responseBody = await response.stream.bytesToString();
      Logger.prints('response api name$url $responseBody');
      if (jsonDecode(responseBody)["message"] != null &&
          jsonDecode(responseBody)["message"] == "User unauthorized!") {
        Get.offAllNamed(RouteConst.registration);
      }
      return responseBody;
    } on SocketException {
      throw CustomException('No Internet connection');
    } on HttpException {
      throw CustomException("Couldn't able to reach the url");
    } on FormatException {
      throw CustomException("Bad response");
    }
  }

  Future delete(String url,
      {Map<String, String>? headers,
      dynamic body,
      bool needToEncode = false}) async {
    try {
      Logger.prints("ApiName ${ApiConst.baseUrl + url} ");
      Logger.prints('Request param: $body'
          ' api: ${ApiConst.baseUrl + url}');

      Map<String, String> tempHeaders = {};

      Logger.prints("header $headers");
      if (GetStorage().read(DbKeys.currentUser) != null) {
        AuthData userData =
            AuthData.fromJson(GetStorage().read(DbKeys.currentUser));
        tempHeaders.addAll({"Authorization": "Bearer ${userData.token}"});
      }
      if (headers != null) {
        tempHeaders.addAll(headers);
      }

      final response = await http
          .delete(
        Uri.parse(ApiConst.baseUrl + url),
        headers: tempHeaders.isNotEmpty ? tempHeaders : null,
        body: needToEncode ? jsonEncode(body) : body,
      )
          .catchError((onError) {
        Logger.prints('onError $onError');
        throw CustomException(
            onError?.toString() ?? 'An unknown error occurred');
      });
      if (kDebugMode) {
        log("response apiname${ApiConst.baseUrl + url} ${response.body}");
      }
      Logger.prints('response api name$url ${response.body}');
      if (jsonDecode(response.body)["message"] != null &&
          jsonDecode(response.body)["message"] == "User unauthorized!") {
        Get.offAllNamed(RouteConst.registration);
      }
      return response.body;
    } on SocketException {
      throw CustomException('No Internet connection');
    } on HttpException {
      throw CustomException("Couldn't able to reach the url");
    } on FormatException {
      throw CustomException('Bad response');
    }
  }
}
