import type { Meta, StoryObj } from '@storybook/vue3-vite';
import Badge from './Badge.vue';
import './Badge.scss';

const meta: Meta<typeof Badge> = {
  title: 'Stardust UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Numeric: Story = {
  args: { value: 3 },
};

export const Text: Story = {
  args: { value: 'NEW' },
};

export const InButton: Story = {
  render: (args) => ({
    components: { Badge },
    setup() {
      return { args };
    },
    template: `
      <button class="s-btn s-btn--primary relative">
        Notifications
        <span class="absolute -top-2 -right-2">
          <Badge v-bind="args" />
        </span>
      </button>
    `,
  }),
  args: { value: 9 },
};

