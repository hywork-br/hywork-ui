import { test, expect, type Page } from "@playwright/test";
import axe from "axe-core";
import { readFileSync, writeFileSync } from "node:fs";
async function open(page:Page, implementation:string, theme:string) {
  await page.goto("/tests/fixtures/parity.html?implementation="+implementation+"&theme="+theme);
  await expect(page.getByRole("heading",{name:"Componentes do Platform"})).toBeVisible();
  await expect(page.getByRole("button",{name:"Salvar",exact:true})).toHaveCSS("height","40px");
  await page.evaluate(async()=>{ await document.fonts.ready; });
}
async function capture(page:Page) {
  return page.screenshot({fullPage:true, animations:"disabled"});
}
// Parity is a promise of the source-derived primitives only. An authored one
// (status "authored" in manifest.json) diverges on purpose — a PO decision in
// DOMAIN_MODEL.md — and its own stories and tests cover it. The parity page
// (`view=derived`, tests/fixtures/derived-catalog.tsx) shows only the derived
// ones, so source and package share the layout and the pixels must be equal.
const manifest=JSON.parse(readFileSync("manifest.json","utf8")) as {components:{name:string;status:string}[]};
const derived=manifest.components.filter(c=>c.status==="source-derived").map(c=>c.name);
// Overlays exist only while open: how to open each one.
const overlays:Record<string,(page:Page)=>Promise<void>>={
  "alert-dialog":page=>page.getByRole("button",{name:"Confirmar exclusão",exact:true}).click(),
  "dropdown-menu":page=>page.getByRole("button",{name:"Ações do documento",exact:true}).click(),
  popover:page=>page.getByRole("button",{name:"Mais informações",exact:true}).click(),
  sheet:page=>page.getByRole("button",{name:"Abrir painel",exact:true}).click(),
  tooltip:page=>page.getByRole("button",{name:"Ajuda",exact:true}).hover(),
};
async function openDerived(page:Page, implementation:string, theme:string) {
  await page.goto("/tests/fixtures/parity.html?view=derived&implementation="+implementation+"&theme="+theme);
  await expect(page.getByRole("heading",{name:"Primitivas derivadas"})).toBeVisible();
  await page.evaluate(async()=>{ await document.fonts.ready; });
}
// The page at rest, then once per overlay while it is open.
async function captureDerived(page:Page) {
  const shots:[string,Buffer][]=[];
  const shown=new Set<string>();
  const note=async()=>{ for (const name of derived) if (await page.locator(`[data-parity="${name}"]`).count()>0) shown.add(name); };
  await note();
  shots.push(["at rest",await capture(page)]);
  for (const [name,openOverlay] of Object.entries(overlays)) {
    await openOverlay(page);
    await expect(page.locator(`[data-parity="${name}"]`)).toBeVisible();
    // An overlay slides in: capture it settled, not halfway (where the text
    // still sits on a fractional pixel and rasterizes differently each time).
    await page.evaluate(()=>Promise.all(document.getAnimations().map(animation=>animation.finished)));
    await note();
    shots.push([name+" open",await capture(page)]);
    await page.keyboard.press("Escape");
    await expect(page.locator(`[data-parity="${name}"]`)).toHaveCount(0);
  }
  return {shots,shown};
}
test("the parity page shows every source-derived primitive, and the overlays list only them",async({page})=>{
  for (const name of Object.keys(overlays)) expect(derived,name).toContain(name);
  await openDerived(page,"package","light");
  const {shown}=await captureDerived(page);
  expect([...shown].sort()).toEqual([...derived].sort());
});
for (const width of [1440,390]) for (const theme of ["light","dark","tenant"]) {
  test("source/package parity "+width+" "+theme, async({browser}, info) => {
    const errors:string[]=[];
    const captured:[string,Buffer][][]=[];
    for (const implementation of ["source","package"]) {
      // A page of its own per side: the pointer and focus the first side left
      // behind (the tooltip is hovered last) must not touch the second one.
      // With motion: the derivation adds `motion-reduce:!animate-none` to every
      // animated class (derive-platform.mjs), so under "reduce" only the source
      // slides in and the two sides rasterize the same text by different paths.
      // The reduced-motion behaviour is checked by the accessibility test.
      const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:"no-preference"});
      page.on("pageerror",e=>errors.push(e.message));
      await openDerived(page,implementation,theme);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
      const {shots}=await captureDerived(page);
      for (const [state,shot] of shots) await info.attach(`${implementation} · ${state}`,{body:shot,contentType:"image/png"});
      captured.push(shots);
      await page.close();
    }
    const [source,pkg]=captured;
    for (const [i,[state,shot]] of source.entries()) {
      if (Buffer.compare(shot,pkg[i][1])!==0) {
        writeFileSync(info.outputPath(`${state.replaceAll(" ","-")}-source.png`),shot);
        writeFileSync(info.outputPath(`${state.replaceAll(" ","-")}-package.png`),pkg[i][1]);
      }
      expect(Buffer.compare(shot,pkg[i][1]),`${state}: source and package pixels differ`).toBe(0);
    }
    expect(errors).toEqual([]);
  });
}
for (const implementation of ["source","package"]) {
  test(implementation+" keyboard and controlled interactions",async({page},info)=>{
    await page.setViewportSize({width:1440,height:1000});
    await open(page,implementation,"light");
    await page.getByLabel("Nome",{exact:true}).fill("Política revisada");
    await page.getByLabel("Notificar equipe").check();
    await expect(page.getByLabel("Notificar equipe")).toBeChecked();
    await page.getByRole("tab",{name:"Arquivados"}).click();
    await expect(page.getByRole("tabpanel")).toHaveText("Documentos arquivados");
    await page.getByRole("combobox").click();
    await page.getByRole("option",{name:"Pausado"}).click();
    await expect(page.getByRole("combobox")).toContainText("Pausado");
    const slider=page.getByRole("slider");
    await slider.focus();
    await page.keyboard.press("ArrowRight");
    await expect(slider).toHaveAttribute("aria-valuenow","41");
    if (implementation==="package") await expect(slider).toHaveAccessibleName("Volume");
    const trigger=page.getByRole("button",{name:"Abrir diálogo",exact:true});
    await trigger.click();
    const dialog=page.getByRole("dialog",{name:"Editar documento"});
    await expect(dialog).toBeVisible();
    await page.getByLabel("Nome no diálogo").fill("Novo nome");
    await info.attach(implementation+"-dialog",{body:await capture(page),contentType:"image/png"});
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await expect(page.getByLabel("Nome",{exact:true})).toHaveValue("Política revisada");
    await page.getByRole("button",{name:"Mostrar histórico"}).click();
    await expect(page.getByText("Versão 1",{exact:true})).toBeVisible();
  });
}
test("comparison rejects a deliberate mutation of a derived primitive",async({page})=>{
  await openDerived(page,"package","light");
  const input=page.locator('[data-parity="input"]').first();
  const before=await capture(page);
  await input.evaluate(el=>(el as HTMLElement).style.borderRadius="0");
  expect(Buffer.compare(before,await capture(page))).not.toBe(0);
  await input.evaluate(el=>(el as HTMLElement).style.removeProperty("border-radius"));
  expect(Buffer.compare(before,await capture(page))).toBe(0);
  // A subtle border colour shift must fail too, not only a change of shape.
  await input.evaluate(el=>(el as HTMLElement).style.borderColor="rgb(203 213 225)");
  expect(Buffer.compare(before,await capture(page))).not.toBe(0);
});

