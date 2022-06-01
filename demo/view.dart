import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'controller.dart';

class DemoPage extends GetView<DemoController> {
  DemoPage();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(title: Text('DemoPage')),
        body: SafeArea(
            child: Obx(() => Text('DemoController x ${controller.name}'))));
  }
}
