"use client";

import React, { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import { Mark } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  Quote,
  CornerDownLeft,
  Strikethrough,
  Code,
} from "lucide-react";

// Declara o comando de cor no tipo do tiptap, como a biblioteca prevê para
// extensões próprias.
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    color: {
      setColor: (color: string) => ReturnType;
      unsetColor: () => ReturnType;
    };
  }
}

export interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
}

// Custom color mark extension
const ColorMark = Mark.create({
  name: "color",
  addOptions() {
    return {
      types: ["textStyle"],
    };
  },
  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) => element.style.color.replaceAll(/['"]/g, ""),
        renderHTML: (attributes) => {
          if (!attributes.color) return {};
          return {
            style: `color: ${attributes.color}`,
          };
        },
      },
    };
  },
  parseHTML() {
    return [
      {
        style: "color",
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", HTMLAttributes, 0];
  },
  addCommands() {
    return {
      setColor: (color: string) => ({ commands }) => {
        return commands.setMark(this.name, { color });
      },
      unsetColor: () => ({ commands }) => {
        return commands.unsetMark(this.name);
      },
    };
  },
});

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const savedSelectionRef = useRef<{ from: number; to: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: {
          depth: 10,
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      ColorMark,
      Underline.configure({
        HTMLAttributes: {
          class: "underline",
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const handleLinkClick = () => {
    if (!editor) return;
    savedSelectionRef.current = { from: editor.state.selection.from, to: editor.state.selection.to };
    const existingHref = editor.getAttributes("link").href || "";
    setLinkUrl(existingHref);
    setShowLinkInput(true);
  };

  const confirmLink = () => {
    if (!editor) return;
    if (savedSelectionRef.current) {
      editor.chain().focus().setTextSelection(savedSelectionRef.current).run();
    }
    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      let href = linkUrl.trim();
      if (href && !/^https?:\/\//i.test(href) && !/^mailto:/i.test(href)) {
        href = `https://${href}`;
      }
      editor.chain().focus().extendMarkRange("link").setLink({ href, target: "_blank" }).run();
    }
    setShowLinkInput(false);
    setLinkUrl("");
    savedSelectionRef.current = null;
  };

  const handleImageClick = () => {
    if (!editor) return;
    savedSelectionRef.current = { from: editor.state.selection.from, to: editor.state.selection.to };
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (savedSelectionRef.current) {
        editor.chain().focus().setTextSelection(savedSelectionRef.current).run();
      }
      editor.chain().focus().setImage({ src: base64 }).run();
      savedSelectionRef.current = null;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full border rounded-md overflow-hidden relative cursor-default">
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex bg-popover text-popover-foreground border shadow-lg rounded-lg p-1 gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1 rounded hover:bg-muted ${editor.isActive("bold") ? "bg-accent" : ""}`}
            >
              <Bold size={14} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1 rounded hover:bg-muted ${editor.isActive("italic") ? "bg-accent" : ""}`}
            >
              <Italic size={14} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-1 rounded hover:bg-muted ${editor.isActive("underline") ? "bg-accent" : ""}`}
            >
              <UnderlineIcon size={14} />
            </button>
            <button type="button" onClick={handleLinkClick} className={`p-1 rounded hover:bg-muted ${editor.isActive("link") ? "bg-accent" : ""}`}>
              <LinkIcon size={14} />
            </button>
          </div>
        </BubbleMenu>
      )}

      {showLinkInput && (
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center gap-1 bg-popover text-popover-foreground border-b shadow-sm p-2">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") confirmLink(); if (e.key === "Escape") setShowLinkInput(false); }}
            placeholder="https://..."
            className="border rounded px-2 py-1 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-ring"
            autoFocus
          />
          <button type="button" onClick={confirmLink} className="px-2 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary-hover">OK</button>
          <button type="button" onClick={() => setShowLinkInput(false)} className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-sm hover:bg-secondary/80">X</button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="bg-muted p-2 border-b flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1 rounded hover:bg-accent ${editor.isActive("bold") ? "bg-accent" : ""}`}
          title="Negrito"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1 rounded hover:bg-accent ${editor.isActive("italic") ? "bg-accent" : ""}`}
          title="Itálico"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1 rounded hover:bg-accent ${editor.isActive("underline") ? "bg-accent" : ""}`}
          title="Sublinhado"
        >
          <UnderlineIcon size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1 rounded hover:bg-accent ${editor.isActive("strike") ? "bg-accent" : ""}`}
          title="Tachado"
        >
          <Strikethrough size={16} />
        </button>

        <div className="border-r mx-1 h-6"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`p-1 rounded hover:bg-accent ${editor.isActive({ textAlign: "left" }) ? "bg-accent" : ""}`}
          title="Alinhar à esquerda"
        >
          <AlignLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-1 rounded hover:bg-accent ${editor.isActive({ textAlign: "center" }) ? "bg-accent" : ""}`}
          title="Centralizar"
        >
          <AlignCenter size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`p-1 rounded hover:bg-accent ${editor.isActive({ textAlign: "right" }) ? "bg-accent" : ""}`}
          title="Alinhar à direita"
        >
          <AlignRight size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={`p-1 rounded hover:bg-accent ${editor.isActive({ textAlign: "justify" }) ? "bg-accent" : ""}`}
          title="Justificar"
        >
          <AlignJustify size={16} />
        </button>

        <div className="border-r mx-1 h-6"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1 rounded hover:bg-accent ${editor.isActive("bulletList") ? "bg-accent" : ""}`}
          title="Lista com marcadores"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1 rounded hover:bg-accent ${editor.isActive("orderedList") ? "bg-accent" : ""}`}
          title="Lista numerada"
        >
          <ListOrdered size={16} />
        </button>

        <div className="border-r mx-1 h-6"></div>

        <button
          type="button"
          onClick={handleLinkClick}
          className={`p-1 rounded hover:bg-accent ${editor.isActive("link") ? "bg-accent" : ""}`}
          title="Inserir link"
        >
          <LinkIcon size={16} />
        </button>
        <button
          type="button"
          onClick={handleImageClick}
          className="p-1 rounded hover:bg-accent"
          title="Inserir imagem"
        >
          <ImageIcon size={16} />
        </button>

        <div className="border-r mx-1 h-6"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1 rounded hover:bg-accent ${editor.isActive("heading", { level: 1 }) ? "bg-accent" : ""}`}
          title="Título 1"
        >
          <Heading1 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1 rounded hover:bg-accent ${editor.isActive("heading", { level: 2 }) ? "bg-accent" : ""}`}
          title="Título 2"
        >
          <Heading2 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1 rounded hover:bg-accent ${editor.isActive("heading", { level: 3 }) ? "bg-accent" : ""}`}
          title="Título 3"
        >
          <Heading3 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`p-1 rounded hover:bg-accent ${editor.isActive("paragraph") ? "bg-accent" : ""}`}
          title="Parágrafo"
        >
          <Pilcrow size={16} />
        </button>

        <div className="border-r mx-1 h-6"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1 rounded hover:bg-accent ${editor.isActive("blockquote") ? "bg-accent" : ""}`}
          title="Citação"
        >
          <Quote size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHardBreak().run()}
          className="p-1 rounded hover:bg-accent"
          title="Quebra de linha"
        >
          <CornerDownLeft size={16} />
        </button>

        <div className="border-r mx-1 h-6"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-1 rounded hover:bg-accent ${editor.isActive("code") ? "bg-accent" : ""}`}
          title="Código"
        >
          <Code size={16} />
        </button>

        <input
          type="color"
          onInput={(event) => {
            const color = (event.target as HTMLInputElement).value;
            editor.chain().focus().setColor(color).run();
          }}
          value={editor.getAttributes("color").color || "#000000"}
          className="w-8 h-8 p-0.5 border border-border rounded cursor-pointer hover:shadow-md transition-shadow"
          title="Cor do texto"
        />
      </div>

      <EditorContent
        editor={editor}
        className="prose max-w-none p-4 min-h-[200px] focus:outline-none rich-text-content cursor-text [&_.ProseMirror]:cursor-text"
      />
    </div>
  );
};

export { RichTextEditor };
export default RichTextEditor;
