// https://eslint.org/docs/user-guide/configuring

module.exports = {
  // https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
  root: true,
  // https://eslint.org/docs/user-guide/configuring#specifying-parser
  parser: 'babel-eslint',
  // https://eslint.org/docs/user-guide/configuring#specifying-parser-options
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
  // https://eslint.org/docs/user-guide/configuring#specifying-environments
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  // https://github.com/standard/eslint-config-standard
  // https://github.com/xjamundx/eslint-plugin-standard
  extends: 'standard',
  // https://eslint.org/docs/user-guide/configuring#configuring-plugins
  plugins: [
    // https://github.com/benmosher/eslint-plugin-import
    'import',
    // https://github.com/BenoitZugmeyer/eslint-plugin-html
    'html',
    // https://github.com/mysticatea/eslint-plugin-node
    'node',
    // https://github.com/xjamundx/eslint-plugin-promise
    'promise',
  ],
  // the additional global variables your script accesses during execution
  globals: {
    App: true,
    Page: true,
    Component: true,
    Behavior: true,
    wx: true,
    getApp: true,
    getCurrentPages: true,
    requirePlugin: true,
  },
  // https://eslint.org/docs/rules/
  rules: {
    'camelcase': 0,
    'comma-dangle': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'no-new': 0,
    'no-return-await': 0,
    'prefer-promise-reject-errors': 0,
    // ...
  },
  settings: {
    'html/html-extensions': ['.html', '.wpy'],
  },
}
