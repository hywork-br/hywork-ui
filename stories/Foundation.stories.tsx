import type { Meta, StoryObj } from "@storybook/react-vite";
import { MoreHorizontal, Plus, Send, Sparkles } from "lucide-react";
import { fn } from "storybook/test";

import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Field,
  FieldHint,
  Input,
  Label,
  Select,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "../src";

const meta = {
  parameters: {
    docs: {
      description: {
        component:
          "Famílias beta da linha 0.6. A mesma API responde à densidade admin ou portal pelo atributo data-surface.",
      },
    },
  },
  title: "Foundation/Catálogo",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Componentes: Story = {
  render: () => (
    <div className="hw-catalog">
      <header className="hw-catalog__hero">
        <h1>Uma linguagem para operar e comunicar</h1>
        <p>
          Controles densos no admin, leitura confortável no portal e o mesmo contrato de foco,
          estado e hierarquia.
        </p>
        <Badge tone="info">Linha 0.6 · beta</Badge>
      </header>

      <section className="hw-catalog__section">
        <div>
          <h2>Ações com peso claro</h2>
        </div>
        <div className="hw-catalog__demo hw-catalog__demo--row">
          <Button onClick={fn()}><Plus aria-hidden="true" /> Nova campanha</Button>
          <Button onClick={fn()} variant="secondary"><Send aria-hidden="true" /> Enviar teste</Button>
          <Button onClick={fn()} variant="outline">Salvar rascunho</Button>
          <Button onClick={fn()} variant="quiet"><MoreHorizontal aria-hidden="true" /> Mais ações</Button>
          <Button loading>Publicando</Button>
        </div>
      </section>

      <section className="hw-catalog__section">
        <div>
          <h2>Formulário que explica o próximo passo</h2>
        </div>
        <div className="hw-catalog__demo hw-catalog__form">
          <Field>
            <Label htmlFor="story-name">Nome da campanha</Label>
            <Input id="story-name" placeholder="Ex.: Boas-vindas de setembro" />
            <FieldHint>Visível apenas para quem gerencia a comunicação.</FieldHint>
          </Field>
          <Field>
            <Label htmlFor="story-message">Mensagem</Label>
            <Textarea id="story-message" placeholder="Escreva uma mensagem curta e objetiva." />
          </Field>
          <Select
            ariaLabel="Canal"
            options={[
              { label: "Intranet", value: "intranet" },
              { label: "E-mail", value: "email" },
              { label: "TV corporativa", value: "tv" },
            ]}
            placeholder="Selecione o canal"
          />
        </div>
      </section>

      <section className="hw-catalog__section">
        <div>
          <h2>Status que não depende só de cor</h2>
        </div>
        <div className="hw-catalog__demo hw-catalog__demo--row">
          <Badge tone="success">Ativa</Badge>
          <Badge tone="warning">Agendada</Badge>
          <Badge tone="danger">Falha no envio</Badge>
          <Badge tone="info">Em revisão</Badge>
          <Badge>Rascunho</Badge>
        </div>
      </section>

      <section className="hw-catalog__section">
        <div>
          <h2>Conteúdo com hierarquia previsível</h2>
        </div>
        <div className="hw-catalog__demo">
          <Card>
            <CardHeader>
              <div className="hw-catalog__person">
                <Avatar name="Maricy Souza" />
                <div>
                  <CardTitle>Pesquisa de clima</CardTitle>
                  <CardDescription>Última atualização há 12 minutos</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="summary">
                <TabsList aria-label="Detalhes da pesquisa">
                  <TabsTrigger value="summary">Resumo</TabsTrigger>
                  <TabsTrigger value="audience">Público</TabsTrigger>
                  <TabsTrigger value="history">Histórico</TabsTrigger>
                </TabsList>
                <TabsContent value="summary">
                  <p>Pronta para publicação em três unidades e dois canais.</p>
                </TabsContent>
                <TabsContent value="audience">Público estimado: 1.248 pessoas.</TabsContent>
                <TabsContent value="history">Duas revisões concluídas.</TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Sparkles aria-hidden="true" /> Contrato compartilhado; conteúdo do domínio.
            </CardFooter>
          </Card>
        </div>
      </section>
    </div>
  ),
};
