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
  },
};

export default meta;

type Story = StoryObj<typeof CardShowcaseCanvas>;

export const Default: Story = {
  args: {
    faceImageUrl: 'https://picsum.photos/160/180',
    backImageUrl: 'https://picsum.photos/160/180?blur=2',
    durationMs: 5000,
    easing: [0.68, -0.55, 0.27, 1.55],
    width: 200,
    height: 220,
  },
  render: (args) => ({
    components: { CardShowcaseCanvas },
    setup() {
      return { args };
    },
    template: `<CardShowcaseCanvas v-bind="args" />`,
  }),
};
