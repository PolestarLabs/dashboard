import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import Input from './Input.vue';

const meta: Meta<typeof Input> = {
  title: 'Stardust UI/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'number', 'email', 'password'],
    },
    placeholder: { control: { type: 'text' } },
    label: { control: { type: 'text' } },
    inline: { control: { type: 'boolean' } },
    disabled: { control: { type: 'boolean' } },
    multiline: { control: { type: 'boolean' } },
    required: { control: { type: 'boolean' } },
    error: { control: { type: 'text' } },
    minlength: { control: { type: 'number' } },
    maxlength: { control: { type: 'number' } },
    min: { control: { type: 'number' } },
    max: { control: { type: 'number' } },
    pattern: { control: { type: 'text' } },
    title: { control: { type: 'text' } },
  },
};

export default meta;

type Story = StoryObj<typeof Input>;

const inputRender = (initial = '') => (args: object) => ({
  setup() {
    const value = ref(initial);
    return { args, value };
  },
  components: { Input },
  template: '<Input v-model="value" v-bind="args" />',
});

export const Default: Story = {
  render: inputRender(),
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  render: inputRender('+'),
  args: {
    label: 'Local Prefix',
    placeholder: 'PREFIX',
  },
};

export const InlineLabel: Story = {
  render: inputRender(),
  args: {
    label: 'Server prefix',
    placeholder: '+',
    inline: true,
  },
};

export const BlockLabel: Story = {
  render: inputRender(),
  args: {
    label: 'Description',
    placeholder: 'Optional',
    inline: false,
  },
};

export const Multiline: Story = {
  render: inputRender(),
  args: {
    label: 'Welcome message',
    placeholder: 'Enter welcome message...',
    multiline: true,
  },
};

export const Disabled: Story = {
  render: inputRender('Read-only'),
  args: {
    label: 'Disabled field',
    disabled: true,
  },
};

export const Number: Story = {
  render: inputRender(0),
  args: {
    type: 'number',
    label: 'Level',
    placeholder: '0',
  },
};

/** Required field with asterisk indicator */
export const RequiredIndicator: Story = {
  render: inputRender(),
  args: {
    label: 'Username',
    placeholder: 'Enter username',
    required: true,
  },
};

/** Validation failed – error message displayed */
export const WithError: Story = {
  render: inputRender('ab'),
  args: {
    label: 'Username',
    placeholder: 'Enter username',
    required: true,
    minlength: 3,
    error: 'Username must be at least 3 characters',
  },
};

/** HTML5 required – submit form to see validation */
export const Required: Story = {
  render: (args: object) => ({
    setup() {
      const value = ref('');
      return { args, value };
    },
    components: { Input },
    template: '<form @submit.prevent><Input v-model="value" v-bind="args" /><button type="submit">Submit</button></form>',
  }),
  args: {
    label: 'Required field',
    placeholder: 'Cannot be empty',
    required: true,
  },
};

/** type="email" – browser validates format on submit */
export const Email: Story = {
  render: (args: object) => ({
    setup() {
      const value = ref('');
      return { args, value };
    },
    components: { Input },
    template: '<form @submit.prevent><Input v-model="value" v-bind="args" /><button type="submit">Submit</button></form>',
  }),
  args: {
    type: 'email',
    label: 'Email',
    placeholder: 'user@example.com',
    required: true,
  },
};

/** Invalid email – try submitting to see browser validation */
export const EmailInvalid: Story = {
  render: (args: object) => ({
    setup() {
      const value = ref('notanemail');
      return { args, value };
    },
    components: { Input },
    template: '<form @submit.prevent><Input v-model="value" v-bind="args" /><button type="submit">Submit</button></form>',
  }),
  args: {
    type: 'email',
    label: 'Email',
    placeholder: 'user@example.com',
    required: true,
  },
};

/** minlength/maxlength – browser validates length */
export const MinMaxLength: Story = {
  render: (args: object) => ({
    setup() {
      const value = ref('');
      return { args, value };
    },
    components: { Input },
    template: '<form @submit.prevent><Input v-model="value" v-bind="args" /><button type="submit">Submit</button></form>',
  }),
  args: {
    label: 'Username (3–20 chars)',
    placeholder: 'Enter username',
    minlength: 3,
    maxlength: 20,
    required: true,
  },
};

/** type="number" with min/max */
export const NumberMinMax: Story = {
  render: (args: object) => ({
    setup() {
      const value = ref(5);
      return { args, value };
    },
    components: { Input },
    template: '<form @submit.prevent><Input v-model="value" v-bind="args" /><button type="submit">Submit</button></form>',
  }),
  args: {
    type: 'number',
    label: 'Level (1–100)',
    placeholder: '1',
    min: 1,
    max: 100,
    required: true,
  },
};

/** pattern – regex validation (alphanumeric only) */
export const Pattern: Story = {
  render: (args: object) => ({
    setup() {
      const value = ref('');
      return { args, value };
    },
    components: { Input },
    template: '<form @submit.prevent><Input v-model="value" v-bind="args" /><button type="submit">Submit</button></form>',
  }),
  args: {
    label: 'Code (letters and numbers only)',
    placeholder: 'e.g. ABC123',
    pattern: '[A-Za-z0-9]+',
    title: 'Letters and numbers only',
    required: true,
  },
};
