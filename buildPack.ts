import path from 'path'
import webpack from 'webpack'
import { app,Notification } from 'electron';
import { build } from 'electron-builder'
import rimraf from 'rimraf';
import { merge } from 'webpack-merge';
import CopyWebpackPlugin from 'copy-webpack-plugin'
// import TerserPlugin from 'terser-webpack-plugin';// 压缩js
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
const pcTips = (
    title: string,
    body: string | object=''
) => new Promise((ok) => {
    const tip = new Notification({
        title,
        body: body ? body.toString() : '',
        timeoutType:'default',
    })
    tip.show()
    ok(tip)
    // notification.on('click', () => notification.show())
})
const externals = [...Object.keys(process.env['npm_package_dependencies'] || {})]
export default class {
  constructor(tempRootPath: string) {
    this.env = {
      rootPath:path.resolve(__dirname,'../'),
      tempPath: tempRootPath,
      tempWebpackPath:path.join(tempRootPath, 'webpack'),
      tempElectronPath: path.join(tempRootPath, 'electron')
    }
  }
  env: {
    rootPath:string
    tempPath: string
    tempWebpackPath: string
    tempElectronPath: string
  }
  private rimraf = () => new Promise((ok, err) => rimraf(
    this.env.tempPath,
    (e) => {
      if (e) {
        pcTips('rimraf  error')
        err(e)
      } else {
        pcTips('rimraf success')
        ok()
      }
    })
  )
  deltempRootPath = () => app.whenReady()
    .then(() => this.rimraf())
  webpack = (
    ...webpackOpt: webpack.Configuration[]
  ) => new Promise((ok, err) => webpack(
    [...webpackOpt],
    (configErr, stats) => {
      if (configErr) {
        err('webpack opt error');
      } else if (stats.hasErrors()) {
        const e = stats.toJson().errors
        e.forEach(item => pcTips('webpack 构建执行报错 ', item));
        err('webpack run error ' + e.toString())
      } else {
        pcTips('webpack 成功完成');
        ok()
      }
    }
  ))
  private webpackopt_public: webpack.Configuration = {
    externals,
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
        },
      ],
    },
    output: {
      path: this.env.tempWebpackPath,
      // https://github.com/webpack/webpack/issues/1114
      // libraryTarget: 'commonjs',
    },
    resolve: {
      extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
      modules: [this.env.tempWebpackPath, 'node_modules'],
    },
    plugins: [
      new webpack.NamedModulesPlugin(),
    ],
  }
  webpackopt_main = (filePath: string): webpack.Configuration => merge(
    this.webpackopt_public,
    {
      mode: 'production',
      target: 'electron-main',
      entry: filePath,
      output: {
        path: this.env.tempWebpackPath,
        filename: filePath.substring(this.env.rootPath.length),
      },
      // node: {
      //   __dirname: false,
      //   __filename: false,
      // },
      // optimization: {
      //   minimizer: [
      //     new TerserPlugin({
      //       parallel: true,
      //       sourceMap: true,
      //       cache: true,
      //     }),
      //   ]
      // },
      plugins: [
        // new CopyPlugin({
        //   patterns: [
        //     // {
        //     //   from: env.SRCDIR,
        //     //   to: env.OUTDIR('srcOut/web'),
        //     //   globOptions: {
        //     //     ignore: ['**/*.ts']
        //     //   }
        //     // },
        //     {
        //       from: 'package.json',
        //       to: env.OUTDIR('srcOut/web'),
        //     },
        //   ],
        // }),
      ]
    })
  webpackopt_preload = (filePath: string): webpack.Configuration => merge(
    this.webpackopt_public,
    {
      mode: 'production',
      target: 'electron-preload',
      entry: [
        'core-js',//
        'regenerator-runtime/runtime',// 编译的生成器和async函数的独立运行时
        filePath,
      ],
      output: {
        // publicPath: './dist/',
        path: this.env.tempWebpackPath,
        filename: filePath.substring(this.env.rootPath.length),
      },
      module: {
        rules: [
          // Extract all .global.css to style.css as is
          {
            test: /\.global\.css$/,
            use: [
              {
                loader: MiniCssExtractPlugin.loader,
                options: {
                  publicPath: './',
                },
              },
              {
                loader: 'css-loader',
                options: {
                  sourceMap: true,
                },
              },
            ],
          },
          // Pipe other styles through css modules and append to style.css
          {
            test: /^((?!\.global).)*\.css$/,
            use: [
              {
                loader: MiniCssExtractPlugin.loader,
              },
              {
                loader: 'css-loader',
                options: {
                  modules: {
                    localIdentName: '[name]__[local]__[hash:base64:5]',
                  },
                  sourceMap: true,
                },
              },
            ],
          },
          // Add SASS support  - compile all .global.scss files and pipe it to style.css
          {
            test: /\.global\.(scss|sass)$/,
            use: [
              {
                loader: MiniCssExtractPlugin.loader,
              },
              {
                loader: 'css-loader',
                options: {
                  sourceMap: true,
                  importLoaders: 1,
                },
              },
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: true,
                },
              },
            ],
          },
          // Add SASS support  - compile all other .scss files and pipe it to style.css
          {
            test: /^((?!\.global).)*\.(scss|sass)$/,
            use: [
              {
                loader: MiniCssExtractPlugin.loader,
              },
              {
                loader: 'css-loader',
                options: {
                  modules: {
                    localIdentName: '[name]__[local]__[hash:base64:5]',
                  },
                  importLoaders: 1,
                  sourceMap: true,
                },
              },
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: true,
                },
              },
            ],
          },
          // WOFF Font
          {
            test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
            use: {
              loader: 'url-loader',
              options: {
                limit: 10000,
                mimetype: 'application/font-woff',
              },
            },
          },
          // WOFF2 Font
          {
            test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
            use: {
              loader: 'url-loader',
              options: {
                limit: 10000,
                mimetype: 'application/font-woff',
              },
            },
          },
          // TTF Font
          {
            test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
            use: {
              loader: 'url-loader',
              options: {
                limit: 10000,
                mimetype: 'application/octet-stream',
              },
            },
          },
          // EOT Font
          {
            test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
            use: 'file-loader',
          },
          // SVG Font
          {
            test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
            use: {
              loader: 'url-loader',
              options: {
                limit: 10000,
                mimetype: 'image/svg+xml',
              },
            },
          },
          // Common Image Formats
          {
            test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
            use: 'url-loader',
          },
        ],
      },
      optimization: {
        minimizer: [
          // new TerserPlugin({
          //   parallel: true,
          //   sourceMap: true,
          //   cache: true,
          // }),
          new OptimizeCSSAssetsPlugin({
            cssProcessorOptions: {
              map: {
                inline: false,
                annotation: true,
              },
            },
          }),
        ]
      },
      plugins: [
        new MiniCssExtractPlugin({
          filename: 'style.css',
        }),
      ],
    })
  electronbuilder = (iconPath: string) => build({
    config: {
      icon: iconPath,
      directories: {
        "buildResources":this.env.tempWebpackPath,
        "output": this.env.tempElectronPath
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
    },
    win: ['zip', 'nsis']
  })
}
