export default {
  clearMocks: true,
  collectCoverageFrom: ['**/*.ts', '!**/*.test.ts'],
  coverageDirectory: '../coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/', '/@types/'],
  coverageReporters: ['lcov', 'text', 'text-summary'],
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: 'tsconfig.test.json',
    },
  },
  moduleNameMapper: { '~/(.*)$': '<rootDir>/$1' },
  preset: 'ts-jest/presets/default-esm',
  rootDir: 'src',
};
