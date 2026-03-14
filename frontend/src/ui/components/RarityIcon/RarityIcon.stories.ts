import type { Meta, StoryObj } from '@storybook/vue3-vite';
import RarityIcon from './RarityIcon.vue';
import './RarityIcon.scss';

const meta: Meta<typeof RarityIcon> = {
  title: 'Pollux-Specific Components/Rarity Icon',
  component: RarityIcon,
  tags: ['autodocs'],
  argTypes: {
    v: {
      control: { type: 'select' },
      options: ['UR', 'SR', 'R', 'U', 'C', 'XR'],
    },
    size: {
      control: { type: 'select' },
      options: [16, 24, 32, 48, 64],
    },
  },
};

export default meta;

type Story = StoryObj<typeof RarityIcon>;

export const UR: Story = { args: { v: 'UR' } };
export const SR: Story = { args: { v: 'SR' } };
export const R: Story = { args: { v: 'R' } };
export const U: Story = { args: { v: 'U' } };
export const C: Story = { args: { v: 'C' } };
export const XR: Story = { args: { v: 'XR' } };

export const All: Story = {
  render: () => ({
    components: { RarityIcon },
    template: `
      <div class="flex items-center gap-2">
        <RarityIcon v="UR" />
        <RarityIcon v="SR" />
        <RarityIcon v="R" />
        <RarityIcon v="U" />
        <RarityIcon v="C" />
        <RarityIcon v="XR" />
      </div>
    `,
  }),
};

