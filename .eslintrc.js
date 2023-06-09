module.exports = {
	env: {
		commonjs: true,
		es2021: true,
		node: true,
		jest: true,
	},
	extends: ['eslint:recommended', 'prettier'],
	overrides: [],
	parserOptions: {
		ecmaVersion: 'latest',
	},
	rules: {
		indent: ['error', 'tab'],
		'linebreak-style': ['error', 'unix'],
		quotes: ['error', 'single'],
		semi: ['error', 'never'],
	},
}
