import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import Checkbox from './Checkbox.vue';

const meta: Meta<typeof Checkbox> = {
  title: 'Stardust UI/Form Elements/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    label: { control: { type: 'text' } },
    disabled: { control: { type: 'boolean' } },
  },
};

export default meta;

type Story = StoryObj<typeof Checkbox>;

const checkboxRender = (initial = false) => (args: object) => ({
  setup() {
    const checked = ref(initial);
    return { args, checked };
  },
  components: { Checkbox },
  template: `
    <div style="display:flex; flex-direction:column; gap:1rem; font-family: Panton, system-ui, sans-serif;">
      <Checkbox v-model="checked" label="Enable notifications" v-bind="args" />
      <div>Checked: {{ checked }}</div>
    </div>
  `,
});

export const Default: Story = {
  render: checkboxRender(false),
  args: {},
};

export const Checked: Story = {
  render: checkboxRender(true),
  args: {},
};

export const Disabled: Story = {
  render: checkboxRender(false),
  args: {
    disabled: true,
    label: 'Disabled',
  },
};
