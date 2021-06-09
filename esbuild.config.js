const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/utils.js'],
  bundle: true,
  target: ['chrome58'],
  // platform: 'node',
  // loader: { '.js': 'jsx' }, // 默认使用 js loader ,手动改为 jsx-loader
  outfile: 'dist/utils.js',
  minify: true,
  tsconfig: 'tsconfig.json'
});
