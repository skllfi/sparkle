module.exports = {
  // Указываем Jest использовать ts-jest для файлов .ts и .tsx
  preset: 'ts-jest',
  // Среда, в которой будут выполняться тесты (jsdom имитирует окружение браузера)
  testEnvironment: 'jest-environment-jsdom',
  // Настройка для React Testing Library
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  // Обработка статических файлов (например, CSS, изображений)
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  // Игнорируем папки, которые не нужно тестировать
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/release/',
    '/build/',
    '/.electron/',
  ],
  // Говорим Jest, где искать тестовые файлы
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
  // Настройка для путей (alias) в проекте
  modulePaths: ['<rootDir>/src/renderer/src'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
