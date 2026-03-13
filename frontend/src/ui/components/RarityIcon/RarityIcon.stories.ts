import type { Meta, StoryObj } from '@storybook/vue3-vite';
import RarityIcon from './RarityIcon.vue';
import './RarityIcon.scss';

const meta: Meta<typeof RarityIcon> = {
  title: 'Stardust PLX/Rarity Icon',
  component: RarityIcon,
  tags: ['autodocs'],
  argTypes: {
    variant: {
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

export const UR: Story = { args: { variant: 'UR' } };
export const SR: Story = { args: { variant: 'SR' } };
export const R: Story = { args: { variant: 'R' } };
export const U: Story = { args: { variant: 'U' } };
export const C: Story = { args: { variant: 'C' } };
export const XR: Story = { args: { variant: 'XR' } };

export const All: Story = {
  render: () => ({
    components: { RarityIcon },
    template: `
      <div class="flex items-center gap-2">
        <RarityIcon variant="UR" />
        <RarityIcon variant="SR" />
        <RarityIcon variant="R" />
        <RarityIcon variant="U" />
        <RarityIcon variant="C" />
        <RarityIcon variant="XR" />
      </div>
    `,
  }),
};

