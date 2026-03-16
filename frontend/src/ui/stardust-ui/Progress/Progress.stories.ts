import type { Meta, StoryObj } from '@storybook/vue3';
import Progress from './Progress.vue';

const meta: Meta<typeof Progress> = {
  title: 'Stardust UI / Progress',
  component: Progress,
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    indeterminate: { control: 'boolean' },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    variant: { control: 'select', options: ['default', 'success', 'danger', 'warning'] },
    showLabel: { control: 'boolean' },
    label: { control: 'text' },
  },
};
export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  args: { value: 60, size: 'md', variant: 'default' },
};

export const WithLabel: Story = {
  args: { value: 72, showLabel: true },
};

export const Indeterminate: Story = {
  args: { indeterminate: true, label: 'Loading content…' },
};

export const Variants: Story = {
  render: () => ({
    components: { Progress },
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;max-width:400px;">
        <Progress :value="80" variant="default" :showLabel="true" />
        <Progress :value="65" variant="success" :showLabel="true" />
        <Progress :value="45" variant="warning" :showLabel="true" />
        <Progress :value="30" variant="danger"  :showLabel="true" />
      </div>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { Progress },
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;max-width:400px;">
        <Progress :value="70" size="sm" />
        <Progress :value="70" size="md" />
        <Progress :value="70" size="lg" />
      </div>`,
  }),
};
