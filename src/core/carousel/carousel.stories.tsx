import type { Meta, StoryObj } from "@storybook/react-vite";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./index";

const meta = { title: "Core/Carousel", component: Carousel } satisfies Meta<typeof Carousel>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Decisão da PO (Carrossel · Opção A): setas circulares de 28px nas laterais,
 * na linha do trilho, sem indicadores de posição.
 */
export const Padrao: Story = {
  render: () => (
    <Carousel className="w-[560px]" opts={{ align: "start" }}>
      <CarouselContent>
        {Array.from({ length: 6 }).map((_, i) => (
          <CarouselItem key={i} className="basis-1/2">
            <div className="flex h-24 items-center justify-center rounded-md border bg-muted text-sm">
              Item {i + 1}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};

/** Com tudo visível, as duas setas ficam desabilitadas, mas continuam no lugar. */
export const SemRolagem: Story = {
  render: () => (
    <Carousel className="w-[560px]">
      <CarouselContent>
        <CarouselItem>
          <div className="flex h-24 items-center justify-center rounded-md border bg-muted text-sm">
            Único item
          </div>
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};
