"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ejs_1 = tslib_1.__importDefault(require("ejs"));
const lodash_1 = tslib_1.__importStar(require("lodash"));
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const sequelize_1 = require("sequelize");
const success_1 = tslib_1.__importDefault(require("../utils/success"));
function generate() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const config = require(path_1.default.join(process.cwd(), './.generate.config.js'));
        const { db = {}, dtoDir = 'app/contract/dto', modelDir = 'app/model', controllerDir = 'app/controller' } = config;
        const sequelize = new sequelize_1.Sequelize(db.dbName, db.name, db.password, db.options);
        const queryInterface = sequelize.getQueryInterface();
        const tables = yield queryInterface.showAllTables();
        generateSwaggerDto(tables, queryInterface, sequelize, dtoDir);
        generateEggModel(tables, queryInterface, sequelize, modelDir);
        generateController(tables, queryInterface, sequelize, controllerDir);
    });
}
(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    yield generate();
}))();
function generateSwaggerDto(tables, queryInterface, sequelize, dtoDir) {
    const dir = path_1.default.join(process.cwd(), dtoDir); //存放api文件地址
    if (!fs_1.default.existsSync(dir)) {
        // mkdir -p
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
    function getSwaggerFieldType(type) {
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
    tables.map((tableName) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const fields = yield queryInterface.describeTable(tableName);
        let dtoFields = {};
        lodash_1.default.map(fields, (field, key) => {
            var _a;
            dtoFields[(0, lodash_1.camelCase)(key)] = {
                type: getSwaggerFieldType((_a = field.type) !== null && _a !== void 0 ? _a : 'VARCHAR'),
                required: !field.allowNull,
                description: field.comment || '',
            };
        });
        ejs_1.default.renderFile(path_1.default.join(__dirname, '../../templates/node/swagger-dto.ejs'), { dtoFields, tableName: tableName, dtoName: (0, lodash_1.upperFirst)((0, lodash_1.camelCase)(tableName)) }, {}, function (err, str) {
            console.log('err:', err);
            fs_1.default.writeFileSync(path_1.default.join(dir, `${tableName}.js`), str);
            (0, success_1.default)(path_1.default.join(dir, `${tableName}.js`));
            sequelize.close();
        });
    }));
}
function generateEggModel(tables, queryInterface, sequelize, modelDir) {
    const dir = path_1.default.join(process.cwd(), modelDir); //存放api文件地址
    if (!fs_1.default.existsSync(dir)) {
        // mkdir -p
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
    tables.map((tableName) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const fields = yield queryInterface.describeTable(tableName);
        let modelFields = {};
        lodash_1.default.map(fields, (field, key) => {
            field.field = key;
            (field.type = getSequelizeType(field)),
                (field.defaultValue = getDefaultValue(field)),
                (modelFields[(0, lodash_1.camelCase)(key)] = field);
        });
        ejs_1.default.renderFile(path_1.default.join(__dirname, '../../templates/node/egg-model.ejs'), { modelFields, tableName: tableName, modelName: (0, lodash_1.upperFirst)((0, lodash_1.camelCase)(tableName)) + 'Model' }, {}, function (err, str) {
            console.log('err:', err);
            fs_1.default.writeFileSync(path_1.default.join(dir, `${tableName}.js`), str);
            (0, success_1.default)(path_1.default.join(dir, `${tableName}.js`));
            sequelize.close();
        });
    }));
}
function generateController(tables, queryInterface, sequelize, controllerDir) {
    const dir = path_1.default.join(process.cwd(), controllerDir); //存放api文件地址
    if (!fs_1.default.existsSync(dir)) {
        // mkdir -p
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
    tables.map((tableName) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        ejs_1.default.renderFile(path_1.default.join(__dirname, '../../templates/node/egg-crud.ejs'), { tableName: tableName, urlBase: '/admin/' + tableName, controllerName: (0, lodash_1.upperFirst)((0, lodash_1.camelCase)(tableName)) }, {}, function (err, str) {
            console.log('err:', err);
            fs_1.default.writeFileSync(path_1.default.join(dir, `${tableName}.js`), str);
            (0, success_1.default)(path_1.default.join(dir, `${tableName}.js`));
            sequelize.close();
        });
    }));
}
function getSequelizeType(field) {
    let { type = '', field: fileName = '' } = field;
    if (fileName === 'id' && field.primaryKey && !field.autoIncrement) {
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
        }
        else {
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
function getDefaultValue(field) {
    let { defaultValue = '', type = '' } = field;
    if (defaultValue === 'CURRENT_TIMESTAMP') {
        defaultValue = `sequelize.literal('CURRENT_TIMESTAMP')`;
        return defaultValue;
    }
    if (field.field === 'id' && field.primaryKey && !field.autoIncrement) {
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
