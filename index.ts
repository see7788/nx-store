import path from 'path'
import fs from 'fs'
import rimraf from 'rimraf'
import webpack, { Configuration } from 'webpack'
import {
    build as electronBuilder,
    createTargets as electronTargets
} from 'electron-builder'
// vue(op: ResolvePublic & {}): Promise<any>
// React(op: ResolvePublic & {}): Promise<any>
// Angular(op: ResolvePublic & {}): Promise<any>
// Avalon(op: ResolvePublic & {}): Promise<any>
// QucikUI(op: ResolvePublic & {}): Promise<any>
// Layui(op: ResolvePublic & {}): Promise<any>
interface EnvFunction {
    tempDirGet(dirext: 'electron' | 'web'): Promise<string>
    tempDirclear(pathstr: 'electron' | 'web'): Promise<string>
    pushWebPackOpt(op: Configuration): Promise<EnvFunction['buildWeb']>
    buildWeb(op: {
        name: string,
        version: string,
        description: string
    }): Promise<EnvFunction['buildExe']>
    buildExe(op: {
        buildFiles: string,
        buildIcon: string
    }): Promise<void>
}
interface Env extends EnvFunction {
    indexfilePath: string,
    mainName_ext: 'main.js'
    webpackOpts: Configuration[],
}
const env: Env = {
    indexfilePath: '',
    mainName_ext: 'main.js',
    webpackOpts: [],
    pushWebPackOpt: (op) => new Promise(ok => {
        env.webpackOpts.push(op)
        ok(env.buildWeb)
    }),
    tempDirGet: (dirext) => new Promise((ok, err) => {
        if (env.indexfilePath === '') {
            return err()
        }
        const v = `${path.dirname(env.indexfilePath)}_temp${dirext}`;
        ok(v)
    }),
    tempDirclear: (dirext) => new Promise(async (ok, err) => {
        const v = await env.tempDirGet(dirext);
        rimraf(v, e => e ? err(e) : fs.promises.mkdir(v).then(() => ok(v)))
    }),
    buildWeb({
        name,
        version,
        description
    }) {
        return new Promise(async (ok, err) => {
            const cwdDir = process.cwd();
            const webDir = await env.tempDirclear('web')
            return webpack(env.webpackOpts, async (configErr, stats) => {
                if (configErr) {
                    err('webpack opt error');
                } else if (stats.hasErrors()) {
                    const e = stats.toJson().errors
                    e.forEach(item => console.log('webpack 构建执行报错 ', item));
                    err('webpack run error ' + e.toString())
                } else {
                    await fs.promises.copyFile(
                        path.resolve(cwdDir, 'package.json'),
                        path.resolve(cwdDir, `package${process.hrtime().toString()}.json`)
                    )
                    await fs.promises.writeFile(
                        path.join(cwdDir, 'package.json'),
                        JSON.stringify({
                            "name": name,
                            "version": version,
                            "description": description,
                            "main": `./${webDir.replace(process.cwd(), '')}/${env.mainName_ext}`,
                            "homepage": "",
                            "repository": "",
                            "private": true,
                            "license": "MIT",
                            "author": {
                                "name": "Mr FANG",
                                "email": "diyya@q.com",
                                "url": "https://see7788.com"
                            }
                        }))
                    return ok(env.buildExe)
                }
            })
        })
    },
    buildExe: ({ buildIcon, buildFiles }) => new Promise(async ok => {
        const electronDir = await env.tempDirclear('electron')
        const buildConfig = {
            "author": { // 联系方式
                "name": "",
                "email": "",
                "url": "",
            },
            "files": buildFiles,
            "icon": buildIcon,
            "directories": {
                //   "buildResources": env.tempDirGet('web'),
                "output": electronDir
            },
            "asar": false,
            "remoteBuild": false,
            "nsis": {
                "oneClick": false,
                "allowElevation": true,
                "deleteAppDataOnUninstall": false,
                "allowToChangeInstallationDirectory": true
            },
            "win": {
                "target": [
                    {
                        "target": "nsis",
                        "arch": [
                            "x64",
                            "ia32"
                        ]
                    }
                ]
            }
        }
        return electronBuilder({ config: {} })
    })

}

export default (indexfilePath: string) => {
    env.indexfilePath = indexfilePath;
    return {
        pushAny: env.pushWebPackOpt,
        pushElectron: async () => env.pushWebPackOpt({
            mode: 'production',
            target: 'electron-main',
            entry: env.indexfilePath,
            output: {
                path: await env.tempDirGet('web'),
                filename: env.mainName_ext,
            },
            module: {
                rules: [
                    {
                        test: /\.(js|ts)$/,
                        exclude: /node_modules/,
                        loader: 'babel-loader',
                        // options: {
                        //     presets: ["@babel/preset-typescript"],
                        //     plugins: [
                        //         ["@babel/plugin-proposal-class-properties", { "loose": true }],
                        //     ],
                        //     cacheDirectory: true,
                        // },
                    }
                ],
            },
        })
    }
}