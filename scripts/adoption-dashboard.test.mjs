import assert from "node:assert/strict";
import test from "node:test";

import { renderDashboard } from "./render-adoption-dashboard.mjs";

test("adoption dashboard keeps consumer evidence separate from rollout approval", () => {
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
  assert.match(dashboard, /não comprova deploy/i);
  assert.match(dashboard, /Platform é o primeiro consumidor/);
  assert.match(dashboard, /independe da migração posterior do Builder/);
  assert.doesNotMatch(dashboard, /antes de outubro/i);
  assert.match(dashboard, /platform-rev/);
  assert.match(dashboard, /332/);
});
