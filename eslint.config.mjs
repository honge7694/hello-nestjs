// @ts-check
import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	{
		ignores: ['eslint.config.mjs'],
	},
	eslint.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,
	{
		languageOptions: {
			globals: {
				...globals.node,
				...globals.jest,
			},
			sourceType: 'module',
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		rules: {
			// 사용자 지정 규칙 반영
			'no-console': 'error',
			indent: ['error', 'tab', { SwitchCase: 1 }],
			semi: ['error', 'always'],
			'array-element-newline': [
				'error',
				{
					ArrayExpression: { multiline: true, minItems: 3 },
				},
			],
			quotes: [2, 'single', { avoidEscape: false }],
			eqeqeq: [2, 'allow-null'],
			'padding-line-between-statements': ['error', { blankLine: 'always', prev: '*', next: 'return' }],
			'no-empty': ['error', { allowEmptyCatch: false }],
			'eol-last': 2,
			camelcase: ['error', { properties: 'never' }],
			'space-in-parens': [2, 'never'],
			'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
			'space-before-blocks': [2, 'always'],
			'brace-style': [2, '1tbs', { allowSingleLine: true }],

			// TypeScript 관련 규칙
			'@typescript-eslint/explicit-function-return-type': 2,
			'@typescript-eslint/explicit-module-boundary-types': 0,
			'@typescript-eslint/no-explicit-any': 0,
			'@typescript-eslint/no-floating-promises': 'warn',
			'@typescript-eslint/no-unsafe-argument': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					ignoreRestSiblings: true,
				},
			],

			// 레이아웃 및 포맷팅 (제공해주신 규칙)
			'function-paren-newline': ['error', 'consistent'],
			'object-property-newline': ['error', { allowAllPropertiesOnSameLine: false }],
			'object-curly-newline': [
				'error',
				{
					ObjectExpression: { multiline: true, minProperties: 3 },
					ObjectPattern: { multiline: true },
					ImportDeclaration: { multiline: true, minProperties: 5 },
					ExportDeclaration: { multiline: true, minProperties: 3 },
				},
			],
			'object-curly-spacing': ['error', 'always'],
			'function-call-argument-newline': ['error', 'never'],
			'comma-dangle': ['error', 'always-multiline'],
			'max-len': [2, 200, 4, { ignoreUrls: true }],
		},
	},
);
