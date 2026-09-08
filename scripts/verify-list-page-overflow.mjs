import { mkdir, readFile } from 'node:fs/promises';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { chromium, firefox, expect } from '@playwright/test';
import { DataTable, ListPage } from '../dist/index.js';

const css = (await Promise.all(['primitivos', 'semantico', 'admin', 'portal', 'componentes', 'selection', 'collections', 'feedback'].map(name => readFile(new URL(`../tokens/${name}.css`, import.meta.url), 'utf8')))).join('\n');
const output = new URL('../.superpowers/sdd/2026-09-08-list-page-overflow/', import.meta.url);
await mkdir(output, { recursive: true });
for (const [name, engine] of [['chromium', chromium], ['firefox', firefox]]) {
  const browser = await engine.launch();
  try {
    for (const width of [1440, 768, 390, 320]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const table = React.createElement(DataTable, {
        ariaLabel: 'Campos', rows: [{ id: 'one' }], getRowKey: row => row.id,
        columns: ['Nome do campo', 'Preenchimento obrigatório', 'Identificador permanente', 'Ações'].map((header, index) => ({ key: String(index), header, render: () => React.createElement('button', null, `Editar propriedade ${index}`) })),
      });
      const markup = renderToStaticMarkup(React.createElement(ListPage, { title: 'Coleção da equipe', items: [table], renderItem: item => React.createElement('div', null, item) }));
      await page.setContent(`<html data-superficie="admin"><body>${markup}</body></html>`);
      await page.addStyleTag({ content: `* { box-sizing: border-box; } body { margin: 0; } ${css}` });
      await page.getByRole('button', { name: 'Editar propriedade 3' }).focus();
      expect(await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, shifted: scrollX !== 0 })), `${name} ${width}`).toEqual({ overflow: false, shifted: false });
      const region = page.getByRole('region', { name: 'Campos: tabela rolável' });
      if (width <= 390) {
        const geometry = await region.evaluate(element => {
          const bounds = element.getBoundingClientRect();
          const focused = document.activeElement?.getBoundingClientRect();
          // Native scroll offsets are pixel-rounded; compare the same pixel geometry.
          return { overflowing: element.scrollWidth > element.clientWidth, scrollable: ['auto', 'scroll'].includes(getComputedStyle(element).overflowX), moved: element.scrollLeft > 0, visible: Boolean(focused && Math.round(focused.left) >= Math.round(bounds.left) && Math.round(focused.right) <= Math.round(bounds.right)) };
        });
        expect(geometry).toEqual({ overflowing: true, scrollable: true, moved: true, visible: true });
      }
      await expect(page.getByRole('button', { name: 'Editar propriedade 3' })).toBeFocused();
      await page.screenshot({ path: new URL(`${name}-${width}.png`, output).pathname });
      await page.close();
      console.log(`${name} ${width}: ListPage contains table overflow and preserves focused actions`);
    }
  } finally { await browser.close(); }
}
