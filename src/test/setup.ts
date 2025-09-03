import '@testing-library/jest-dom';

// Mock IntersectionObserver
const MockIntersectionObserver = class {
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {}
  disconnect() {}
  observe(target: Element) {}
  unobserve(target: Element) {}
} as any;

global.IntersectionObserver = MockIntersectionObserver;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};
