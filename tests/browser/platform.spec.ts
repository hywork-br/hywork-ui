import { test, expect, type Page } from "@playwright/test";
import axe from "axe-core";
async function open(page:Page, implementation:string, theme:string) {
  await page.goto("/tests/fixtures/parity.html?implementation="+implementation+"&theme="+theme);
  await expect(page.getByRole("heading",{name:"Componentes do Platform"})).toBeVisible();
  await expect(page.getByRole("button",{name:"Salvar",exact:true})).toHaveCSS("height","40px");
  await page.evaluate(async()=>{ await document.fonts.ready; });
}
async function capture(page:Page) {
  return page.screenshot({fullPage:true, animations:"disabled"});
}
// Only intentional, documented contrast refinements may differ in the parity image.
// Their geometry is still compared; accessibility tests verify their actual colors.
function contrastRegions(page:Page) {
  return ["Sucesso","Atenção","Erro","Informação"].map(name=>page.getByRole("button",{name,exact:true}))
    .concat([page.getByText("Concluído",{exact:true}),page.locator("caption")]);
}
for (const width of [1440,390]) for (const theme of ["light","dark","tenant"]) {
  test("source/package parity "+width+" "+theme, async({page}, info) => {
    const errors:string[]=[];
    page.on("pageerror",e=>errors.push(e.message));
    await page.setViewportSize({width,height:1000});
    const screenshots:Buffer[]=[];
    const geometry:unknown[]=[];
    for (const implementation of ["source","package"]) {
      await open(page,implementation,theme);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
      const screenshot=await page.screenshot({fullPage:true,animations:"disabled",path:info.outputPath(implementation+".png")});
      geometry.push(await Promise.all(contrastRegions(page).map(async region=>({
        bounds:await region.boundingBox(),
        style:await region.evaluate(el=>{const s=getComputedStyle(el);return {radius:s.borderRadius,font:s.font,padding:s.padding};}),
      }))));
      screenshots.push(await page.screenshot({fullPage:true,animations:"disabled",mask:contrastRegions(page)}));
      await info.attach(implementation,{body:screenshot,contentType:"image/png"});
    }
    expect(Buffer.compare(screenshots[0],screenshots[1]),"source and package pixels differ").toBe(0);
    expect(geometry[0]).toEqual(geometry[1]);
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
test("comparison rejects a deliberate geometry mutation",async({page})=>{
  await open(page,"package","light");
  const button=page.getByRole("button",{name:"Salvar",exact:true});
  const before=await capture(page);
  await button.evaluate(el=>(el as HTMLElement).style.height="60px");
  expect(Buffer.compare(before,await capture(page))).not.toBe(0);
  await button.evaluate(el=>(el as HTMLElement).style.removeProperty("height"));
  expect(Buffer.compare(before,await capture(page))).toBe(0);
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
