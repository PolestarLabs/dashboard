import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import Select from './Select.vue';
import type { SelectOption } from './Select.vue';

const sampleOptions: SelectOption[] = [
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
];

const meta: Meta<typeof Select> = {
  title: 'Stardust UI/Form Elements/Select',
  component: Select,
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: { type: 'text' } },
    label: { control: { type: 'text' } },
    inline: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
  },
};

export default meta;

type Story = StoryObj<typeof Select>;

const selectRender = (initial: string | number = '') => (args: object) => ({
  setup() {
    const selected = ref(initial);
    return { args, selected };
  },
  components: { Select },
  template: '<Select v-model="selected" v-bind="args" />',
});

export const Default: Story = {
  render: selectRender('en'),
  args: {
    options: sampleOptions,
  },
};

export const WithPlaceholder: Story = {
  render: selectRender(''),
  args: {
    options: sampleOptions,
    placeholder: 'Choose language...',
  },
};

export const WithLabel: Story = {
  render: selectRender('en'),
  args: {
    label: 'Language',
    options: sampleOptions,
    inline: true,
  },
};

export const BlockLabel: Story = {
  render: selectRender('1'),
  args: {
    label: 'Channel',
    options: [
      { value: '1', label: '# general' },
      { value: '2', label: '# announcements' },
    ],
    inline: false,
  },
};

export const Disabled: Story = {
  render: selectRender('en'),
  args: {
    label: 'Disabled select',
    options: sampleOptions,
    disabled: true,
  },
};
