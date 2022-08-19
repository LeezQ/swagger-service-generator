module.exports = [
  {
    swaggerPath: 'http://127.0.0.1:7001/swagger-ui/index.json',
    outDir: 'src/services',
    request: "import request from '@/services/request';",
    // "whiteList": ['/epaas/manager/updateUserTemplateVersion', '/epaas/out/subscribe/tripartiteSubscribeInfo']
  },
];
