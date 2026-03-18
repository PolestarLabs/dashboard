import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import Select from './Select.vue';
import type { SelectOption } from './Select.vue';

const sampleOptions: SelectOption[] = [
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
];

const meta: Meta<typeof Select> = {
  title: 'Stardust UI/Select/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: { type: 'select' }, options: ['solid', 'ghost'] },
    size: { control: { type: 'select' }, options: ['sm', 'md'] },
    placeholder: { control: { type: 'text' } },
    label: { control: { type: 'text' } },
    disabled: { control: { type: 'boolean' } },
    error: { control: { type: 'text' } },
    listMaxHeight: { control: { type: 'text' } },
  },
};

export default meta;

type Story = StoryObj<typeof Select>;

const render = (initial: string | number = '') => (args: object) => ({
  setup() {
    const selected = ref(initial);
    return { args, selected };
  },
  components: { Select },
  template: `
    <div style="height: 300px;">
      <Select v-model="selected" v-bind="args" />
      <p style="margin-top: 1rem; font-size: 0.85rem; opacity: 0.7;">Selected: {{ selected }}</p>
    </div>
  `,
});

export const Solid: Story = {
  render: render('en'),
  args: {
    options: sampleOptions,
    variant: 'solid',
    label: 'Language',
  },
};

export const Ghost: Story = {
  render: render('en'),
  args: {
    options: sampleOptions,
    variant: 'ghost',
    label: 'Language',
  },
};

export const WithPlaceholder: Story = {
  render: render(''),
  args: {
    options: sampleOptions,
    placeholder: 'Choose language...',
  },
};

export const Small: Story = {
  render: render('de'),
  args: {
    options: sampleOptions,
    size: 'sm',
    label: 'Small select',
  },
};

export const ErrorState: Story = {
  render: render(''),
  args: {
    options: sampleOptions,
    placeholder: 'Required...',
    error: 'Please select a language',
    variant: 'ghost',
  },
};

export const Disabled: Story = {
  render: render('en'),
  args: {
    options: sampleOptions,
    label: 'Disabled',
    disabled: true,
  },
};
