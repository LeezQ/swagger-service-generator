module.exports = [
  {
    swaggerPath: 'http://api.maslow-dev.lafyun.com/-json',
    typingFileName: 'api-auto.d.ts',
    // definitionsName: 'PlanReport',
    // pathsName: 'PlanReportPaths',
    outDir: 'services/v1',
    request: "import request from '@/utils/request';",
    fileNameRule: function (url) {
      return url.split('/')[2];
      // 按服务名切分
      // else {
      //   return 'PfWechatApp';
      // }
    },
  },
];
