import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileThumbnail } from "./index";

// Imagens embutidas, para o catálogo não depender de rede. Os tons são conteúdo
// da foto de exemplo, não cor do componente.
const foto = (largura: number, altura: number) =>
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${largura}" height="${altura}">` +
      '<defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#7dd3fc"/><stop offset="1" stop-color="#0f766e"/></linearGradient></defs>' +
      '<rect width="100%" height="100%" fill="url(#g)"/>' +
      `<circle cx="${largura * 0.7}" cy="${altura * 0.35}" r="${Math.min(largura, altura) * 0.15}" fill="#fef9c3"/>` +
      "</svg>",
  );

const PAISAGEM = foto(1200, 800);
const RETRATO = foto(600, 1400);
/** Não é uma imagem válida: o navegador dispara `error` sem ir à rede. */
const QUEBRADA = "data:image/png;base64,naoeumaimagem";

const NOME_LONGO =
  "comprovante-de-conclusao-do-curso-de-lideranca-situacional-turma-2026-segundo-semestre-versao-final.pdf";

const meta = {
  title: "Platform/Padrões/FileThumbnail",
  component: FileThumbnail,
  args: {
    name: "certificado-lideranca.png",
    mime: "image/png",
    src: PAISAGEM,
    sizeLabel: "1,2 MB",
    onOpen: () => undefined,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Um arquivo como miniatura clicável: a imagem, ou o ícone do tipo, com o nome e o " +
          "tamanho embaixo. É um botão: Tab chega nele, Enter e Espaço abrem. O nome acessível é " +
          "o `name`, inteiro; a tela pode trocá-lo por `aria-label` (\"Abrir arquivo …\").\n\n" +
          "Não sabe de onde o arquivo vem nem o que acontece ao abrir: recebe nome, tipo e URL, e " +
          "avisa por `onOpen`. O `src` é opcional porque a URL pode ser assinada e chegar depois.\n\n" +
          "`mime` decide a forma: imagem usa `src`; PDF, vídeo e os demais tipos mostram o ícone. " +
          "A imagem espera (esqueleto) com `loading` ou sem `src`; `loading={false}` sem `src` " +
          "diz que a URL não vem, e fica o ícone. Imagem que falha cai no ícone e tenta de novo " +
          "se o `src` mudar.\n\n" +
          "Proposta para a evidência do PDI do DHO (HCK-360): o visual aguarda o aval da PO.",
      },
    },
  },
} satisfies Meta<typeof FileThumbnail>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Imagem com `src`, cortada para caber no quadro de 4:3. */
export const Imagem: Story = {};

/** Foto em pé: o corte é o mesmo, e o quadro não muda de tamanho. */
export const ImagemEmPe: Story = {
  args: { name: "foto-do-treinamento.jpg", mime: "image/jpeg", src: RETRATO, sizeLabel: "3,4 MB" },
};

/** `loading`: a tela está buscando a URL. O botão continua clicável. */
export const ImagemCarregando: Story = {
  args: { src: undefined, loading: true },
};

/** Sem `src` e sem `loading`: a URL ainda não chegou, e a imagem também espera. */
export const ImagemSemUrl: Story = {
  args: { src: undefined },
};

/** A URL chega depois: o quadro não muda de tamanho quando a imagem aparece. */
export const UrlChegaDepois: Story = {
  render: function UrlChegaDepois(args) {
    const [src, setSrc] = React.useState<string>();
    React.useEffect(() => {
      const espera = setTimeout(() => setSrc(PAISAGEM), 1500);
      return () => clearTimeout(espera);
    }, []);
    return <FileThumbnail {...args} src={src} />;
  },
};

/** A imagem falhou (`onError`): cai no ícone do tipo, com nome e tamanho. */
export const ImagemComFalha: Story = {
  args: { src: QUEBRADA },
};

/** `loading={false}` sem `src`: a URL não veio e não virá. Fica o ícone, sem esqueleto eterno. */
export const ImagemSemUrlPorErro: Story = {
  args: { src: undefined, loading: false },
};

export const Pdf: Story = {
  args: { name: "plano-de-desenvolvimento.pdf", mime: "application/pdf", src: undefined, sizeLabel: "840 KB" },
};

export const Video: Story = {
  args: { name: "apresentacao-final.mp4", mime: "video/mp4", src: undefined, sizeLabel: "48 MB" },
};

/** Tipo sem ícone próprio: o clipe. */
export const OutroTipo: Story = {
  args: { name: "planilha-de-horas.xlsx", mime: "application/vnd.ms-excel", src: undefined, sizeLabel: "96 KB" },
};

/** Nome longo: trunca em uma linha. O nome inteiro fica no `title` e no nome acessível. */
export const NomeLongo: Story = {
  args: { name: NOME_LONGO, mime: "application/pdf", src: undefined },
};

/** Sem `sizeLabel`: só o nome. */
export const SemTamanho: Story = {
  args: { sizeLabel: undefined },
};

/** O `aria-label` da tela, traduzido, substitui o nome como nome acessível. */
export const NomeAcessivelDaTela: Story = {
  args: { "aria-label": "Abrir arquivo certificado-lideranca.png" },
};

export const Desabilitado: Story = {
  args: { disabled: true },
};

/** Como uma tela lista os arquivos: quebram de linha e não alargam a página. */
export const Lista: Story = {
  render: (args) => (
    <ul className="flex flex-wrap gap-3">
      {[
        { name: "certificado-lideranca.png", mime: "image/png", src: PAISAGEM, sizeLabel: "1,2 MB" },
        { name: "foto-do-treinamento.jpg", mime: "image/jpeg", src: RETRATO, sizeLabel: "3,4 MB" },
        { name: "print-da-tela.webp", mime: "image/webp", loading: true, sizeLabel: "220 KB" },
        { name: "imagem-removida.gif", mime: "image/gif", src: QUEBRADA, sizeLabel: "64 KB" },
        { name: NOME_LONGO, mime: "application/pdf", sizeLabel: "840 KB" },
        { name: "apresentacao-final.mov", mime: "video/quicktime", sizeLabel: "48 MB" },
        { name: "planilha-de-horas.xlsx", mime: "application/vnd.ms-excel", sizeLabel: "96 KB" },
      ].map((arquivo) => (
        <li key={arquivo.name} className="min-w-0 max-w-full">
          <FileThumbnail {...args} src={undefined} {...arquivo} />
        </li>
      ))}
    </ul>
  ),
};

/** Numa grade: `className="w-full"` faz a miniatura acompanhar a coluna. */
export const EmGrade: Story = {
  render: (args) => (
    <div className="grid w-full max-w-[720px] grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
      <FileThumbnail {...args} className="w-full" />
      <FileThumbnail {...args} className="w-full" name={NOME_LONGO} mime="application/pdf" src={undefined} />
      <FileThumbnail {...args} className="w-full" name="apresentacao-final.mp4" mime="video/mp4" src={undefined} />
    </div>
  ),
};

/** Tela estreita: a largura nunca passa da que há disponível. */
export const TelaEstreita: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
  render: (args) => (
    <div className="w-[120px]">
      <FileThumbnail {...args} name={NOME_LONGO} />
    </div>
  ),
};
