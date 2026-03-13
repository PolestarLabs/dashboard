import type { Meta, StoryObj } from '@storybook/vue3-vite';
import Icon from '@/ui/stardust-ui/Icon/Icon.vue';
import Gem from './Gem.vue';
import '@/ui/stardust-ui/Icon/Icon.scss';
import './Gem.scss';

const meta: Meta<typeof Gem> = {
  title: 'Stardust PLX/Gem Icon',
  component: Gem,
  tags: ['autodocs'],
  argTypes: {
    v: {
      control: { type: 'select' },
      options: ['rubine', 'sapphire', 'jade', 'token', 'prism'],
    },
    size: {
      control: { type: 'select' },
      options: [24, 32, 48, 64],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Gem>;

export const Rubine24: Story = {
  args: { v: 'rubine', size: 24 },
};

export const Sapphire32: Story = {
  args: { v: 'sapphire', size: 32 },
};

export const Jade48: Story = {
  args: { v: 'jade', size: 48 },
};

export const AllVariants: Story = {
  render: () => ({
    components: { Gem, Icon },
    template: `
      <div class="flex flex-row items-center gap-4">
        <Gem v="rubine" :size="32" />
        <Gem v="sapphire" :size="32" />
        <Gem v="jade" :size="32" />
        <Gem v="token" :size="32" />
        <Gem v="prism" :size="32" />
      </div>
    `,
  }),
};

