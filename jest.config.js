// jest.config.js
module.exports = {
    preset: 'jest-expo',
    rootDir: '.',
    setupFiles: ['<rootDir>/jest.setup.js'],
    transformIgnorePatterns: [
        "node_modules/(?!(@react-native|react-native|expo|expo-modules-core)/)",
    ],
    setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    moduleNameMapper: {
        '@firebase$': '<rootDir>/firebase.ts',
    }
};
