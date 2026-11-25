import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ImagePicker, type ImagePickerImage } from "./index";

const svg = (c: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="500"><rect width="1200" height="500" fill="${c}"/></svg>`)}`;
const gallery: ImagePickerImage[] = [
  { id: "g1", url: svg("#5b6bc0"), alt: "Capa azul" },
  { id: "g2", url: svg("#2e9e6b"), alt: "Capa verde" },
  { id: "g3", url: svg("#c7882f"), alt: "Capa âmbar" },
];
let n = 0;
const fakeUpload = async (file: File): Promise<ImagePickerImage> => {
  await new Promise((r) => setTimeout(r, 800));
  return { id: `up${++n}`, url: svg("#888"), alt: file.name };
};

const meta = {
  title: "Platform/Padrões/ImagePicker",
  parameters: {
    docs: {
      description: {
        component:
          "Seletor de imagem: galeria opcional e envio próprio, com prévia. Valida tipo e tamanho antes do `onUpload`. Com `max` 1 a escolha substitui.",
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;

function Demo(p: Partial<React.ComponentProps<typeof ImagePicker>> & { initial?: ImagePickerImage[] }) {
  const [value, setValue] = React.useState<ImagePickerImage[]>(p.initial ?? []);
  return (
    <div className="w-[560px]">
      <ImagePicker onUpload={fakeUpload} {...p} value={value} onChange={setValue} />
    </div>
  );
}
const base = { label: "Foto de capa", description: "JPG ou PNG, 1200 × 500 px recomendado, até 5 MB.", maxSizeBytes: 5 * 1024 * 1024 };

export const CapaComGaleria: Story = { render: () => <Demo {...base} gallery={gallery} /> };
export const SoEnvio: Story = { render: () => <Demo {...base} /> };
export const ComImagem: Story = { render: () => <Demo {...base} gallery={gallery} initial={[gallery[0]!]} /> };
export const Medalha: Story = {
  render: () => <Demo label="Imagem" description="PNG ou SVG, fundo transparente, até 1 MB." aspect="square" accept="image/png,image/svg+xml" gallery={gallery} />,
};
export const VariasImagens: Story = {
  render: () => <Demo label="Imagens do produto" description="Até 5 imagens (JPG/PNG, 2 MB)." max={5} aspect="square" maxSizeBytes={2 * 1024 * 1024} />,
};
export const ComErro: Story = { render: () => <Demo {...base} error="Obrigatória." /> };
export const Desabilitado: Story = { render: () => <Demo {...base} disabled initial={[gallery[0]!]} /> };
