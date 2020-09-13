import path from 'path'
import fs from 'fs'
import webpack from 'webpack'
import { build } from 'electron-builder'
interface PackjsonOpt {
    name?: string,
    version: string,
    description?: string,
    iconFile: string
}
export default class {
    private env: {
        outPath: string
        rootPath: string
        outWebpackPath: string
        webpackOpts: webpack.Configuration[],
    }
    // private clearPath = () => new Promise((ok, err) => rimraf(this.env.outPath, (e) => {
    //     if (e) {
    //         err(e)
    //     } else {
    //         ok()
    //     }
    // })).then(() => fs.promises.mkdir(this.env.outPath))
    electronMain = (
        startFile: string
    ) => new Promise(ok => {
        const outPath = path.join(path.dirname(startFile), 'outPath')
        this.env = {
            outPath,
            rootPath: path.resolve(__dirname, '../'),
            outWebpackPath: path.join(outPath, 'webpack'),
            webpackOpts: [{
                mode: 'production',
                target: 'electron-main',
                entry: startFile,
                output: {
                    path: path.join(outPath, 'webpack'),
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
            }],
        }
        ok()
    })
    electronPreload = (opt: {
        preloadFile?: string,
        rendererFile?: string
    }) => this.electronPreload

    electronRenderer = (opt: {
        preloadFile?: string,
        rendererFile?: string
    }) => this.electronRenderer

    pack = ({
        name = 'nx',
        version = '1.0.0',
        description = 'nx创作，技术咨询13520521413',
        iconFile
    }: PackjsonOpt) => fs.promises.mkdir(this.env.outPath)// this.clearPath()
        .then(() => fs.promises.mkdir(this.env.outWebpackPath))
        .then(() => fs.promises.writeFile(
            path.join(this.env.outWebpackPath, 'package.json'),
            JSON.stringify({
                "name": name,
                "version": version,
                "description": description,
                "main": "./index.js",
                "builder": {
                    icon: iconFile,
                    directories: {
                        "buildResources": this.env.outWebpackPath,
                        "output": path.join(this.env.outPath, 'electron')
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
        .then(() => new Promise((ok, err) => webpack(this.env.webpackOpts, (configErr, stats) => {
            if (configErr) {
                err('webpack opt error');
            } else if (stats.hasErrors()) {
                const e = stats.toJson().errors
                e.forEach(item => console.log('webpack 构建执行报错 ', item));
                err('webpack run error ' + e.toString())
            } else {
                ok()
            }
        })))
    //.then(() => build)
}