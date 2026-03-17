import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import type { LanguageOption } from './LanguageSelect.vue';
import LanguageSelect from './LanguageSelect.vue';

const meta: Meta<typeof LanguageSelect> = {
  title: 'Stardust UI/Extras/Language Select',
  component: LanguageSelect,

  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Expands off the [DropdownSelectPlus](/docs/stardust-ui-dropdown-select-plus--docs) component.',
      },
    },
    layout: 'centered',
    viewport: { defaultViewport: 'responsive' },
  },
  argTypes: {
    languages: {
      control: false,
      table: { type: { summary: 'LanguageOption[]' } },
    },
    size: { control: { type: 'select' }, options: ['default', 'large'] },
    lightBackground: { control: { type: 'boolean' } },
    placeholder: { control: { type: 'text' } },
    label: { control: { type: 'text' } },
    disabled: { control: { type: 'boolean' } },
    flagBaseUrl: { control: { type: 'text' } },
    listMaxHeight: { control: { type: 'text' } },
  },
};

export default meta;

type Story = StoryObj<typeof LanguageSelect>;

const overrideLanguages: LanguageOption[] = [
  { value: 'en', label: 'English', description: 'ENGLISH', flag: 'united-states' },
  { value: 'fr', label: 'Français', description: 'FRENCH', flag: 'france' },
  { value: 'ja', label: '日本語', description: 'JAPANESE', flag: 'japan' },
  { value: 'tlh', label: 'tlhIngan Hol', description: 'KLINGON', flag: 'https://placehold.co/32x24/7c3aed/fff?text=KLG&font=roboto' },
];

export const Default: Story = {
  render: (args: object) => ({
    setup() {
      const selected = ref('en');
      return { args, selected };
    },
    components: { LanguageSelect },
    template: '<LanguageSelect v-model="selected" v-bind="args" />',
  }),
  args: {},
};

export const WithPlaceholder: Story = {
  render: (args: object) => ({
    setup() {
      const selected = ref('');
      return { args, selected };
    },
    components: { LanguageSelect },
    template: '<LanguageSelect v-model="selected" v-bind="args" />',
  }),
  args: {
    placeholder: 'Choose language...',
  },
};

export const WithLabel: Story = {
  render: (args: object) => ({
    setup() {
      const selected = ref('en');
      return { args, selected };
    },
    components: { LanguageSelect },
    template: '<LanguageSelect v-model="selected" v-bind="args" />',
  }),
  args: {
    label: 'Global language',
  },
};

export const Large: Story = {
  render: (args: object) => ({
    setup() {
      const selected = ref('en');
      return { args, selected };
    },
    components: { LanguageSelect },
    template: '<LanguageSelect v-model="selected" v-bind="args" />',
  }),
  args: {
    size: 'large',
    label: 'Language',
  },
};

export const PreselectedKorean: Story = {
  render: (args: object) => ({
    setup() {
      const selected = ref('ko');
      return { args, selected };
    },
    components: { LanguageSelect },
    template: '<LanguageSelect v-model="selected" v-bind="args" />',
  }),
  args: {
    label: 'Language',
  },
};

export const Disabled: Story = {
  render: (args: object) => ({
    setup() {
      const selected = ref('en');
      return { args, selected };
    },
    components: { LanguageSelect },
    template: '<LanguageSelect v-model="selected" v-bind="args" />',
  }),
  args: {
    disabled: true,
  },
};

export const LightBackground: Story = {
  render: (args: object) => ({
    setup() {
      const selected = ref('en');
      return { args, selected };
    },
    components: { LanguageSelect },
    template: '<div style="background: #1a1a2e; padding: 2rem; border-radius: 8px;"><LanguageSelect v-model="selected" v-bind="args" /></div>',
  }),
  args: {
    lightBackground: true,
    label: 'Language',
  },
};

export const WithOverride: Story = {
  render: (args: object) => ({
    setup() {
      const selected = ref('tlh');
      return { args, selected };
    },
    components: { LanguageSelect },
    template: '<LanguageSelect v-model="selected" v-bind="args" />',
  }),
  args: {
    languages: overrideLanguages,
    label: 'Custom list (override)',
  },
};
