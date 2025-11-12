import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:get/get.dart';
import 'package:get/get_rx/get_rx.dart';

class AppBaseComponent {
  AppBaseComponent._privateConstructor();
  final Connectivity _connectivity = Connectivity();

  RxBool completed = true.obs;
  List<String> events = <String>[];
  static final AppBaseComponent instance =
      AppBaseComponent._privateConstructor()..initNetwork();

  final StreamController<bool> progressStreamController =
      StreamController<bool>.broadcast();
  final StreamController<bool> networkStreamController =
      StreamController<bool>.broadcast();

  Stream<bool> get progressStream => progressStreamController.stream;
  Stream<bool> get networkStream => networkStreamController.stream;

  void addEvent(String event) {
    events.add(event);
    if (events.isNotEmpty) {
      startLoading();
    } else {
      stopLoading();
    }
  }

  void removeEvent(String event) {
    events.remove(event);
    if (events.isNotEmpty) {
      startLoading();
    } else {
      stopLoading();
    }
  }

  void startListen() {}

  void initNetwork() async {
    var initData = await _connectivity.checkConnectivity();
    if (initData.contains(ConnectivityResult.ethernet) ||
        initData.contains(ConnectivityResult.mobile) ||
        initData.contains(ConnectivityResult.wifi) ||
        initData.contains(ConnectivityResult.vpn)) {
      networkStreamController.sink.add(true);
      stopLoading();
    } else {
      networkStreamController.sink.add(false);
      startLoading();
    }
    _connectivity.onConnectivityChanged
        .listen((List<ConnectivityResult> eventsList) {
      if (eventsList.contains(ConnectivityResult.ethernet) ||
          eventsList.contains(ConnectivityResult.mobile) ||
          eventsList.contains(ConnectivityResult.wifi) ||
          eventsList.contains(ConnectivityResult.vpn)) {
        networkStreamController.sink.add(true);
        stopLoading();
      } else {
        networkStreamController.sink.add(false);
        startLoading();
      }
    });
  }

  void startLoading() {
    completed(false);
    Future.delayed(
      const Duration(milliseconds: 100),
      () {
        progressStreamController.sink.add(true);
      },
    );
  }

  void stopLoading() {
    progressStreamController.sink.add(false);
    Future.delayed(
      const Duration(milliseconds: 200),
      () {
        completed(true);
      },
    );
  }
}
