//引入依赖
var fs = require('fs');
var child_process = require('child_process');

var path = require('path');
require('colors');
var axios = require('axios');
var _ = require('lodash');

const config = require(path.join(process.cwd(), './swagger.config.json'));

//启动函数
async function run() {
  console.log(`读取json数据......`.yellow);
  console.log(`config......${JSON.stringify(config)}`.green);
  const { url, outDir, modelDir, request = ``, filePathReg = '/(.*?)/', fileNameReg } = config;


  const res = await getData(url);
  const { paths, basePath, definitions } = res.data;
  let pathGroups = {};
  _.map(paths, (item, urlPath) => {
    const groupKey = urlPath.match(new RegExp(filePathReg))[1] || 'default';
    if (Object.keys(pathGroups).includes(groupKey)) {
      pathGroups[groupKey].push({
        url: urlPath,
        apiInfo: item,
      });
    } else {
      pathGroups[groupKey] = [
        {
          url: urlPath,
          apiInfo: item,
        },
      ];
    }
  });

  genetateService(pathGroups, fileNameReg, request, basePath, outDir);
  generateParamModel(pathGroups, modelDir);
  generateEntity(definitions);

  child_process.execSync(`dart format ${path.join(process.cwd(), 'lib')}`);
  child_process.execSync(`flutter pub run build_runner build --delete-conflicting-outputs `);
  console.log('生成完成'.green);
}


//获取swagger.json数据
async function getData(url) {
  return await axios({ url: url, method: 'get' });
}

