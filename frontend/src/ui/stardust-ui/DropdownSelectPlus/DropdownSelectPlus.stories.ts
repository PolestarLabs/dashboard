import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import DropdownSelectPlus from './DropdownSelectPlus.vue';
import type { DropdownSelectPlusOption } from './DropdownSelectPlus.vue';

const meta: Meta<typeof DropdownSelectPlus> = {
  title: 'Stardust UI/Dropdown Select Plus',
  component: DropdownSelectPlus,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    viewport: { defaultViewport: 'responsive' },
  },
  argTypes: {
    options: {
      control: false,
      table: { type: { summary: 'DropdownSelectPlusOption[]' } },
    },
    size: { control: { type: 'select' }, options: ['default', 'large'] },
    lightBackground: { control: { type: 'boolean' } },
    placeholder: { control: { type: 'text' } },
    label: { control: { type: 'text' } },
    disabled: { control: { type: 'boolean' } },
    listMaxHeight: { control: { type: 'text' } },
    triggerAriaLabel: { control: { type: 'text' } },
  },
};

export default meta;

type Story = StoryObj<typeof DropdownSelectPlus>;

const baseOptions: DropdownSelectPlusOption[] = [
  { value: 'a', label: 'Option A', description: 'First choice', imageUrl: 'https://picsum.photos/32/23' },
  { value: 'b', label: 'Option B', description: 'Second choice', imageUrl: 'https://picsum.photos/32/24' },
  { value: 'c', label: 'Option C', description: 'Third choice', imageUrl: 'https://picsum.photos/32/25' },
  { value: 'd', label: 'Option D (no image)', description: 'Text only' },
];

export const Default: Story = {
  render: (args: object) => ({
    setup() {
      const selected = ref<string | number>('a');
      return { args, selected };
    },
    components: { DropdownSelectPlus },
    template: '<div style="height: 300px;"><DropdownSelectPlus v-model="selected" v-bind="args" /></div>',
  }),
  args: {
    options: baseOptions,
    placeholder: 'Choose...',
  },
};

export const WithLabel: Story = {
  render: (args: object) => ({
    setup() {
      const selected = ref<string | number>('b');
      return { args, selected };
    },
    components: { DropdownSelectPlus },
    template: '<DropdownSelectPlus v-model="selected" v-bind="args" />',
  }),
  args: {
    options: baseOptions,
    label: 'Select option',
    placeholder: 'Choose...',
  },
};

export const WithPlaceholder: Story = {
  render: (args: object) => ({
    setup() {
      const selected = ref<string | number>('');
      return { args, selected };
    },
    components: { DropdownSelectPlus },
    template: '<DropdownSelectPlus v-model="selected" v-bind="args" />',
  }),
  args: {
    options: baseOptions,
    placeholder: 'Pick one...',
  },
};

export const Large: Story = {
  render: (args: object) => ({
    setup() {
      const selected = ref<string | number>('c');
      return { args, selected };
    },
    components: { DropdownSelectPlus },
    template: '<DropdownSelectPlus v-model="selected" v-bind="args" />',
  }),
  args: {
    options: baseOptions,
    size: 'large',
    label: 'Large dropdown',
  },
};

export const Disabled: Story = {
  render: (args: object) => ({
    setup() {
      const selected = ref<string | number>('a');
      return { args, selected };
    },
    components: { DropdownSelectPlus },
    template: '<DropdownSelectPlus v-model="selected" v-bind="args" />',
  }),
  args: {
    options: baseOptions,
    disabled: true,
  },
};

export const LightBackground: Story = {
  render: (args: object) => ({
    setup() {
      const selected = ref<string | number>('a');
      return { args, selected };
    },
    components: { DropdownSelectPlus },
    template: '<div style="background: #1a1a2e; padding: 2rem; border-radius: 8px;"><DropdownSelectPlus v-model="selected" v-bind="args" /></div>',
  }),
  args: {
    options: baseOptions,
    lightBackground: true,
    label: 'On dark background',
  },
};

export const TextOnlyOptions: Story = {
  render: (args: object) => ({
    setup() {
      const selected = ref<string | number>('y');
      return { args, selected };
    },
    components: { DropdownSelectPlus },
    template: '<DropdownSelectPlus v-model="selected" v-bind="args" />',
  }),
  args: {
    options: [
      { value: 'x', label: 'Extra', description: 'No image' },
      { value: 'y', label: 'Yellow', description: 'Text only' },
      { value: 'z', label: 'Zebra', description: 'Also no image' },
    ],
    label: 'Text-only options',
    placeholder: 'Choose...',
  },
};
