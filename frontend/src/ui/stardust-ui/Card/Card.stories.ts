import type { Meta, StoryObj } from '@storybook/vue3-vite';
import Card from './Card.vue';
import Button from '../Button/Button.vue';
import './Card.scss';
import '../Button/Button.scss';

const meta: Meta<typeof Card> = {
  title: 'Stardust UI/Card',
  component: Card,
  tags: ['autodocs'],
  args: {
    border: false,
    size: 'md',
    mediaAspectRatio: true,
  },
  argTypes: {
    border: { control: 'boolean' },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    mediaAspectRatio: { control: 'boolean', description: 'Media slot: fixed 16/10 aspect ratio (on) or natural height, top-center (off)' },
  },
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    size: 'md',
    border: false,
  },
  render: (args) => ({
    components: { Card, Button },
    setup() {
      return { args };
    },
    template: `
    <div>
      <Card :size="args.size" :border="args.border" :mediaAspectRatio="args.mediaAspectRatio">
        <template #media>
          <img src="https://cdn.waifu.im/6635.jpeg" alt="" />
        </template>
        <template #title>Card Title</template>
        <p>Use this as a base container for dashboard panels. Background is always light.</p>
        <template #buttons>
          <Button variant="primary">Action</Button>
        </template>
      </Card>
    </div>
    `,
  }),
};




export const Basic: Story = {
  args: {
    size: 'md',
    border: false,
  },
  render: (args) => ({
    components: { Card, Button },
    setup() {
      return { args };
    },
    template: `
    <div>
      <Card :size="args.size" :border="args.border">      
        <template #title>Card Title</template>
        <p>Use this as a base container for dashboard panels. Background is always light.</p>
      </Card>
    </div>
    `,
  }),
};

export const BodyOnly: Story = {
  render: (args) => ({
    components: { Card },
    setup() {
      return { args };
    },
    template: `
    <div>
      <Card v-bind="args">
        <p>Card without a title slot.</p>
      </Card>
    </div>
    `,
  }),
};

export const Small: Story = {
  args: { size: 'sm' },
  render: (args) => ({
    components: { Card },
    setup() {
      return { args };
    },
    template: `
    <div style="max-width: 280px;">
      <Card v-bind="args">
        <template #title>Compact</template>
        <p>Small card for tight layouts.</p>
      </Card>
    </div>
    `,
  }),
};

export const WithMedia: Story = {
  args: { size: 'md' },
  render: (args) => ({
    components: { Card },
    setup() {
      return { args };
    },
    template: `
    <div style="max-width: 360px;">
      <Card :size="args.size" :border="args.border" :mediaAspectRatio="args.mediaAspectRatio">
        <template #media>
          <img src="https://cdn.waifu.im/6616.jpeg" alt="" />
        </template>
        <template #title>Card with image</template>
        <p>Optional media slot for an image or video above the title.</p>
      </Card>
    </div>
    `,
  }),
};

export const WithButtons: Story = {
  args: { size: 'md' },
  render: (args) => ({
    components: { Card, Button },
    setup() {
      return { args };
    },
    template: `
    <div style="max-width: 360px;">
      <Card :size="args.size" :border="args.border">
        <template #title>Card with actions</template>
        <p>Use the buttons slot for primary and secondary actions.</p>
        <template #buttons>
          <Button size="sm" variant="ghost">Cancel</Button>
          <Button size="sm" variant="primary">Confirm</Button>
        </template>
      </Card>
    </div>
    `,
  }),
};

export const WithMediaAndButtons: Story = {
  args: { size: 'md' },
  render: (args) => ({
    components: { Card, Button },
    setup() {
      return { args };
    },
    template: `
    <div style="max-width: 360px;">
      <Card :size="args.size" :border="args.border" :mediaAspectRatio="args.mediaAspectRatio">
        <template #media>
          <img src="https://cdn.waifu.im/6688.jpeg" alt="" />
        </template>
        <template #title>Full card</template>
        <p>Media on top, body content, and action buttons in the footer.</p>
        <template #buttons>
          <Button variant="primary">Action</Button>
        </template>
      </Card>
    </div>
    `,
  }),
};

export const GridOfThree: Story = {
  render: () => ({
    components: { Card, Button },
    template: `
    <div class="st-card-grid">
      <Card>
        <template #title>Short Content</template>
        <p>Brief body.</p>
        <template #buttons>
          <Button size="sm" variant="primary">Action</Button>
        </template>
      </Card>
      <Card>
        <template #title>Longer Content</template>
        <p>This card has more body copy to demonstrate that footers align to the card bottom across the row regardless of content length.</p>
        <template #buttons>
          <Button size="sm" variant="primary">Action</Button>
        </template>
      </Card>
      <Card>
        <template #title>Third Card</template>
        <p>All three footers sit at the same baseline even with varying content heights.</p>
        <template #buttons>
          <Button size="sm" variant="ghost">Cancel</Button>
          <Button size="sm" variant="primary">Confirm</Button>
        </template>
      </Card>
    </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Cards in a responsive grid. Columns fill the container via `auto-fill`; footers are anchored to the card bottom across unequal content. Use the `.st-card-grid` helper class.',
      },
    },
  },
};
