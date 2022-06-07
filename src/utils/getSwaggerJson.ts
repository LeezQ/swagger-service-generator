import { SwaggerJson } from '@/typing';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

type TResponse = {
  data?: SwaggerJson | undefined;
};

//获取swagger.json数据
async function getSwaggerJson(url: string): Promise<TResponse> {
  let res: TResponse = {};
  if (url.startsWith('./')) {
    res.data = JSON.parse(fs.readFileSync(path.join(process.cwd(), url), 'utf-8'));
  } else {
    res = await axios({ url: url, method: 'get' });
  }
  return res;
}

export default getSwaggerJson;
