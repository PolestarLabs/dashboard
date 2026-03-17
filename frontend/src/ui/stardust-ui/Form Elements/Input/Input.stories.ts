import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import Input from './Input.vue';

const meta: Meta<typeof Input> = {
  title: 'Stardust UI/Input',
  component: Input,
  tags: ['autodocs'],
  // We intentionally allow passing native input attrs via $attrs (min, max, minlength, pattern, etc.)
  // Storybook's typing doesn't know about $attrs, so we cast argTypes to any to avoid TS complaints.
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'number', 'email', 'password'],
    },
    placeholder: { control: { type: 'text' } },
    label: { control: { type: 'text' } },
    inline: { control: { type: 'boolean' } },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md'],
      description: 'sm matches Button sm (32px) for GlueContainer',
    },
    disabled: { control: { type: 'boolean' } },
    multiline: { control: { type: 'boolean' } },
    required: { control: { type: 'boolean' } },
    error: { control: { type: 'text' } },
    hint: { control: { type: 'text' } },
    minlength: { control: { type: 'number' } },
    maxlength: { control: { type: 'number' } },
    min: { control: { type: 'number' } },
    max: { control: { type: 'number' } },
    pattern: { control: { type: 'text' } },
    title: { control: { type: 'text' } },
  } as any,
};

export default meta;

type Story = StoryObj<any>;

const inputRender = (initial: string | number = '') => (args: object) => ({
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

/** Small size (32px height) – matches Button sm for GlueContainer */
export const Small: Story = {
  render: inputRender(),
  args: {
    placeholder: 'Placeholder',
    size: 'sm',
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

/** HTML5 required – leave empty and tab away to see validation */
export const Required: Story = {
  render: inputRender(),
  args: {
    label: 'Required field',
    placeholder: 'Cannot be empty',
    required: true,
  },
};

/** type="email" – blur with bad value to see validation */
export const Email: Story = {
  render: inputRender(),
  args: {
    type: 'email',
    label: 'Email',
    placeholder: 'user@example.com',
    required: true,
  },
};

/** Invalid email pre-filled – blur to trigger validation */
export const EmailInvalid: Story = {
  render: inputRender('notanemail'),
  args: {
    type: 'email',
    label: 'Email',
    placeholder: 'user@example.com',
    required: true,
  },
};

/** minlength/maxlength – blur with short value to see validation */
export const MinMaxLength: Story = {
  render: inputRender(),
  args: {
    label: 'Username (3–20 chars)',
    placeholder: 'Enter username',
    minlength: 3,
    maxlength: 20,
    required: true,
  },
};

/** type="number" with min/max – blur out of range to see validation */
export const NumberMinMax: Story = {
  render: inputRender(5),
  args: {
    type: 'number',
    label: 'Level (1–100)',
    placeholder: '1',
    min: 1,
    max: 100,
    required: true,
  },
};

/** pattern – blur with non-alphanumeric value to see validation */
export const Pattern: Story = {
  render: inputRender(),
  args: {
    label: 'Code (letters and numbers only)',
    placeholder: 'e.g. ABC123',
    pattern: '[A-Za-z0-9]+',
    title: 'Letters and numbers only',
    required: true,
  },
};

/** hint prop — helper text that disappears when an error is shown */
export const WithHint: Story = {
  render: inputRender(),
  args: {
    label: 'Server prefix',
    placeholder: '+',
    hint: 'This is used to trigger bot commands. Keep it short.',
  },
};

/** prefix slot — icon or text before the value */
export const WithPrefix: Story = {
  render: (args: object) => ({
    setup() {
      const value = ref('');
      return { args, value };
    },
    components: { Input },
    template: `<Input v-model="value" v-bind="args"><template #prefix>🔍</template></Input>`,
  }),
  args: {
    placeholder: 'Search…',
  },
};

/** suffix slot — unit, icon or action after the value */
export const WithSuffix: Story = {
  render: (args: object) => ({
    setup() {
      const value = ref('');
      return { args, value };
    },
    components: { Input },
    template: `<Input v-model="value" v-bind="args"><template #suffix>%</template></Input>`,
  }),
  args: {
    label: 'Tax rate',
    placeholder: '0',
    type: 'number',
  },
};

/** Both slots combined */
export const WithPrefixAndSuffix: Story = {
  render: (args: object) => ({
    setup() {
      const value = ref('');
      return { args, value };
    },
    components: { Input },
    template: `<Input v-model="value" v-bind="args"><template #prefix>https://</template><template #suffix>.com</template></Input>`,
  }),
  args: {
    label: 'Domain',
    placeholder: 'yoursite',
    hint: 'Enter only the subdomain part.',
  },
};
