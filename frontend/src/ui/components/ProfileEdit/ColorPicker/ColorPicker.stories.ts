import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import ColorPicker from './ColorPicker.vue';

const meta: Meta<typeof ColorPicker> = {
  title: 'ProfileEdit/ColorPicker',
  component: ColorPicker,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    modelValue: { control: 'color' },
    swatches: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof ColorPicker>;

export const Default: Story = {
  render: (args) => ({
    setup() {
      const hex = ref('#8b5cf6');
      return { args, hex };
    },
    components: { ColorPicker },
    template: '<ColorPicker v-model="hex" v-bind="args" />',
  }),
  args: {
    title: 'Accent Color',
    showColorName: true,
    swatches: [
      { hex: '#8b5cf6', name: 'Violet' },
      { hex: '#ec4899', name: 'Pink' },
      { hex: '#06b6d4', name: 'Cyan' },
      '#f59e0b',
      '#10b981',
    ],
  },
};

export const NoSwatches: Story = {
  render: (args) => ({
    setup() {
      const hex = ref('#06b6d4');
      return { args, hex };
    },
    components: { ColorPicker },
    template: '<ColorPicker v-model="hex" v-bind="args" />',
  }),
  args: {
    title: 'Accent Color',
    swatches: [],
  },
};
