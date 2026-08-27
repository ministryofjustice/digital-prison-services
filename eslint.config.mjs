import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'

export default [
    {
        ignores: [
            'node_modules/**',
            'build/**',
            'internals/**',
            'public/**',
            'docs/**',
            'bin/**',
            'static/**',
            'dist/**',
            'coverage/**',
            'integration-tests/mockApis/responses/**',

            'audit-ci.json',
            'package.json',
            'package-lock.json',

            'cypress.config.js',
            'cypress-reporter-config.json',
        ],
    },

    ...hmppsConfig(),

    // Legacy React JS files
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                location: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                fetch: 'readonly',
                alert: 'readonly',
            },
        },
    },

    // Cypress globals
    {
        files: ['cypress/**/*.js', 'integration-tests/**/*.js'],
        languageOptions: {
            globals: {
                cy: 'readonly',
                Cypress: 'readonly',
            },
        },
    },

    // TypeScript compatibility with previous config
    {
        files: ['**/*.ts', '**/*.tsx'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-require-imports': 'off',
        },
    },

    // Allow dev dependencies in test/config files
    {
        files: [
            'webpack.config.js',
            'cypress.config.js',
            'config/**/*.js',
            'scripts/**/*.js',
            '**/*.test.js',
            '**/*.test.ts',
        ],
        rules: {
            'import/no-extraneous-dependencies': [
                'error',
                {
                    devDependencies: true,
                },
            ],
        },
    },

    // Preserve behaviour from previous ESLint configuration
    {
        rules: {
            camelcase: 'off',

            'default-param-last': 'off',
            'no-promise-executor-return': 'off',
            'class-methods-use-this': 'off',

            'no-restricted-exports': 'off',
            'import/no-import-module-exports': 'off',

            'react/jsx-props-no-spreading': 'off',
            'react/forbid-prop-types': 'off',

            'import/no-named-as-default': 'off',
            'import/no-named-as-default-member': 'off',

            'no-underscore-dangle': [
                'error',
                {
                    allow: ['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'],
                },
            ],
        },
    },
]