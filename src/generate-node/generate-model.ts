import ejs from 'ejs';
import _, { camelCase, upperFirst } from 'lodash';
import path from 'path';
import fs from 'fs';
import { Sequelize } from 'sequelize';
import successLog from '../utils/success';

type TSField = {
  name?: string;
  type: string;
  allowNull?: boolean;
  defaultValue?: string;
  primaryKey?: boolean;
  autoIncrement?: boolean;
  comment?: string;
  field?: string;
  required?: boolean;
  description?: string;
};

async function generate() {
  const config = require(path.join(process.cwd(), './.generate.config.js'));
  const { db = {}, dtoDir = 'app/contract/dto', modelDir = 'app/model', controllerDir = 'app/controller' } = config;
  const sequelize = new Sequelize(db.dbName, db.name, db.password, db.options);

  const queryInterface = sequelize.getQueryInterface();
  const tables = await queryInterface.showAllTables();

  generateSwaggerDto(tables, queryInterface, sequelize, dtoDir);

  generateEggModel(tables, queryInterface, sequelize, modelDir);

  generateController(tables, queryInterface, sequelize, controllerDir);
}

(async () => {
  await generate();
})();

function generateSwaggerDto(tables: string[], queryInterface: any, sequelize: Sequelize, dtoDir: string) {
  const dir = path.join(process.cwd(), dtoDir); //存放api文件地址
  if (!fs.existsSync(dir)) {
    // mkdir -p
    fs.mkdirSync(dir, { recursive: true });
  }
  function getSwaggerFieldType(type: string) {
    if (type === 'INT') {
      return 'integer';
    }
    if (type.startsWith('VARCHAR')) {
      return 'string';
    }
    if (type.startsWith('DATETIME')) {
      return 'string';
    }
    return 'string';
  }

  tables.map(async (tableName) => {
    const fields = await queryInterface.describeTable(tableName);
    let dtoFields: {
      [key: string]: TSField;
    } = {};

    _.map(fields, (field: TSField, key: string) => {
      dtoFields[camelCase(key)] = {
        type: getSwaggerFieldType(field.type ?? 'VARCHAR'),
        required: !field.allowNull,
        description: field.comment || '',
      };
    });
    ejs.renderFile(
      path.join(__dirname, '../../templates/node/swagger-dto.ejs'),
      { dtoFields, tableName: tableName, dtoName: upperFirst(camelCase(tableName)) },
      {},
      function (err, str) {
        console.log('err:', err);

        fs.writeFileSync(path.join(dir, `${tableName}.js`), str);
        successLog(path.join(dir, `${tableName}.js`));
        sequelize.close();
      },
    );
  });
}

function generateEggModel(tables: string[], queryInterface: any, sequelize: Sequelize, modelDir: string) {
  const dir = path.join(process.cwd(), modelDir); //存放api文件地址
  if (!fs.existsSync(dir)) {
    // mkdir -p
    fs.mkdirSync(dir, { recursive: true });
  }

  tables.map(async (tableName) => {
    const fields = await queryInterface.describeTable(tableName);

    let modelFields: {
      [key: string]: TSField;
    } = {};
    _.map(fields, (field: TSField, key: string) => {
      field.field = key;
      (field.type = getSequelizeType(field)),
        (field.defaultValue = getDefaultValue(field)),
        (modelFields[camelCase(key)] = field);
    });

    ejs.renderFile(
      path.join(__dirname, '../../templates/node/egg-model.ejs'),
      { modelFields, tableName: tableName, modelName: upperFirst(camelCase(tableName)) + 'Model' },
      {},
      function (err, str) {
        console.log('err:', err);
        fs.writeFileSync(path.join(dir, `${tableName}.js`), str);
        successLog(path.join(dir, `${tableName}.js`));
        sequelize.close();
      },
    );
  });
}

function generateController(tables: string[], queryInterface: any, sequelize: Sequelize, controllerDir: string) {
  const dir = path.join(process.cwd(), controllerDir); //存放api文件地址
  if (!fs.existsSync(dir)) {
    // mkdir -p
    fs.mkdirSync(dir, { recursive: true });
  }

  tables.map(async (tableName) => {
    ejs.renderFile(
      path.join(__dirname, '../../templates/node/egg-crud.ejs'),
      { tableName: tableName, urlBase: '/admin/' + tableName, controllerName: upperFirst(camelCase(tableName)) },
      {},
      function (err, str) {
        console.log('err:', err);
        fs.writeFileSync(path.join(dir, `${tableName}.js`), str);
        successLog(path.join(dir, `${tableName}.js`));
        sequelize.close();
      },
    );
  });
}

function getSequelizeType(field: TSField) {
  let { type = '', field: fileName = '' } = field;
  if (fileName === 'id' && field.primaryKey) {
    type = 'DataTypes.UUID';
    return type;
  }
  if (type === 'INT') {
    type = 'DataTypes.INTEGER';
    return type;
  }

  if (type.startsWith('VARCHAR')) {
    if (type.match(/\((\d+)\)/)) {
      type = `DataTypes.STRING(${RegExp.$1})`;
    }
    type = 'DataTypes.STRING';
    return type;
  }

  if (type.startsWith('CHAR')) {
    if (type.match(/\((\d+)\)/)) {
      type = String(RegExp.$1) === '36' ? 'DataTypes.UUID' : `DataTypes.CHAR(${RegExp.$1})`;
    } else {
      type = 'DataTypes.CHAR';
    }
    return type;
  }

  if (type.startsWith('DATETIME')) {
    type = 'DataTypes.DATE';
    return type;
  }
  return type;
}

function getDefaultValue(field: TSField) {
  let { defaultValue = '', type = '' } = field;
  if (defaultValue === 'CURRENT_TIMESTAMP') {
    defaultValue = `sequelize.literal('CURRENT_TIMESTAMP')`;
    return defaultValue;
  }

  if (field.field === 'id' && field.primaryKey) {
    defaultValue = 'DataTypes.UUIDV4';

    return defaultValue;
  }

  if (type.startsWith('CHAR')) {
    if (type.match(/\((\d+)\)/)) {
      defaultValue = String(RegExp.$1) === '36' ? 'DataTypes.UUIDV4' : `DataTypes.CHAR(${RegExp.$1})`;
    }
    return defaultValue;
  }
  return defaultValue;
}
