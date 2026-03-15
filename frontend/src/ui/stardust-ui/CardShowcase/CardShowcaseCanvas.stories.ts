import type { Meta, StoryObj } from '@storybook/vue3-vite';
import CardShowcaseCanvas from './CardShowcaseCanvas.vue';

const meta: Meta<typeof CardShowcaseCanvas> = {
  title: 'Stardust UI/Misc/Card Showcase (Canvas)',
  component: CardShowcaseCanvas,
  tags: ['autodocs'],
  argTypes: {
    faceImageUrl: { control: 'text' },
    backImageUrl: { control: 'text' },
    durationMs: { control: 'number' },
    width: { control: 'number' },
    height: { control: 'number' },
    easing: {
      control: 'object',
      description: 'Cubic bezier easing function defined as [x1, y1, x2, y2]',
  },
    rotateX: { control: { type: 'range', min: 0, max: 360, step: 1 } },
    rotateY: { control: { type: 'range', min: 0, max: 360, step: 1 } },
    rotateZ: { control: { type: 'range', min: 0, max: 360, step: 1 } },
    borderRadius: { control: { type: 'range', min: 0, max: 100, step: 1 } },
  },
};

export default meta;

type Story = StoryObj<typeof CardShowcaseCanvas>;

export const Default: Story = {
  args: {
    faceImageUrl: 'https://i.imgur.com/UEo57Di.png',
    backImageUrl: 'https://i.imgur.com/oaL6JZ9.png',
    durationMs: 5000,
    easing: [0.68, -0.55, 0.27, 1.55],
    width: 200,
    height: 280,
    rotateX: 10,
    rotateY: 15,
    rotateZ: 0,
    borderRadius: 16,
  },
  render: (args) => ({
    components: { CardShowcaseCanvas },
    setup() {
      return { args };
    },
    template: `<CardShowcaseCanvas v-bind="args" />`,
  }),
};
