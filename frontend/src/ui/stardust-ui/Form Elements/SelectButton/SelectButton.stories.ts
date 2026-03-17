import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import SelectButton from './SelectButton.vue';

const meta: Meta<typeof SelectButton> = {
  title: 'Stardust UI/Form Elements/SelectButton',
  component: SelectButton,
  tags: ['autodocs'],
  argTypes: {
    label: { control: { type: 'text' } },
    disabled: { control: { type: 'boolean' } },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md'],
    },
    error: { control: { type: 'text' } },
  },
};

export default meta;

type Story = StoryObj<typeof SelectButton>;

const options = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

const selectButtonRender = (initial = 'daily') => (args: object) => ({
  setup() {
    const selected = ref<string | number>(initial);
    return { args, selected, options };
  },
  components: { SelectButton },
  template: `
    <div style="display:flex; flex-direction:column; gap:1rem; font-family: Panton, system-ui, sans-serif;">
      <SelectButton v-model="selected" :options="options" v-bind="args" />
      <div>Selected: {{ selected }}</div>
    </div>
  `,
});

export const Default: Story = {
  render: selectButtonRender('daily'),
  args: {
    label: 'Update frequency',
  },
};

export const Small: Story = {
  render: selectButtonRender('weekly'),
  args: {
    label: 'Update frequency',
    size: 'sm',
  },
};

export const WithError: Story = {
  render: selectButtonRender('daily'),
  args: {
    label: 'Update frequency',
    error: 'Please select a frequency',
  },
};

export const Disabled: Story = {
  render: selectButtonRender('monthly'),
  args: {
    label: 'Update frequency',
    disabled: true,
  },
};
