"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.electronInit = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const rimraf_1 = __importDefault(require("rimraf"));
const webpack_1 = __importDefault(require("webpack"));
const electron_builder_1 = require("electron-builder");
let envData = {
    indexfilePath: '',
    webpackOpts: [],
    outPath(op) {
        return new Promise((ok, err) => {
            const root = path_1.default.dirname(envData.indexfilePath);
            if (envData.indexfilePath === '' || root === '') {
                return err('indexfilePath undefind');
            }
            if (op === 'outroot') {
                ok(root);
            }
            else {
                ok(path_1.default.join(root, op));
            }
        });
    }
};
function clearPath(dirName) {
    return new Promise((ok, err) => __awaiter(this, void 0, void 0, function* () {
        const p = yield envData.outPath(dirName);
        rimraf_1.default(p, (e) => e ? err(e) : ok());
    }));
}
function webpackRun() {
    return new Promise((ok, err) => webpack_1.default(envData.webpackOpts, (configErr, stats) => {
        if (configErr) {
            err('webpack opt error');
        }
        else if (stats.hasErrors()) {
            const e = stats.toJson().errors;
            e.forEach(item => console.log('webpack 构建执行报错 ', item));
            err('webpack run error ' + e.toString());
        }
        else {
            ok();
        }
    }));
}
function electronInit(indexfilePath) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((ok) => __awaiter(this, void 0, void 0, function* () {
            envData.indexfilePath = indexfilePath;
            envData.webpackOpts = [{
                    mode: 'production',
                    target: 'electron-main',
                    entry: indexfilePath,
                    output: {
                        path: yield envData.outPath('web'),
                        filename: 'index.js',
                    },
                    module: {
                        rules: [
                            {
                                test: /\.(js|ts)$/,
                                exclude: /node_modules/,
                                loader: 'babel-loader',
                            }
                        ],
                    },
                }];
            ok({
                electronPreload,
                electronRenderer,
                electronPackRun
            });
        }));
    });
}
exports.electronInit = electronInit;
function electronPreload(filePath) {
    return new Promise(ok => ok(electronPreload));
}
function electronRenderer(filePath) {
    return new Promise(ok => ok(electronRenderer));
}
function electronPackRun({ name, version, description = 'nx创作，技术咨询13520521413', iconFile, electronBulidOpt, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const webPath = yield envData.outPath('web');
        const electronPath = yield envData.outPath('electron');
        return clearPath('outroot')
            .then(() => fs_1.default.promises.mkdir(webPath))
            .then(() => fs_1.default.promises.mkdir(electronPath))
            .then(() => fs_1.default.promises.writeFile(path_1.default.join(webPath, 'package.json'), JSON.stringify({
            "name": name,
            "version": version,
            "description": description,
            "main": "./index.js",
            "builder": {
                icon: iconFile,
                directories: {
                    "buildResources": webPath,
                    "output": electronPath
                },
                remoteBuild: false,
                win: {
                    "target": [
                        {
                            "target": "nsis",
                            "arch": ["x64", "ia32"]
                        }
                    ],
                },
                nsis: {
                    "oneClick": false,
                    "allowElevation": true,
                    "deleteAppDataOnUninstall": false,
                    "allowToChangeInstallationDirectory": true,
                },
                asar: false,
            }
        })))
            .then(() => webpackRun())
            .then(() => electron_builder_1.build(...electronBulidOpt));
    });
}
//# sourceMappingURL=index.js.map