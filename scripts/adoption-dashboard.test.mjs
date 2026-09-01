import assert from "node:assert/strict";
import test from "node:test";

import { renderDashboard } from "./render-adoption-dashboard.mjs";

test("adoption dashboard makes the October gate visible without inventing adoption", () => {
  const dashboard = renderDashboard({
    generatedAt: "2026-09-01T16:00:00.000Z",
    platform: {
      revision: "platform-rev",
      packageImportFiles: 0,
      localUiImportFiles: 332,
    },
    builder: {
      revision: "builder-rev",
      packageImportFiles: 0,
      localUiImportFiles: 121,
    },
  });

  assert.match(dashboard, /0 \/ 2 consumidores no pacote/);
  assert.match(dashboard, /Platform.*Não migrado/);
  assert.match(dashboard, /Builder.*Não migrado/);
  assert.match(dashboard, /não foi executada antes de outubro/i);
  assert.match(dashboard, /platform-rev/);
  assert.match(dashboard, /332/);
});
