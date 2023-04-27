module.exports = {
    globals: {
        __DEV__: true
    },
    coverageDirectory: 'coverage',
    coverageReporters: ['html', 'lcov', 'text'],
    collectCoverageFrom: ['packages/*/src/**/*.js'],
    moduleFileExtensions: ['js', 'json'],
    moduleNameMapper: {
        '^@tencent/(.*?)$': '<rootDir>/packages/$1'
    },
    rootDir: __dirname,
    testMatch: ['<rootDir>/packages/**/__tests__/**/*spec.(t|j)s']
}