for (const theme of ["light","tenant"]) test("accessible catalogue "+theme,async({page},info)=>{
  await open(page,"package",theme);
  await page.addScriptTag({content:axe.source});
  const audit=()=>page.evaluate(async()=>{
    const result=await (window as typeof window & {axe:typeof axe}).axe.run();
    return result.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}));
  });
  expect(await audit()).toEqual([]);
  await expect(page.locator(".animate-pulse")).toHaveCSS("animation-name","none");
  const viewport=page.locator("[data-radix-scroll-area-viewport]");
  await viewport.focus();
  await page.keyboard.press("ArrowDown");
  await expect.poll(()=>viewport.evaluate(el=>el.scrollTop)).toBeGreaterThan(0);
  await page.getByRole("button",{name:"Abrir diálogo",exact:true}).click();
  expect(await audit()).toEqual([]);
  await expect(page.getByRole("dialog")).toHaveCSS("animation-name","none");
  await page.keyboard.press("Escape");
  // Prove the contrast gate itself rejects the old warning foreground.
  const warning=page.getByRole("button",{name:"Atenção",exact:true});
  await warning.evaluate(el=>(el as HTMLElement).style.color="white");
  expect((await audit()).some(v=>v.id==="color-contrast")).toBe(true);
  await warning.evaluate(el=>(el as HTMLElement).style.removeProperty("color"));
  expect(await audit()).toEqual([]);
  await page.setViewportSize({width:320,height:1000});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  await info.attach("narrow",{body:await capture(page),contentType:"image/png"});
});
