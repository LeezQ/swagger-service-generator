
// function urlToCamelCase(url) {
//   // remove whitespace
//   url = url.replace(/\s/g, '');
//   return url.replace(/[\/|\_|\?\=](\w)/g, function (all, letter) {
//     return letter.toUpperCase();
//   });
// };
module.exports = [
  {
    "swaggerPath": "http://121.40.238.63:8092/v2/api-docs",
    "outDir": "lib/src/services",
    "fileNameRule": function (url) {
      return url.split('/')[2];
    },
    "request": "import request from '@/services/request';"
  },
  // {
  //   swaggerPath: 'https://dev-api.jushuitan.com/fis/v3/api-docs',
  //   outDir: 'lib/services/fis',
  // },
  // {
  //   swaggerPath: 'http://api.pone.duomimall.com/v2/api-docs',
  //   outDir: 'lib/dart',
  //   fileNameRule: (url) => {
  //     return url.split('/')[2];
  //   },
  //   request: "import 'package:duomi_flutter/common/utils/utils.dart';"
  // },
  // {
  //   swaggerPath: 'https://dev-api.jushuitan.com/fis/v3/api-docs',
  //   outDir: 'lib/services/fis',
  // },
  // {
  //   swaggerPath: 'http://121.40.238.63:8092/v2/api-docs',
  //   outDir: 'lib/services/eppas',
  // },
  // {
  //   "swaggerPath": "./swaggerApi.json",
  //   "outDir": "lib/services/",
  //   "fileNameRule": function (url) {
  //     return 'logistics';
  //   },
  //   "request": "import request from '@/services/request';",
  //   "functionNameRule": function (url) {
  //     return urlToCamelCase(url);
  //   },
  //   basePath: '/',
  //   typingFileName: 'logistics.d.ts',
  //   whiteList: [
  //     '/getData/transportData?apiCode=update_lgst_ignore_remark',
  //     '/getData/transportData?apiCode=order_logistiscs_alarm_detail',
  //     '/getData/exportExcel?apiCode=order_logistiscs_alarm_detail',
  //     '/getData/transportData?apiCode=order_logistiscs_alarm_note',
  //     '/getData/transportData?apiCode=order_logistiscs_alarm_detail_dim',
  //     '/getData/transportData?apiCode=order_logistiscs_alarm_summary',
  //     '/getData/getErpData?apiCode= express_bill_track',
  //     '/getData/transportData?apiCode=order_logistiscs_alarm_feedback',
  //     '/getData/getErpData?apiCode= distributor_list',
  //     '/getData/getErpData?apiCode= platform_shop_list',
  //     '/getData/transportData?apiCode=delete_logistic_alarm_user_defined_query_pool',
  //     '/getData/transportData?apiCode=insert_logistic_alarm_user_defined_query_pool',
  //     '/getData/transportData?apiCode=select_logistic_alarm_user_defined_query_pool',
  //     '/getData/getErpData?apiCode=order_questions',
  //     '/getData/transportData?apiCode= logistic_alarm_order_wait_deal_count',
  //     '/getData/importFileUrl',
  //     '/getData/getUploadFileUrl',
  //     '/getData/getBusinessData?code=biz_domain_window_cancel_check',
  //     '/getData/getBusinessData?code=biz_domain_window_cancel',
  //     '/getData/transformData?apiCode=logistic_company_query',
  //     '/getData/transformData?apiCode=biz_domain_msg'
  //   ]
  // },
  // {
  //   "swaggerPath": "./swaggerApiWarehouse.json",
  //   "outDir": "lib/services/",
  //   "fileNameRule": function (url) {

  //     return 'warehouse';
  //   },
  //   "request": "import request from '@/services/request';",
  //   "functionNameRule": function (url) {
  //     return urlToCamelCase(url);
  //   },
  //   basePath: '/',
  //   typingFileName: 'warehouse.d.ts',
  //   whiteList: ['/getData/getErpData?apiCode=report_warehouse_wait_work_combine_count',
  //     '/getData/transportData?apiCode= warehouse_board_update_time',
  //     '/getData/transportData?apiCode=payment_order_deliver_trend',
  //     '/getData/getErpData?apiCode=report_shippingfail_count',
  //     '/getData/getErpData?apiCode=report_deliverytimeeffect_set',
  //     '/getData/getErpData?apiCode=report_cutoffordertime_query',
  //     '/getData/getErpData?apiCode=report_deliverytimeeffect_get_combine',
  //     '/getData/getErpData?apiCode=report_cutoffordertime_set',
  //     '/getData/transportData?apiCode=payment_order_deliver_history_count',
  //     '/getData/transportData?apiCode=payment_order_deliver_count',
  //     '/getData/transportData?apiCode=each_shipper_deliver_count',
  //     '/getData/transportData?apiCode=order_will_timeout_deliver_count',
  //     '/getData/transportData?apiCode=order_has_timeout_deliver_count',
  //     '/getData/transportData?apiCode=order_not_deliver_status_count',
  //     '/getData/getErpData?apiCode=jushuitan_report_mergedelivery_istpw',
  //     '/getData/getErpData?apiCode=report_wms_partner_query',]
  // },
  // {
  //   "swaggerPath": "./swaggerApiDashBoard.json",
  //   "outDir": "lib/services/",
  //   "fileNameRule": function (url) {
  //     return 'dashboard';
  //   },
  //   "request": "import request from '@/services/request';",
  //   "functionNameRule": function (url) {
  //     return urlToCamelCase(url);
  //   },
  //   basePath: '/',
  //   typingFileName: 'dashboard.d.ts',
  //   whiteList: [
  //     '/getData/transportData?apiCode=query_platform_icon',
  //     '/getData/getBusinessData?apCode=epaas_query_user_subscribe_info',
  //     '/getData/transportData?apiCode=dataportal_data_update_time',
  //     '/getData/transportData?apiCode=goods_analyse_save_remove_goods_labels_setting',
  //     '/getData/transportData?apiCode=goods_analyse_query_remove_goods_page',
  //     '/getData/transportData?apiCode=goods_analyse_goods_setting_notice_query',
  //     '/getData/transportData?apiCode=goods_analyse_resume_remove_goods_show',
  //     '/getData/transportData?apiCode=goods_analyse_query_remove_goods_labels',
  //     '/getData/getBusinessData?apiCode=goods_analyse_add_goods_follow',
  //     '/getData/transportData?apiCode=goods_analyse_goods_setting_notice_close',
  //     '/getData/transportData?apiCode=goods_analyse_popular_goods_top',
  //     '/getData/getErpData?apiCode=delivery_query',
  //     '/getData/transportData?apiCode=dashboard_today_survey_salesinfo_detail_summary',
  //     '/getData/transportData?apiCode=dashboard_today_survey_salesinfo_summary',
  //     '/getData/getBusinessData?apiCode=goods_analyse_sku_list',
  //     '/getData/getErpData?apiCode=itemlabels_list',
  //     '/getData/transportData?apiCode=goods_analyse_remove_goods_follow',
  //     '/getData/transportData?apiCode=goods_analyse_save_goods_setting',
  //     '/getData/transportData?apiCode=goods_analyse_query_goods_setting',
  //     '/getData/transportData?apiCode=goods_analyse_remove_goods_show',
  //     '/getData/transportData?apiCode=goods_analyse_follow_goods_top',
  //     '/getData/transportData?apiCode=anchor_analyse_sales_ranking_anchor',
  //     '/getData/transportData?apiCode=anchor_analyse_sales_ranking_goods',
  //     '/getData/transportData?apiCode=anchor_analyse_anchor_platform_sales_distribution',
  //     '/getData/transportData?apiCode=dashboard_aftersale_shop_analyse_list',
  //     '/getData/transportData?apiCode=dashboard_aftersale_drp_analyse_list',
  //     '/getData/transportData?apiCode=channel_analyse_pie_chart',
  //     '/getData/transportData?apiCode=channel_analyse_today_rank_drp',
  //     '/getData/transportData?apiCode=channel_analyse_today_rank_shop',
  //     '/getData/getBusinessData?apiCode=channel_analyse_query_shop',
  //     '/getData/getBusinessData?apCode=channel_analyse_query_drp',
  //     '/getData/getBusinessData?apiCode=channel_analyse_add_top',
  //     '/getData/transportData?apiCode=channel_analyse_remove_top',
  //   ]
  // }
]
