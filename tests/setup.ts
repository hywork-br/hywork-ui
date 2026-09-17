import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
// jsdom has no layout engine. Geometry and real observers are covered in Playwright.
vi.stubGlobal("ResizeObserver", class {
  observe() {}
  unobserve() {}
  disconnect() {}
});
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
afterEach(cleanup);