function upperCaseFirstLetter(str) {
  str = replaceX(str);
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function replaceX(str) {
  str = str.replace('«', '').replace('»', '');
  return str;
}

function generateEntity(definitions, entityPath = 'lib/entity/') {
  const entityDir = path.join(process.cwd(), entityPath); //存放api文件地址
  if (!fs.existsSync(entityDir)) {
    // mkdir -p
    fs.mkdirSync(entityDir, { recursive: true });
  }
  Object.keys(definitions).forEach((modelName) => {
    const { type, required = [], properties = {}, title } = definitions[modelName];

    let _properties = '';
    Object.keys(properties).forEach((_key) => {
      _properties += `
      ${generateModelProperty(properties[_key], _key, required)}
`;
    });

    let _constructor = `
    ${upperCaseFirstLetter(modelName)}(__CONSTRUCTOR_CONTENT__);
    `;

    let __CONSTRUCTOR_CONTENT__ = '';
    Object.keys(properties).forEach((_key) => {
      let requiredFlag = (_key === 'success') || required.includes(_key) ? true : false;
      let requiredTxt = requiredFlag ? 'required' : '';
      __CONSTRUCTOR_CONTENT__ += `
      ${requiredTxt} this.${_key},
`;
    });

    _constructor = _constructor.replace(
      '__CONSTRUCTOR_CONTENT__',
      Object.keys(properties).length > 0 ? `{${__CONSTRUCTOR_CONTENT__}}` : '',
    );

    const _modelString = `
    // ignore_for_file: unused_import, non_constant_identifier_names
    import './entity.dart';
    import 'package:json_annotation/json_annotation.dart';

    part '${replaceX(modelName)}.g.dart';

@JsonSerializable(explicitToJson: true)
    class ${upperCaseFirstLetter(modelName)} {
    ${_properties}
    ${_constructor}

    factory ${replaceX(modelName)}.fromJson(Map<String, dynamic> json) => _$${replaceX(modelName)}FromJson(json);

    Map<String, dynamic> toJson() => _$${replaceX(modelName)}ToJson(this);
    }
        `;

    fs.writeFileSync(path.join(entityDir, `${replaceX(modelName)}.dart`), _modelString);


  });

  let _entityString = `
  library entity;
  __ENTITY_CONTENT__
  `;

  let __ENTITY_CONTENT__ = '';
  Object.keys(definitions).forEach((modelName) => {
    __ENTITY_CONTENT__ += `
export './${replaceX(modelName)}.dart';
    `
  });


  fs.writeFileSync(path.join(entityDir, `entity.dart`), _entityString.replace(
    '__ENTITY_CONTENT__', __ENTITY_CONTENT__,
  ));


}

function generateDartType(type) {
  switch (type) {
    case 'integer':
      return 'int';
    case 'number':
      return 'double';
    case 'string':
      return 'String';
    case 'boolean':
      return 'bool';
    case 'array':
      return 'List';
    case 'object':
      return 'Map';
    default:
      return 'dynamic';
  }
}

function generateParamProperty(property) {
  let { type, name, originalRef, schema = {}, description, required } = property;
  const _in = property.in || 'query';
  if (_in === 'body') {
    type = schema.type;
  }

  if (schema.originalRef) {
    originalRef = schema.originalRef;
  }

  let res = ``;
  let requiredTxt = required ? '' : '?';
  if (!type) {
    res = `${originalRef}${requiredTxt} ${name};`;
  } else {
    if (originalRef) {
      res = `${generateDartType(type)}<${originalRef}>${requiredTxt} ${name};`;
    } else {
      res = `${generateDartType(type)}${requiredTxt} ${name};`;
    }
  }
  return `
  /// ${description}
  /// ${required ? '必选' : '可选'}
  ${res}
  `;
}

function generateModelProperty(property, name, required) {
  let { type, originalRef, description, items = {} } = property;
  const _in = property.in || 'query';
  if (_in === 'body') {
    type = schema.type;
  }
  console.log(name, JSON.stringify(property));

  let res = ``;
  let requiredFlag = (name === 'success') || required.includes(name) ? true : false;
  let requiredTxt = requiredFlag ? '' : '?';


  if (!type) {
    res = `${originalRef}${requiredTxt} ${name};`;
  } else {
    // 如果是数组, 则需要添加泛型
    if (type === 'array') {
      originalRef = items.originalRef;
    }
    if (originalRef) {
      res = `${generateDartType(type)}<${originalRef}>${requiredTxt} ${name};`;
    } else {
      res = `${generateDartType(type)}${requiredTxt} ${name};`;
    }
  }
  return `
  /// ${description}
  ${res}
  `;
}


function generateParamTypeName(upperOperationId) {
  const paramName = `Params${upperOperationId}`;
  return paramName;
}

function generateResponseTypeName(responses) {
  const res200 = responses['200'];
  const { schema = {}, description } = res200;
  const { originalRef } = schema;
  return replaceX(originalRef);
}

function genetateService(pathGroups, fileNameReg, request, basePath, outDir) {
  const apiPath = path.join(process.cwd(), outDir); //存放api文件地址
  if (!fs.existsSync(apiPath)) {
    // mkdir -p
    fs.mkdirSync(apiPath, { recursive: true });
  }
  _.map(pathGroups, (pathGroup, groupKey) => {
    const fileName = (fileNameReg ? fileNameReg.replace(/\$1/g, groupKey) : groupKey) + '.dart';

    let content = `
    // ignore_for_file: unused_import, non_constant_identifier_names
    import '../entity/entity.dart';
    import '../models/model.dart';
${request}
`;
    pathGroup.forEach((item) => {
      const { apiInfo, url } = item;

      const method = Object.keys(apiInfo)[0];
      let { operationId, summary, parameters, responses } = apiInfo[method];

      let upperOperationId = upperCaseFirstLetter(operationId);
      operationId = operationId.replace(/_/g, '');

      let paramsType = generateParamTypeName(upperOperationId);
      let responseType = generateResponseTypeName(responses);

      let _funcString = '';

      if (method === 'get') {
        _funcString = `
/// ${summary}
Future<${responseType}> ${operationId}({
  required ${paramsType} data,
  bool refresh = false,
  bool cacheDisk = false,
}) async {
  final response = await HttpUtil().get(
    '${basePath === '/' ? '' : basePath}${url}',
    queryParameters: data.toJson(),
    refresh: refresh,
    cacheDisk: cacheDisk,
  );
  return ${responseType}.fromJson(response);
}

        `;
      } else if (method === 'post') {
        _funcString = `
/// ${summary}
Future<${responseType}> ${operationId}({
  required ${paramsType} data,
}) async {
  final response = await HttpUtil().post(
    '${basePath === '/' ? '' : basePath}${url}',
    data,
  );
  return ${responseType}.fromJson(response);
}

        `;
      }

      content += _funcString;
    });

    fs.writeFileSync(path.join(apiPath, fileName), content);
  });
}


function generateParamModel(pathGroups, modelDir) {
  const modelDirPath = path.join(process.cwd(), modelDir); //存放api文件地址
  if (!fs.existsSync(modelDirPath)) {
    // mkdir -p
    fs.mkdirSync(modelDirPath, { recursive: true });
  }
  const allParamName = [];
  _.map(pathGroups, (pathGroup, groupKey) => {
    pathGroup.forEach((item) => {
      const { apiInfo } = item;

      const method = Object.keys(apiInfo)[0];
      let { operationId, parameters = [] } = apiInfo[method];

      let upperOperationId = upperCaseFirstLetter(operationId);

      let _properties = '';
      parameters.forEach((item) => {
        _properties += `
        ${generateParamProperty(item)}
        `
      });

      let _constructor = `
      Params${upperOperationId}(__CONSTRUCTOR_CONTENT__);
        `;
      let __CONSTRUCTOR_CONTENT__ = ''
      parameters.forEach((item) => {
        const { name, required } = item;
        let requiredTxt = required ? 'required' : '';
        __CONSTRUCTOR_CONTENT__ += `
          ${requiredTxt} this.${name},
    `;
      });

      _constructor = _constructor.replace('__CONSTRUCTOR_CONTENT__', parameters.length > 0 ? `{${__CONSTRUCTOR_CONTENT__}}` : '');

      const paramName = `Params${upperOperationId}`;

      if (!allParamName.includes(paramName)) {
        allParamName.push(paramName);
      }

      const paramModelContent = `
      // ignore_for_file: unused_import, non_constant_identifier_names
      import '../entity/entity.dart';
      import 'package:json_annotation/json_annotation.dart';

    part '${paramName}.g.dart';

    @JsonSerializable(explicitToJson: true)
      class ${paramName} {
    ${_properties}
    ${_constructor}

    factory ${paramName}.fromJson(Map<String, dynamic> json) => _$${paramName}FromJson(json);

    Map<String, dynamic> toJson() => _$${paramName}ToJson(this);
      }
      `;

      fs.writeFileSync(path.join(modelDirPath, paramName + '.dart'), paramModelContent);
    });
  });

  let _queryModelString = `
  library model;
  __ENTITY_CONTENT__
  `;

  let __ENTITY_CONTENT__ = '';
  allParamName.forEach((modelName) => {
    __ENTITY_CONTENT__ += `
export './${replaceX(modelName)}.dart';
    `
  });


  fs.writeFileSync(path.join(modelDirPath, `model.dart`), _queryModelString.replace(
    '__ENTITY_CONTENT__', __ENTITY_CONTENT__,
  ));




}

run();
