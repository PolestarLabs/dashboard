import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import DropdownSelect from './DropdownSelect.vue';
import type { DropdownSelectOption } from './DropdownSelect.vue';

const meta: Meta<typeof DropdownSelect> = {
  title: 'Stardust UI/Select/Dropdown Select',
  component: DropdownSelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    viewport: { defaultViewport: 'responsive' },
  },
  argTypes: {
    options: { control: false },
    variant: { control: { type: 'select' }, options: ['solid', 'ghost'] },
    size: { control: { type: 'select' }, options: ['sm', 'md', 'lg'] },
    lightBackground: { control: { type: 'boolean' } },
    placeholder: { control: { type: 'text' } },
    label: { control: { type: 'text' } },
    disabled: { control: { type: 'boolean' } },
    listMaxHeight: { control: { type: 'text' } },
  },
};

export default meta;

type Story = StoryObj<typeof DropdownSelect>;

const baseOptions: DropdownSelectOption[] = [
  { value: 'a', label: 'Option A', description: 'First choice', imageUrl: 'https://picsum.photos/32/23' },
  { value: 'b', label: 'Option B', description: 'Second choice', imageUrl: 'https://picsum.photos/32/24' },
  { value: 'c', label: 'Option C', description: 'Third choice', imageUrl: 'https://picsum.photos/32/25' },
  { value: 'd', label: 'Option D (no image)', description: 'Text only' },
];

export const Solid: Story = {
  render: (args: object) => ({
    setup() {
      const selected = ref<string | number>('a');
      return { args, selected };
    },
    components: { DropdownSelect },
    template: '<div style="height: 300px;"><DropdownSelect v-model="selected" v-bind="args" /></div>',
  }),
  args: {
    options: baseOptions,
    variant: 'solid',
    placeholder: 'Choose...',
    label: 'Dropdown (solid)',
  },
};

export const Ghost: Story = {
  render: (args: object) => ({
    setup() {
      const selected = ref<string | number>('b');
      return { args, selected };
    },
    components: { DropdownSelect },
    template: '<div style="height: 300px;"><DropdownSelect v-model="selected" v-bind="args" /></div>',
  }),
  args: {
    options: baseOptions,
    variant: 'ghost',
    placeholder: 'Choose...',
    label: 'Dropdown (ghost)',
  },
};

export const Large: Story = {
  render: (args: object) => ({
    setup() {
      const selected = ref<string | number>('c');
      return { args, selected };
    },
    components: { DropdownSelect },
    template: '<div style="height: 350px;"><DropdownSelect v-model="selected" v-bind="args" /></div>',
  }),
  args: {
    options: baseOptions,
    size: 'lg',
    label: 'Large dropdown',
  },
};

export const WithPlaceholder: Story = {
  render: (args: object) => ({
    setup() {
      const selected = ref<string | number>('');
      return { args, selected };
    },
    components: { DropdownSelect },
    template: '<div style="height: 300px;"><DropdownSelect v-model="selected" v-bind="args" /></div>',
  }),
  args: {
    options: baseOptions,
    placeholder: 'Pick one...',
  },
};

export const Disabled: Story = {
  render: (args: object) => ({
    setup() {
      const selected = ref<string | number>('a');
      return { args, selected };
    },
    components: { DropdownSelect },
    template: '<DropdownSelect v-model="selected" v-bind="args" />',
  }),
  args: {
    options: baseOptions,
    disabled: true,
    label: 'Disabled',
  },
};
