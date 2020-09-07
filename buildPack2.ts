// import path from 'path';
// import webpack from 'webpack'
// import env from './base/db/env'
// import rimraf from 'rimraf'
// import { merge } from 'webpack-merge'
// import builder from 'electron-builder'
// import CopyWebpackPlugin from 'copy-webpack-plugin'
// const resolve = (dir: string) => path.join(__dirname, dir)
// export default class {
//     baseOpt = {
//         //  externals:[...Object.keys(process.env['npm_package_dependencies']||{})],
//         resolve: {
//             alias: {
//                 '@root': resolve('..'),
//             },
//             extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
//         },
//     }
//     mainOpt = () => merge(this.baseOpt, {
//         target: 'electron-main',
//         entry: resolve('../src/main/main.js'),
//         output: {
//             path: resolve('../src/main'),
//             filename: 'bundle.js',
//         },
//         node: {
//             __dirname: false,
//             __filename: false,
//         },
//         module: {
//             rules: [
//                 {
//                     test: /\.(js|ts)$/,
//                     exclude: /node_modules/,
//                     loader: 'babel-loader',
//                     options: {
//                         presets: ["@babel/preset-typescript"],
//                         plugins: [
//                             ["@babel/plugin-proposal-class-properties", { "loose": true }],
//                         ],
//                         cacheDirectory: true,
//                     },
//                 }
//             ],
//         },
//         resolve: {
//             alias: {
//                 '@main': resolve('../src/main'),
//             },
//         },
//     })
//     renderOpt = () => {
//         const lessModuleRegex = /\.(mod|module).less$/;
//         // antd@4 下报错
//         // const lessNormalRegex = new RegExp(`(\\.normal\\.less$)|(ode_modules\\${path.sep}antd)`);
//         const getStyleLoaders = (mod = false) => [
//             'style-loader',
//             {
//                 loader: 'css-loader',
//                 options: {
//                     modules: mod ? { localIdentName: '[path][name]__[local]' } : undefined,
//                 }
//             },
//             {
//                 loader: 'less-loader',
//                 options: {
//                     lessOptions: { javascriptEnabled: true },
//                 },
//             },
//         ];
//         return merge(this.baseOpt, {
//             target: 'electron-renderer',
//             entry: resolve('../src/render/main.tsx'),
//             output: {
//                 path: resolve('../src/dist'),
//                 filename: 'bundle.js',
//             },
//             module: {
//                 rules: [
//                     {
//                         test: /\.(js|jsx|ts|tsx)$/,
//                         exclude: /node_modules/,
//                         loader: 'babel-loader',
//                         options: {
//                             // presets 是 plugins 的集合,把很多需要转换的ES6的语法插件集合在一起，避免各种配置
//                             // presets 加载顺序和一般理解不一样 ，是倒序的
//                             presets: [
//                                 ["@babel/preset-env", {
//                                     // targets 用来指定 是转换 需要支持哪些浏览器的的支持,这个语法是参照 browserslist,
//                                     // 如果设置 browserslist 可以不设置 target
//                                     "targets": "> 0.25%, not dead",
//                                     // 这个是非常重要的一个属性，主要是用来配合@babel/polyfill ，
//                                     // 这里简单讲下，在 transform-runtime 和 polyfill 差别的环节重点讲,
//                                     // 有 false,entry,usage,默认是 false 啥子也不干，
//                                     // 为 entry，项目中 main.js 主动引入 @babel/polyfill , 会把所有的 polyfill 都引入，
//                                     // 为 usage main.js 主动引入 @babel/polyfill, 只会把用到的 polyfill 引入，
//                                     "useBuiltIns": "usage",
//                                     "corejs": 3,
//                                     // 默认是 false 开启后控制台会看到 哪些语法做了转换，Babel的日志信息，开发的时候强烈建议开启
//                                     // "debug": isDev,
//                                 }
//                                 ],
//                                 "@babel/preset-react",
//                                 "@babel/preset-typescript",
//                             ],
//                             // plugins 加载顺序是正序的
//                             plugins: [
//                                 // "@babel/plugin-syntax-dynamic-import",       // preset-env 中已经集成
//                                 // "@babel/plugin-proposal-object-rest-spread", // preset-env 中已经集成
//                                 "@babel/plugin-transform-runtime",
//                                 ["@babel/plugin-proposal-class-properties", { "loose": true }],
//                                 ["import", {
//                                     "libraryName": "antd",
//                                     "style": true, // or 'css'
//                                 }],
//                             ],
//                             cacheDirectory: true,
//                         },
//                     },
//                     {
//                         test: /\.css$/,
//                         use: ['style-loader', 'css-loader'],
//                     },
//                     {
//                         test: /\.less$/,
//                         exclude: lessModuleRegex,
//                         use: getStyleLoaders(),
//                     },
//                     {
//                         test: lessModuleRegex,
//                         use: getStyleLoaders(true),
//                     },
//                     {
//                         test: /\.(jpe?g|png|svg|gif)$/,
//                         loader: 'file-loader',
//                     },
//                 ],
//             },
//             resolve: {
//                 alias: {
//                     '@render': resolve('../src/render'),
//                 },
//             },
//             plugins: [
//                 new CopyWebpackPlugin({
//                     patterns: [
//                         { from: resolve('../src/render/static'), to: resolve('../src/dist/static'), },
//                     ]
//                 }),
//             ]
//         })
//     }
//     buildPack = () => builder.build({
//         config: {
//             icon: env.ICO('icon.png'),
//             directories: {
//                 "buildResources": env.OUTDIR('srcOut/web'),
//                 "output": env.OUTDIR('srcOut/electron')
//             },
//             remoteBuild: false,
//             // directories: {
//             //     // app: path.join(__dirname, TEMPDIR),
//             //     buildResources: path.join(__dirname, env.STATICDIR),
//             //     output: path.join(__dirname, env.PACKDIR),
//             // },
//             // mac: {
//             //     target: ["zip"],
//             //     icon: ICO('icon.icns'),
//             // },
//             // "default" | "zip" | "7z" | "dmg" | "mas" | "mas-dev" | "pkg" |
//             // "tar.xz" | "tar.lz" | "tar.gz" | "tar.bz2" | "dir" | TargetConfiguration”
//             dmg: {
//             },
//             win: {
//                 "target": [
//                     {
//                         "target": "nsis",
//                         "arch": ["x64", "ia32"]
//                     }
//                 ],
//             },
//             nsis: {
//                 "oneClick": false,
//                 "allowElevation": true,
//                 "deleteAppDataOnUninstall": false,
//                 "allowToChangeInstallationDirectory": true,
//                 "createDesktopShortcut": true,
//                 "createStartMenuShortcut": true
//             },
//             asar: false,
//             // afterPack(packer) {
//             //     console.log(packer);
//             // }
//         },
//         win: ['zip', 'nsis']
//     })

