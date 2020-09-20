import path from 'path'
import fs from 'fs'
import rimraf from 'rimraf'
import webpack, { Configuration } from 'webpack'
import {
    build as electronbuild, createTargets as electrontype
} from 'electron-builder'
// Pick<Configuration, Exclude<keyof Configuration, 'entry'>>
interface WebpackOpt extends Configuration {
    entry: string
}
interface Env {
    indexfilePath: string,
    mainName_ext: 'index.js'

    outPathGet(dirext: 'electron' | 'web'): Promise<string>

    outPathclear(pathstr: 'electron' | 'web'): Promise<string>

    filePaths: string[]
    dirPaths: string[]
    webpackOpts: WebpackOpt[],//webpack.module.rules优先级exclude > include > test

    webPackPush(op: WebpackOpt): Promise<Env['nodeJsonSet']>
    filePathPush(...filePaths: string[]): Promise<Env['nodeJsonSet']>
    dirPathPush(...dirPaths: string[]): Promise<Env['nodeJsonSet']>

    nodeJsonSet(op: {
        name: string,
        version: string,
        description: string,
        homepage?: string,
        repository?: string
    }): Promise<Env['webpackRun']>

    webpackRun(): Promise<Env['electronBuilder']>

    electronBuilder(op: {
        buildFiles: string[],
        buildIcon: string,
        builderType: Parameters<typeof electrontype>
    }): Promise<any>
}

export const env: Env = {
    indexfilePath: '',
    webpackOpts: [],
    filePaths: [],
    dirPaths: [],
    mainName_ext: 'index.js',
    outPathGet: (dirext) => new Promise((ok, err) => {
        if (env.indexfilePath === '') {
            return err()
        }
        const v = `${path.dirname(env.indexfilePath)}_temp${dirext}`;
        ok(v)
    }),
    outPathclear: (dirext) => new Promise(async (ok, err) => {
        const v = await env.outPathGet(dirext);
        rimraf(v, e => e ? err(e) : fs.promises.mkdir(v).then(() => ok(v)))
    }),
    webPackPush: (op) => env.filePathPush(op.entry).then(() => {
        env.webpackOpts.push(op)
        return env.nodeJsonSet
    }),
    filePathPush: (...op) => env.dirPathPush(...(op.map(c => path.dirname(c))))
        .then(() => {
            env.filePaths = [...env.filePaths, ...op]
            return env.nodeJsonSet
        }),
    dirPathPush: (...op) => new Promise(ok => {
        env.dirPaths = [...env.dirPaths, ...op]
        ok(env.nodeJsonSet)
    }),
    async nodeJsonSet({
        name,
        version,
        description,
        homepage = '',
        repository = ''
    }) {
        // await fs.promises.copyFile(
        //     packagejsonPath,
        //     path.resolve(cwdPath, `package${process.hrtime().toString()}.json`)
        // )
        const cwdPath = process.cwd();
        const outDir = await env.outPathclear('web')
            .then(v => path.basename(v))
        const packagejson = path.resolve(cwdPath, 'package.json')
        const tscoinfigjson = path.resolve(cwdPath, 'tsconfig.json')
        const packsetting = {
            "name": name,
            "version": version,
            "description": description,
            "main": `./${outDir}/${env.mainName_ext}`,
            "homepage": homepage,
            //   "repository": repository,
            // "private": true,
            "license": "MIT"
        }
        const tsconfig = {
            "compilerOptions": {
                "module": "commonjs",
                //决定如何处理模块。或者是"Node"对于Node.js/io.js，或者是"Classic"（默认）
                "moduleResolution": "node",
                // 编译的目标是什么版本的
                "target": "es6",
                // 允许编译javascript文件。
                "allowJs": true,
                //生成相应的 .map文件
                "sourceMap": true,
                // 禁止any类型
                "noImplicitAny": true,
                // 生成相应的 .d.ts文件
                "declaration": true,
                //处理import * as和import default
                "esModuleInterop": true,
                //以严格模式解析并为每个源文件生成 "use strict"语句
                "alwaysStrict": true,
                //移除注释
                "removeComments": true,
                "outDir": outDir,
                // "paths": { // 指定模块的路径，和baseUrl有关联，和webpack中resolve.alias配置一样
                //     "src": [ //指定后可以在文件之直接 import * from 'src';
                //         "./src"
                //     ],
                // },
            },
            // 指定一个匹配列表（属于自动指定该路径下的所有ts相关文件）
            "include": env.filePaths.map(v => path.basename(v)),
            // 指定一个排除列表（include的反向操作）
            "exclude": [
                `${outDir}/**`,
                "node_modules/**",
            ]
        }
        return fs.promises.readFile(packagejson)
            .then((v) => fs.promises.writeFile(
                packagejson,
                JSON.stringify(
                    { ...JSON.parse(v.toString()), ...packsetting },
                    null,
                    '\r'
                )
            ))
            .then(() => fs.promises.writeFile(
                tscoinfigjson,
                JSON.stringify(tsconfig, null, '\r')
            ))
            .then(() => env.webpackRun)
    },
    webpackRun() {
        return new Promise(async (ok, err) => {
            webpack(env.webpackOpts, async (configErr, stats) => {
                if (configErr) {
                    err('webpack opt error');
                } else if (stats.hasErrors()) {
                    const e = stats.toJson().errors
                    e.forEach(item => console.log('webpack run error ', item));
                    err('webpack run error ' + e.toString())
                } else {
                    ok(env.electronBuilder)
                }
            })
        })
    },
    electronBuilder: ({
        buildIcon,
        buildFiles,
        builderType
    }) => env.outPathclear('electron')
        .then((outpath) => electronbuild({
            config: {
                "files": [...buildFiles, path.basename(path.dirname(env.indexfilePath))],
                "icon": buildIcon,
                "directories": {
                    //   "buildResources": env.tempDirGet('web'),
                    "output": outpath
                },
                "asar": false,
                "remoteBuild": false,
                "nsis": {
                    "oneClick": false,
                    "allowElevation": true,
                    "deleteAppDataOnUninstall": false,
                    "allowToChangeInstallationDirectory": true
                },
                //  extraResources: '',// 该额外的资源配置
                //  extraFiles: "",// 该额外的文件配置
            },
            //  targets: electrontype(...builderType)
        }))
}


export default (indexfilePath: string) => {
    env.indexfilePath = indexfilePath;
    return {
        dirPathPush: env.dirPathPush,
        filePathPush: env.filePathPush,
        webpackOptPush: {
            optTpl: {
                moduleRules: {
                    js: {},
                    css: {},
                    img: {},
                }
            },
            any: env.webPackPush,
            electronMain: async () => env.webPackPush({
                mode: 'production',
                target: 'electron-main',
                entry: indexfilePath,
                output: {
                    path: await env.outPathGet('web'),
                    filename: '[name].js',
                },
                module: {
                    rules: [
                        {
                            test: /\.(js|ts|tsx)$/,
                            use: 'ts-loader',
                        }
                    ],
                },
                resolve: {
                    // Add `.ts` and `.tsx` as a resolvable extension.
                    extensions: [".ts", ".tsx", ".js"]
                }
            })
        }
    }
}