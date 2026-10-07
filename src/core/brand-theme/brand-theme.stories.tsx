import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { Badge } from "../badge";
import { Button } from "../button";
import { Checkbox } from "../checkbox";
import { Input } from "../input";
import { Label } from "../label";
import { Progress } from "../progress";
import { RadioGroup, RadioGroupItem } from "../radio-group";
import { Switch } from "../switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";
import { BrandTheme, brandThemeVars } from "./index";

const meta = {
  title: "Core/BrandTheme",
  component: BrandTheme,
  parameters: {
    docs: {
      description: {
        component:
          "A cor de marca do workspace é a **única** cor que o consumidor informa " +
          "(Rick, 06/10/2026). Botão principal, aba ativa, anel de foco, link, " +
          "checkbox, switch, rádio e progresso seguem a marca; o texto sobre ela " +
          "tem contraste AA calculado. Estado (sucesso, atenção, erro, informação) " +
          "e destrutivo **não** seguem a marca.\n\n" +
          "Na aplicação, escreva no `<html>`: `<html style={brandThemeVars(hex)}>` " +
          "no servidor, ou `useBrandTheme(hex)` no cliente — é o que alcança os portais.",
      },
    },
  },
} satisfies Meta<typeof BrandTheme>;
export default meta;
type Story = StoryObj<typeof meta>;

function Amostra({ nome, cor }: { nome: string; cor?: string }) {
  const vars = brandThemeVars(cor);
  const [ligado, setLigado] = React.useState(true);
  return (
    <BrandTheme color={cor} className="flex min-w-0 flex-1 flex-col gap-4 rounded-lg border border-border p-6">
      <div>
        <p className="text-sm font-semibold text-hw-heading">{nome}</p>
        <p className="text-xs text-muted-foreground">
          {vars["--hw-brand-primary"]
            ? `${cor} · texto ${vars["--hw-brand-primary-foreground"] === "0 0% 100%" ? "branco" : "escuro"}`
            : `${cor ? `"${cor}" inválida` : "sem marca"} — primário do design system`}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button>Salvar</Button>
        <Button variant="outline">Cancelar</Button>
        <Button variant="link">Ver detalhes</Button>
      </div>
      <Tabs defaultValue="ativos">
        <TabsList>
          <TabsTrigger value="ativos">Ativos</TabsTrigger>
          <TabsTrigger value="arquivados">Arquivados</TabsTrigger>
        </TabsList>
        <TabsContent value="ativos" className="text-sm text-muted-foreground">Aba ativa na marca.</TabsContent>
        <TabsContent value="arquivados" className="text-sm text-muted-foreground">Arquivados.</TabsContent>
      </Tabs>
      <div className="flex items-center gap-4">
        <Label className="flex items-center gap-2"><Checkbox defaultChecked /> Marcado</Label>
        <Label className="flex items-center gap-2"><Checkbox /> Livre</Label>
        <Label className="flex items-center gap-2">
          <Switch checked={ligado} onCheckedChange={setLigado} /> Avisos
        </Label>
      </div>
      <RadioGroup defaultValue="mensal" className="flex gap-4">
        <Label className="flex items-center gap-2"><RadioGroupItem value="mensal" /> Mensal</Label>
        <Label className="flex items-center gap-2"><RadioGroupItem value="anual" /> Anual</Label>
      </RadioGroup>
      <Progress value={60} aria-label="Progresso" />
      <Input aria-label="Nome" placeholder="Clique para ver o anel de foco" />
      <div className="flex flex-wrap gap-2">
        <Badge>Marca</Badge>
        <Badge variant="informative">Informativo</Badge>
        <Badge variant="positive">Ativo</Badge>
        <Badge variant="negative">Erro</Badge>
      </div>
      <Button variant="destructive" className="self-start">Excluir</Button>
    </BrandTheme>
  );
}

/**
 * Três workspaces lado a lado: sem marca (o primário do design system), um
 * índigo (#434cad, texto branco) e um amarelo (#facc15). No amarelo o texto do
 * botão passa a escuro, e aba, link, checkbox e anel de foco usam a marca
 * escurecida até 4.5:1 sobre o branco — a marca amarela não vira aba ilegível.
 * Badges de estado e o botão destrutivo não mudam entre os três.
 */
export const TresMarcas: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Amostra nome="Design system" />
      <Amostra nome="Índigo" cor="#434cad" />
      <Amostra nome="Amarelo" cor="#facc15" />
    </div>
  ),
};

/** Cor inválida (`"azul"`, `"#12345"`) cai no primário do design system. */
export const CorInvalida: Story = {
  render: () => <Amostra nome="Cor inválida" cor="azul" />,
};
