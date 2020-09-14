import path from 'path'
import fs from 'fs'
import rimraf from 'rimraf'
import webpack from 'webpack'
import { build } from 'electron-builder'
type TempPath = 'web' | 'electron' | 'outroot'
let envData: {
    indexfilePath: string,
    webpackOpts: webpack.Configuration[],
    outPath: (op: TempPath) => Promise<string>
} = {
    indexfilePath: '',
    webpackOpts: [],
    outPath(op) {
        return new Promise((ok, err) => {
            const root = path.dirname(envData.indexfilePath);
            if (envData.indexfilePath === '' || root === '') {
                return err('indexfilePath undefind');
            }
            if (op === 'outroot') {
                ok(root)
            } else {
                ok(path.join(root, op))
            }
        })
    }
}

function clearPath(dirName: TempPath) {
    return new Promise(async (ok, err) => {
        const p = await envData.outPath(dirName)
        rimraf(p, (e) => e ? err(e) : ok())
    })
}
function webpackRun() {
    return new Promise((ok, err) => webpack(envData.webpackOpts, (configErr, stats) => {
        if (configErr) {
            err('webpack opt error');
        } else if (stats.hasErrors()) {
            const e = stats.toJson().errors
            e.forEach(item => console.log('webpack 构建执行报错 ', item));
            err('webpack run error ' + e.toString())
        } else {
            ok()
        }
    }))
}
export async function electronInit(indexfilePath: string) {
    return new Promise(async ok => {
        envData.indexfilePath = indexfilePath;
        envData.webpackOpts = [{
            mode: 'production',
            target: 'electron-main',
            entry: indexfilePath,
            output: {
                path: await envData.outPath('web'),
                filename: 'index.js',
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
            // plugins: [
            //     new webpack.NamedModulesPlugin(),
            //     // new CopyWebpackPlugin({
            //     //     patterns: [
            //     //         // {
            //     //         //   from: env.SRCDIR,
            //     //         //   to: env.OUTDIR('srcOut/web'),
            //     //         //   globOptions: {
            //     //         //     ignore: ['**/*.ts']
            //     //         //   }
            //     //         // },
            //     //     ],
            //     // }),
            // ]
        }]
        ok({
            electronPreload,
            electronRenderer,
            electronPackRun
        })
    })
}
function electronPreload(filePath: string) {
    return new Promise(ok => ok(electronPreload))
}

function electronRenderer(filePath: string) {
    return new Promise(ok => ok(electronRenderer))
}

async function electronPackRun({
    name,
    version,
    description = 'nx创作，技术咨询13520521413',
    iconFile,
    electronBulidOpt,
}: {
    name: string,
    version: string,
    description: string,
    iconFile: string,
    electronBulidOpt:Parameters<typeof build>
}) {
    const webPath =await envData.outPath('web');
    const electronPath =await envData.outPath('electron');
    return clearPath('outroot')
        .then(() => fs.promises.mkdir(webPath))
        .then(() => fs.promises.mkdir(electronPath))
        .then(() => fs.promises.writeFile(
            path.join(webPath, 'package.json'),
            JSON.stringify({
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
                    // directories: {
                    //     // app: path.join(__dirname, TEMPDIR),
                    //     buildResources: path.join(__dirname, env.STATICDIR),
                    //     output: path.join(__dirname, env.PACKDIR),
                    // },
                    // mac: {
                    //     target: ["zip"],
                    //     icon: ICO('icon.icns'),
                    // },
                    // "default" | "zip" | "7z" | "dmg" | "mas" | "mas-dev" | "pkg" |
                    // "tar.xz" | "tar.lz" | "tar.gz" | "tar.bz2" | "dir" | TargetConfiguration”
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
                    // afterPack(packer) {
                    //     console.log(packer);
                    // }
                }
            }))
        )
        .then(() => webpackRun())
        .then(()=>build(...electronBulidOpt))
}