import 'package:get/get.dart';

import 'controller.dart';

class DemoBinding implements Bindings {
  @override
  void dependencies() {
    Get.lazyPut<DemoController>(() => DemoController());
  }
}
