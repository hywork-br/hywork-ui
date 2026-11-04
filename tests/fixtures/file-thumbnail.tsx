import * as React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/montserrat";
import { FileThumbnail } from "../../src/platform/index";
import { brandThemeVars } from "../../src/theme";

// FileThumbnail (HCK-360) on the package CSS. What jsdom cannot measure lives
// here: the long name cut on one line, the width that never passes what is
// available, the frame that keeps its size from the skeleton to the image, a
// real image that loads and a real one that fails, and the focus ring.
// `?brand=f97316` applies a workspace brand; `?theme=dark` puts `.dark` on <html>.
const params = new URLSearchParams(location.search);
const css = document.createElement("link");
css.rel = "stylesheet";
css.href = "/.storybook/static/package.css";
document.head.append(css);
const html = document.documentElement;
html.style.setProperty("--font-montserrat", '"Montserrat Variable", sans-serif');
if (params.get("theme") === "dark") html.classList.add("dark");
const brand = params.get("brand");
if (brand) for (const [name, value] of Object.entries(brandThemeVars("#" + brand))) html.style.setProperty(name, value);
document.body.className = "bg-background text-foreground";

// A real image, with no network; its tones are the content of the sample photo.
const FOTO =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">' +
      '<defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="#7dd3fc"/><stop offset="1" stop-color="#0f766e"/></linearGradient></defs>' +
      '<rect width="100%" height="100%" fill="url(#g)"/><circle cx="840" cy="280" r="120" fill="#fef9c3"/></svg>',
  );
const QUEBRADA = "data:image/png;base64,naoeumaimagem";
const LONGO =
  "comprovante-de-conclusao-do-curso-de-lideranca-situacional-turma-2026-segundo-semestre-versao-final.pdf";

function App() {
  const [abertos, setAbertos] = React.useState<string[]>([]);
  const [src, setSrc] = React.useState<string>();
  const abrir = (nome: string) => () => setAbertos((lista) => [...lista, nome]);

  return (
    <main className="flex flex-col gap-6 p-4">
      <h1 className="text-2xl font-semibold">Arquivos</h1>

      <ul data-testid="lista" className="flex flex-wrap gap-3">
        {[
          { id: "imagem", name: "certificado.png", mime: "image/png", src: FOTO, sizeLabel: "1,2 MB" },
          { id: "carregando", name: "print.webp", mime: "image/webp", loading: true, sizeLabel: "220 KB" },
          { id: "falha", name: "removida.gif", mime: "image/gif", src: QUEBRADA, sizeLabel: "64 KB" },
          { id: "longo", name: LONGO, mime: "application/pdf", sizeLabel: "840 KB" },
          { id: "video", name: "apresentacao.mov", mime: "video/quicktime", sizeLabel: "48 MB" },
          { id: "outro", name: "horas.xlsx", mime: "application/vnd.ms-excel" },
        ].map(({ id, ...arquivo }) => (
          <li key={id} className="min-w-0 max-w-full">
            <FileThumbnail data-testid={id} onOpen={abrir(arquivo.name)} {...arquivo} />
          </li>
        ))}
      </ul>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">A URL chega depois</h2>
        <button type="button" onClick={() => setSrc(FOTO)} className="self-start underline">
          Chegar a URL
        </button>
        <FileThumbnail data-testid="depois" name="foto.png" mime="image/png" src={src} onOpen={abrir("foto.png")} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Coluna estreita e grade</h2>
        <div data-testid="estreita" className="w-[96px]">
          <FileThumbnail data-testid="na-estreita" name={LONGO} mime="application/pdf" sizeLabel="840 KB" onOpen={abrir("estreita")} />
        </div>
        <div data-testid="grade" className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
          <FileThumbnail data-testid="na-grade" className="w-full" name={LONGO} mime="application/pdf" onOpen={abrir("grade")} />
          <FileThumbnail className="w-full" name="certificado.png" mime="image/png" src={FOTO} onOpen={abrir("grade2")} />
        </div>
      </section>

      <p data-testid="abertos">{abertos.join(",")}</p>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
