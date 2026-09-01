import {
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
} from "@hywork/ui";

export default function Home() {
  return (
    <main className="min-h-screen bg-surface-subtle p-8 font-body text-text" data-surface="admin">
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <Badge tone="info">Consumer smoke</Badge>
          <CardTitle as="h1">Next + Tailwind v3</CardTitle>
          <CardDescription>
            O fixture importa a API pública, os tokens e o preset publicados pelo pacote.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Field>
            <Label htmlFor="smoke-name">Nome da campanha</Label>
            <Input id="smoke-name" placeholder="Boas-vindas de outubro" />
            <FieldHint>Este formulário não contém dependência de produto.</FieldHint>
          </Field>
        </CardContent>
        <CardFooter>
          <Button>Validar contrato</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
