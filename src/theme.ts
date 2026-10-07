// Entrada pura — sem "use client" — para usar a cor de marca do workspace
// num Server Component, em Node ou em teste.
//   import { brandThemeVars } from "@hywork/ui/theme";
//   <html style={brandThemeVars(workspace.color_primary_hex)}>
//
// Nos componentes de cliente, a mesma função sai de "@hywork/ui/platform"
// (e "/builder"), junto de <BrandTheme> e useBrandTheme().

export { apcaContrast, brandThemeVars, BRAND_VARIABLES, MIN_TEXT_LC } from "./theme/brand";
export type { BrandThemeVars, BrandVariable } from "./theme/brand";
