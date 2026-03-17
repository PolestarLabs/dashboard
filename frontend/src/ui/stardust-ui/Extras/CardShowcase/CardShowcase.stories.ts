import type { Meta, StoryObj } from '@storybook/vue3-vite';
import CardShowcase from './CardShowcase.vue';

const meta: Meta<typeof CardShowcase> = {
  title: 'Stardust UI/Extras/Card Showcase',
  component: CardShowcase,
  tags: ['autodocs'],
  argTypes: {
    faceImageUrl: { control: 'text' },
    backImageUrl: { control: 'text' },
    faceAlt: { control: 'text' },
    backAlt: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof CardShowcase>;

export const Default: Story = {
  args: {
    faceImageUrl: 'https://picsum.photos/160/180',
    backImageUrl: 'https://picsum.photos/160/180?blur=2',
    faceAlt: 'Card face',
    backAlt: 'Card back',
  },
  render: (args) => ({
    components: { CardShowcase },
    setup() {
      return { args };
    },
    template: `<CardShowcase v-bind="args" />`,
  }),
};
