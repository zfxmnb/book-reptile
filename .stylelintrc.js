module.exports = {
  processors: [],
  plugins: [],
  extends: [
    'stylelint-config-standard',
    'stylelint-config-rational-order',
    'stylelint-prettier/recommended'
  ], // 这是官方推荐的方式
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['extends', 'ignores']
      }
    ],
    indentation: 2,
    'unit-allowed-list': ['em', 'rem', 's', '%', 'px'],
    'block-closing-brace-newline-after': 'always'
  },
  ignoreFiles: ['node_modules/**']
};
