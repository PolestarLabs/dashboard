import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import Toggle from './Toggle.vue';

const meta: Meta<typeof Toggle> = {
  title: 'Stardust UI/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  argTypes: {
    label: { control: { type: 'text' } },
    disabled: { control: { type: 'boolean' } },
  },
};

export default meta;

type Story = StoryObj<typeof Toggle>;

const toggleRender = (initial = false) => (args: object) => ({
  setup() {
    const checked = ref(initial);
    return { args, checked };
  },
  components: { Toggle },
  template: '<Toggle v-model="checked" v-bind="args" />',
});

export const Default: Story = {
  render: toggleRender(false),
  args: {},
};

export const Checked: Story = {
  render: toggleRender(true),
  args: {},
};

export const WithLabel: Story = {
  render: toggleRender(false),
  args: {
    label: 'Enable welcome messages',
  },
};

export const CheckedWithLabel: Story = {
  render: toggleRender(true),
  args: {
    label: 'Enable Global Prefix',
  },
};

export const Disabled: Story = {
  render: toggleRender(false),
  args: {
    label: 'Disabled toggle',
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  render: toggleRender(true),
  args: {
    label: 'Disabled (on)',
    disabled: true,
  },
};
