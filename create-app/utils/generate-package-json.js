module.exports = function generatePackageJson(options) {
  const {
    type, name, framework, bundler, cssPreProcessor, cordova, theming,
  } = options;

  // Dependencies
  const dependencies = [
    'framework7',
    'dom7',
    'template7',
    ...(theming.iconFonts ? [
      'framework7-icons',
    ] : []),
    ...(framework === 'vue' ? [
      'framework7-vue',
      'vue',
    ] : []),
    ...(framework === 'react' ? [
      'framework7-react',
      'react',
      'react-dom',
      'prop-types',
    ] : []),
  ];

  const devDependencies = [];
  if (bundler === 'webpack') {
    devDependencies.push(...[
      '@babel/core',
      '@babel/plugin-syntax-dynamic-import',
      '@babel/plugin-transform-runtime',
      '@babel/preset-env',
      '@babel/runtime',
      'babel-loader',
      'chalk',
      ...(type.indexOf('cordova') >= 0 && cordova.platforms.indexOf('electron') >= 0 ? [
        'concurrently',
      ] : []),
      'copy-webpack-plugin',
      'cross-env',
      'css-loader',
      'file-loader',
      'html-webpack-plugin',
      'mini-css-extract-plugin',
      'optimize-css-assets-webpack-plugin',
      'ora',
      'postcss-loader',
      'postcss-preset-env',
      'rimraf',
      'style-loader',
      ...(cssPreProcessor === 'stylus' ? [
        'stylus',
        'stylus-loader',
      ] : []),
      ...(cssPreProcessor === 'less' ? [
        'less',
        'less-loader',
      ] : []),
      ...(cssPreProcessor === 'scss' ? [
        'node-sass',
        'sass-loader',
      ] : []),
      'uglifyjs-webpack-plugin',
      'url-loader',
      'webpack',
      'webpack-cli',
      'webpack-dev-server',
      ...(type.indexOf('pwa') >= 0 ? [
        'workbox-webpack-plugin',
      ] : []),
      ...(framework === 'core' ? [
        'framework7-component-loader',
      ] : []),
      ...(framework === 'react' ? [
        '@babel/preset-react',
      ] : []),
      ...(framework === 'vue' ? [
        'babel-helper-vue-jsx-merge-props',
        'babel-plugin-transform-vue-jsx@next',
        '@babel/plugin-syntax-jsx',
        'vue-loader',
        'vue-style-loader',
        'vue-template-compiler',
      ] : []),
    ]);
  }
  if (bundler !== 'webpack') {
    devDependencies.push('http-server');
  }
  if (!bundler && type.indexOf('cordova') >= 0) {
    devDependencies.push(...[
      'cpy',
      'rimraf',
    ]);
  }
  if (theming.iconFonts) {
    devDependencies.push('cpy-cli');
  }

  // Scripts
  const scripts = {};
  const postInstall = [];
  if (bundler === 'webpack') {
    scripts['build-dev'] = 'cross-env NODE_ENV=development node ./build/build.js';
    scripts['build-prod'] = 'cross-env NODE_ENV=production node ./build/build.js';
    if (type.indexOf('cordova') >= 0) {
      scripts['build-cordova-dev'] = 'cross-env TARGET=cordova cross-env NODE_ENV=development node ./build/build.js && cd cordova && cordova build';
      scripts['build-cordova-prod'] = 'cross-env TARGET=cordova cross-env NODE_ENV=production node ./build/build.js && cd cordova && cordova build';
      if (cordova.platforms.length > 1 && cordova.platforms.indexOf('ios') >= 0) {
        scripts['build-cordova-ios-dev'] = 'cross-env TARGET=cordova cross-env NODE_ENV=development node ./build/build.js && cd cordova && cordova build ios';
        scripts['build-cordova-ios-prod'] = 'cross-env TARGET=cordova cross-env NODE_ENV=production node ./build/build.js && cd cordova && cordova build ios';
      }
      if (cordova.platforms.length > 1 && cordova.platforms.indexOf('android') >= 0) {
        scripts['build-cordova-android-dev'] = 'cross-env TARGET=cordova cross-env NODE_ENV=development node ./build/build.js && cd cordova && cordova build android';
        scripts['build-cordova-android-prod'] = 'cross-env TARGET=cordova cross-env NODE_ENV=production node ./build/build.js && cd cordova && cordova build android';
      }
      if (cordova.platforms.length > 1 && cordova.platforms.indexOf('electron') >= 0) {
        // eslint-disable-next-line
        scripts['build-cordova-electron-dev'] = 'cross-env TARGET=cordova cross-env NODE_ENV=development node ./build/build.js && cd cordova && cordova build electron';
        scripts['build-cordova-electron-prod'] = 'cross-env TARGET=cordova cross-env NODE_ENV=production node ./build/build.js && cd cordova && cordova build electron';
      }
      if (cordova.platforms.indexOf('electron') >= 0) {
        scripts['cordova-electron'] = 'cross-env TARGET=cordova cross-env NODE_ENV=development node ./build/build.js && concurrently --kill-others "cross-env TARGET=cordova cross-env ELECTRON_WATCH=true cross-env NODE_ENV=development cross-env webpack --progress --config ./build/webpack.config.js --watch" "cd cordova && cordova run electron --nobuild"';
      }
    }
    scripts.dev = 'cross-env NODE_ENV=development webpack-dev-server --config ./build/webpack.config.js';
    scripts.start = 'npm run dev';
  }
  if (!bundler) {
    scripts.serve = 'http-server ./www/ -o -c 1 -a localhost -p 8080';
    scripts.start = 'npm run serve';
    if (type.indexOf('cordova') >= 0) {
      scripts['build-cordova'] = 'node ./build/build.js && cd cordova && cordova build';
      if (cordova.platforms.length > 1 && cordova.platforms.indexOf('ios') >= 0) {
        scripts['build-cordova-ios'] = 'node ./build/build.js && cd cordova && cordova build ios';
      }
      if (cordova.platforms.length > 1 && cordova.platforms.indexOf('android') >= 0) {
        scripts['build-cordova-android'] = 'node ./build/build.js && cd cordova && cordova build android';
      }
      if (cordova.platforms.length > 1 && cordova.platforms.indexOf('electron') >= 0) {
        scripts['build-cordova-electron'] = 'node ./build/build.js && cd cordova && cordova build electron';
      }
      if (cordova.platforms.indexOf('electron') >= 0) {
        scripts['cordova-electron'] = 'node ./build/build.js && cd cordova && cordova run electron --nobuild';
      }
    }
  }

  if (theming.iconFonts) {
    postInstall.push(`cpy './node_modules/framework7-icons/fonts/*.*' './${bundler ? 'src' : 'www'}/fonts/'`);
  }

  if (postInstall.length) {
    scripts.postinstall = postInstall.join(' && ');
  }

  // Content
  const content = `
{
  "name": "${name.toLowerCase().replace((/[ ]{2,}/), ' ').replace(/ /g, '-')}",
  "private": true,
  "version": "1.0.0",
  "description": "${name}",
  "repository" : "",
  "license" : "UNLICENSED",
  "framework7": ${JSON.stringify(options)},
  "scripts" : ${JSON.stringify(scripts)},
  "browserslist": [
    "Android >= 5",
    "IOS >= 9.3",
    "Edge >= 15",
    "Safari >= 9.1",
    "Chrome >= 49",
    "Firefox >= 31",
    "Samsung >= 5"
  ],
  "dependencies": {},
  "devDependencies": {}
}
`.trim();

  return {
    content,
    dependencies,
    devDependencies,
    postInstall,
  };
};
