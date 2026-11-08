module.exports = [
    {
        languageOptions: {
            sourceType: 'commonjs',
            globals: {
                console: 'readonly',
                process: 'readonly',
                fetch: 'readonly'
            }
        },
        rules: {
            'no-undef': 'error',
            'no-unused-vars': 'error'
        }
    }
];