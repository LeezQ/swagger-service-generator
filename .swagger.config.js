module.exports = [
  {
    swaggerPath: './swagger.json',
    typingFileName: 'api-auto.d.ts',
    // definitionsName: 'PlanReport',
    // pathsName: 'PlanReportPaths',
    outDir: 'src/services/auto',
    fileNameRule: function (url) {
      // 按服务名切分
      if (url.split('/WebApi/PF/')[1]) {
        return url.split('/WebApi/PF/')[1].split('/')[0];
      }
      // else {
      //   return 'PfWechatApp';
      // }
    },
    request: "import { request } from 'umi';",
    // whiteList: function (url) {
    //   // 根据需要配置白名单
    //   if (url.startsWith('/WebApi/PF/PlanReport')) {
    //     return true;
    //   }
    //   if (url.startsWith('/WebApi/PF/ProfitForDate')) {
    //     return true;
    //   }
    // },
  },
];
