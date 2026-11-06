import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import "@testing-library/jest-dom";

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock Image for preloading tests
globalThis.Image = class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = "";

  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 100);
  }
} as unknown as typeof Image;
