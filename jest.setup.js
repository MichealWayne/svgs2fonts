// Jest setup file for svgs2fonts
// This file is run once before all tests

// Set test environment variables
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  // Restore original console methods before each test
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test utilities
global.testUtils = {
  mockConsole: () => {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  },
  restoreConsole: () => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  },
};
