import parentc from './buildPack'
import path from 'path'
import webpack from 'webpack'
import { app,Notification } from 'electron';
import { build } from 'electron-builder'
import rimraf from 'rimraf';
import { merge } from 'webpack-merge';
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
export default class {
    constructor(tempRootPath: string) {
        this.env = {
            rootPath: path.resolve(__dirname, '../'),
            tempPath: tempRootPath,
            tempWebpackPath: path.join(tempRootPath, 'webpack'),
            tempElectronPath: path.join(tempRootPath, 'electron')
        }
    }
    env: {
        rootPath: string
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