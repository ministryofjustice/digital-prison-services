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
        ],
    },

    ...hmppsConfig(),
]