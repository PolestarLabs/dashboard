import type { Meta, StoryObj } from '@storybook/vue3-vite';
import Medal from './Medal.vue';
import './Medal.scss';

const meta: Meta<typeof Medal> = {
  title: 'Pollux-Specific Components/Cosmetics/Medal',
  component: Medal,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Medal>;

export const Basic: Story = {
  argTypes: {
    rarity: {
      control: { type: 'select' },
      options: ['UR', 'XR', 'SR', 'R', 'U', 'C', null],
    },
    medal: {
      control: { type: 'text' },
    },
    iconPosition: {
      control: { type: 'select' },
      options: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    },
  },
  args: {
    rarity: 'UR',
    medal: 'umbrella',
    iconPosition: 'top-left',
  },
  render: (args) => ({
    components: { Medal },
    setup() {
      return { args };
    },
    template: '<div style="width: 80px; height: 80px;"><Medal v-bind="args" /></div>',
  }),
};