//     // base = ({ target, entry, outputPath, outputFileName }: Op) => webpack({
//     //     mode: 'production',
//     //     target,
//     //     entry,
//     //     output: {
//     //         filename: outputFileName,
//     //         path: outputPath
//     //     },
//     //     module: {
//     //         rules: [
//     //             {
//     //                 test: /\.tsx?$/,
//     //                 use: 'ts-loader',
//     //             },
//     //             {
//     //                 test: /\.(png|jpe?g|svg|gif|icon|ico|icns)?$/,
//     //                 use: 'file-loader',
//     //             },
//     //             {
//     //                 test: /\.css?$/,
//     //                 use: ['url-loader', 'style-loader', 'css-loader'],
//     //             },
//     //             {
//     //                 test: /\.html?$/,
//     //                 use: ['url-loader', 'html-loader'],
//     //             },
//     //         ]
//     //     },
//     //     resolve: {
//     //         extensions: ['.js', '.ts', '.json']
//     //     },
//     //     node: {
//     //       //  global: false,
//     //         __dirname: false,
//     //         __filename: false,
//     //     },
//     //     plugins: [
//     //         new CopyPlugin({
//     //             patterns: [
//     //                 {
//     //                     from: env.EDITDIR,
//     //                     to: env.TEMPDIR,
//     //                     globOptions: {
//     //                         ignore: ['**/*.ts']
//     //                     }
//     //                 },
//     //                 {
//     //                     from: path.resolve(env.EDITDIR, '../', 'package.json'),
//     //                     to: env.TEMPDIR,
//     //                 },
//     //             ],
//     //         }),
//     //     ],
//     // }).run((err, stats) => {
//     //     if (err) {
//     //         // err 对象将只包含与webpack相关的问题，例如错误配置等
//     //         console.log('webpack error config.');
//     //         return process.exit(0);
//     //     }
//     //     if (stats.hasErrors()) {
//     //         // webpack 构建报错
//     //         const json = stats.toJson();
//     //         // fs.writeFileSync(path.join(__dirname, './\.tmp/errors.json'), JSON.stringify(json, null, 2));
//     //         json.errors.forEach(item => {
//     //             console.log('webpack error ', item);
//     //         });
//     //         process.exit(0);
//     //     }
//     //     console.log('webpack success.')
//     // })
//     // main=this.base
//     // preload=this.base

// }
