import type { Meta, StoryObj } from '@storybook/vue3-vite';
import Icon from '@/ui/stardust-ui/Icon/Icon.vue';
import Gem from './Gem.vue';
import '@/ui/stardust-ui/Icon/Icon.scss';
import './Gem.scss';

const meta: Meta<typeof Gem> = {
  title: 'Pollux-Specific Components/Gem Icon',
  component: Gem,
  tags: ['autodocs'],
  argTypes: {
    v: {
      control: { type: 'select' },
      options: ['RBN', 'SPH', 'JDE', 'EVT', 'PSM', 'COS'],
    },
    size: {
      control: { type: 'select' },
      options: [24, 32, 48, 64],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Gem>;

export const RBN48: Story = {
  args: { v: 'RBN', size: 48 },
};

export const SPH32: Story = {
  args: { v: 'SPH', size: 32 },
};

export const JDE24: Story = {
  args: { v: 'JDE', size: 24 },
};

export const AllVariants: Story = {
  render: () => ({
    components: { Gem, Icon },
    template: `
      <div class="flex flex-row items-center gap-4">
        <Gem v="RBN" :size="32" />
        <Gem v="SPH" :size="32" />
        <Gem v="JDE" :size="32" />
        <Gem v="EVT" :size="32" />
        <Gem v="PSM" :size="32" />
        <Gem v="COS" :size="32" />
      </div>
    `,
  }),
};

