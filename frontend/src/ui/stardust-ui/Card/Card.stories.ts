import type { Meta, StoryObj } from '@storybook/vue3-vite';
import Card from './Card.vue';

const meta: Meta<typeof Card> = {
  title: 'Stardust UI/Card',
  component: Card,
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Basic: Story = {
  render: (args) => ({
    components: { Card },
    setup() {
      return { args };
    },
    template: `
      <Card v-bind="args">
        <h3 class="font-bold mb-2">Stardust Card</h3>
        <p class="text-sm text-base-content/80">
          Use this as a base container for dashboard panels.
        </p>
      </Card>
    `,
  }),
};
