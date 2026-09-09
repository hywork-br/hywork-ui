import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(cleanup);

Object.defineProperties(HTMLElement.prototype, {
  hasPointerCapture: { value: () => false },
  releasePointerCapture: { value: () => undefined },
  scrollIntoView: { value: () => undefined },
  setPointerCapture: { value: () => undefined },
});
