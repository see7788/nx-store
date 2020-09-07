// import gulp from 'gulp'
// import path from 'path'
// import ts from 'gulp-typescript' // uglify支持
// import { build as electronBuild } from "electron-builder"
// import electronPack from 'electron-packager'
// // import child_process from 'child_process'
// import { env ,electronBuildOpts} from './src/base/db/config'
// // process.on('unhandledRejection', (reason, p) => {
// //     console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
// //     // application specific logging, throwing an error, or other logic here
// // });

// const { EDITDIR, STATICDIR, TEMPDIR, PACKDIR, ICO } = env
// const staticAllCopy = () => gulp
//     .src(['html', 'js', 'css'].map((v) => `${EDITDIR}/**/*.${v}`), { base: EDITDIR })
//     .pipe(gulp.dest(TEMPDIR));
// // const packageCopy = () => createReadStream('package.json').pipe(
// //     createWriteStream(path.join(TEMPDIR,'package.json'))
// // );
// const tsProject = ts.createProject('tsconfig.json')
// const tsFun = (str: string) => gulp
//     .src([str], { base: EDITDIR })
//     .pipe(tsProject())
//     .js.pipe(gulp.dest(TEMPDIR))
// const tsAllCopy = () => tsFun(`${EDITDIR}/**/*.ts`)

// exports.electronBuild = gulp.series(
//     staticAllCopy,
//     tsAllCopy,
//     () => electronBuild({
//         config: electronBuildOpts(),
//         win: ['zip', 'nsis']
//     }).then(console.log).catch(console.log)
// )
// exports.electronPack = gulp.series(
//     staticAllCopy,
//     tsAllCopy,
//     () => electronPack({
//         asar: true,
//         overwrite: true,
//         extraResource: STATICDIR,
//         dir: TEMPDIR,
//         out: PACKDIR,
//         icon: ICO('icon.ico')
//     })
// );

// // "build": {
// //     "productName": "nx",
// //     "extraResources": [
// //       "static/icon/"
// //     ],
// //     "files": [
// //       "srcTemp/**/*"
// //     ],
// //     "directories": {
// //       "buildResources": "srcTemp",
// //       "output": "srcBuildPack"
// //     },
// //     "asar": true,
// //     "nsis": {
// //       "oneClick": false,
// //       "allowElevation": true,
// //       "allowToChangeInstallationDirectory": true,
// //       "installerIcon": "static/icon/icon.ico",
// //       "uninstallerIcon": "static/icon/icon.ico",
// //       "installerHeaderIcon": "static/icon/icon.ico",
// //       "createDesktopShortcut": true,
// //       "createStartMenuShortcut": true
// //     },
// //     "win": {
// //       "icon": "static/icon/icon.ico",
// //       "target": [ "nsis",  "zip"]
// //     },
// //     "mac": {
// //       "icon": "static/icon/icon.icns",
// //       "target": [
// //         "dmg",
// //         "zip"
// //       ]
// //     },
// //     "linux": {
// //       "icon": "static/icon/icon.png"
// //     },
// //     "dmg": {
// //       "contents": [
// //         {
// //           "x": 410,
// //           "y": 150,
// //           "type": "link"
// //         },
// //         {
// //           "x": 130,
// //           "y": 150,
// //           "type": "file"
// //         }
// //       ]
// //     }
// //   },