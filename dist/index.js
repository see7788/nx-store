"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var webpack_1 = __importDefault(require("webpack"));
var default_1 = (function () {
    function default_1() {
        var _this = this;
        this.initConfig = function (startFile) { return new Promise(function (ok) {
            var outPath = path_1.default.join(path_1.default.dirname(startFile), 'outPath');
            _this.env = {
                outPath: outPath,
                rootPath: path_1.default.resolve(__dirname, '../'),
                outWebpackPath: path_1.default.join(outPath, 'webpack'),
                webpackOpts: [{
                        mode: 'production',
                        target: 'electron-main',
                        entry: startFile,
                        output: {
                            path: path_1.default.join(outPath, 'webpack'),
                            filename: 'index.js',
                        },
                        module: {
                            rules: [
                                {
                                    test: /\.(js|ts)$/,
                                    exclude: /node_modules/,
                                    loader: 'babel-loader',
                                    options: {
                                        presets: ["@babel/preset-typescript"],
                                        plugins: [
                                            ["@babel/plugin-proposal-class-properties", { "loose": true }],
                                        ],
                                        cacheDirectory: true,
                                    },
                                }
                            ],
                        },
                        plugins: [
                            new webpack_1.default.NamedModulesPlugin(),
                        ]
                    }],
            };
            ok();
        }).then(function () { return _this.otherConfig; }); };
        this.otherConfig = function (opt) { return _this.otherConfig; };
        this.pack = function (_a) {
            var _b = _a.name, name = _b === void 0 ? 'nx' : _b, _c = _a.version, version = _c === void 0 ? '1.0.0' : _c, _d = _a.description, description = _d === void 0 ? 'nx创作，技术咨询13520521413' : _d, iconFile = _a.iconFile;
            return fs_1.default.promises.mkdir(_this.env.outPath)
                .then(function () { return fs_1.default.promises.mkdir(_this.env.outWebpackPath); })
                .then(function () { return fs_1.default.promises.writeFile(path_1.default.join(_this.env.outWebpackPath, 'package.json'), JSON.stringify({
                "name": name,
                "version": version,
                "description": description,
                "main": "./index.js",
                "builder": {
                    icon: iconFile,
                    directories: {
                        "buildResources": _this.env.outWebpackPath,
                        "output": path_1.default.join(_this.env.outPath, 'electron')
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
            }, null, "\t")); })
                .then(function () { return new Promise(function (ok, err) { return webpack_1.default(_this.env.webpackOpts, function (configErr, stats) {
                if (configErr) {
                    err('webpack opt error');
                }
                else if (stats.hasErrors()) {
                    var e = stats.toJson().errors;
                    e.forEach(function (item) { return console.log('webpack 构建执行报错 ', item); });
                    err('webpack run error ' + e.toString());
                }
                else {
                    ok();
                }
            }); }); });
        };
    }
    return default_1;
}());
exports.default = default_1;
//# sourceMappingURL=index.js.map