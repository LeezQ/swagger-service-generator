module.exports = [
  {
    swaggerPath: 'http://localhost:3000/api-json',
    typingFileName: 'api-auto.d.ts',
    // definitionsName: 'PlanReport',
    // pathsName: 'PlanReportPaths',
    outDir: 'services',
    request: "import { request } from 'umi';",
    fileNameRule: function (url) {
      return url.split('/')[2];
      // 按服务名切分
      // else {
      //   return 'PfWechatApp';
      // }
    },
  },
];
