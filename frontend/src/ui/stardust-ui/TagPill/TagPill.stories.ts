import type { Meta, StoryObj } from '@storybook/vue3-vite';
import TagPill from './TagPill.vue';

const meta: Meta<typeof TagPill> = {
  title: 'Stardust UI/Tag Pill',
  component: TagPill,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: { type: 'select' },
      options: ['default', 'accent', 'success', 'warning', 'error', 'neutral'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof TagPill>;

export const Single: Story = {
  args: { color: 'default' },
  render: (args) => ({
    components: { TagPill },
    setup() {
      return { args };
    },
    template: `<TagPill v-bind="args">Featured</TagPill>`,
  }),
};

export const Many: Story = {
  render: () => ({
    components: { TagPill },
    template: `
      <div class="flex flex-wrap gap-2">
        <TagPill>Featured</TagPill>
        <TagPill>Event</TagPill>
        <TagPill>Limited</TagPill>
      </div>
    `,
  }),
};

export const Colors: Story = {
  render: () => ({
    components: { TagPill },
    template: `
      <div class="flex flex-wrap gap-2">
        <TagPill color="default">Default</TagPill>
        <TagPill color="accent">Accent</TagPill>
        <TagPill color="success">Success</TagPill>
        <TagPill color="warning">Warning</TagPill>
        <TagPill color="error">Error</TagPill>
        <TagPill color="neutral">Neutral</TagPill>
      </div>
    `,
  }),
};

