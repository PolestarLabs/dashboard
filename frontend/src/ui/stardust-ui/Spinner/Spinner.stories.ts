import type { Meta, StoryObj } from '@storybook/vue3';
import Spinner from './Spinner.vue';

const meta: Meta<typeof Spinner> = {
  title: 'Stardust UI / Spinner',
  component: Spinner,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Diameter preset',
    },
    variant: {
      control: 'select',
      options: ['inherit', 'primary', 'secondary', 'white'],
      description: 'Color source',
    },
    label: {
      control: 'text',
      description: 'Accessible label announced by screen readers',
    },
  },
};
export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
  args: { size: 'md', variant: 'inherit', label: 'Loading…' },
};

export const Primary: Story = {
  args: { size: 'md', variant: 'primary' },
};

export const Secondary: Story = {
  args: { size: 'md', variant: 'secondary' },
};

export const Sizes: Story = {
  render: () => ({
    components: { Spinner },
    template: `
      <div style="display:flex;align-items:center;gap:24px;flex-wrap:wrap;">
        <Spinner size="xs" />
        <Spinner size="sm" />
        <Spinner size="md" />
        <Spinner size="lg" />
        <Spinner size="xl" />
      </div>`,
  }),
};

export const OnDarkBackground: Story = {
  render: () => ({
    components: { Spinner },
    template: `
      <div style="background:var(--bg-main,#1a1a2e);padding:24px;border-radius:8px;display:flex;gap:24px;align-items:center;">
        <Spinner variant="white" />
        <Spinner variant="primary" />
        <Spinner variant="secondary" />
      </div>`,
  }),
};
