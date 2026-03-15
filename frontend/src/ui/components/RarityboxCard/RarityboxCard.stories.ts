import type { Meta, StoryObj } from '@storybook/vue3-vite';
import RarityboxCard from './RarityboxCard.vue';
import RarityboxButton from '../RarityboxButton/RarityboxButton.vue';

const meta: Meta<typeof RarityboxCard> = {
  title: 'Pollux-Specific Components/Raritybox Card',
  component: RarityboxCard,
  tags: ['autodocs'],
  argTypes: {
    rarity: {
      control: { type: 'select' },
      options: ['C', 'U', 'R', 'SR', 'UR', 'XR'],
    },
    imageUrl: { control: 'text', description: 'Background image URL for the card image area' },
    obtained: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof RarityboxCard>;

export const Default: Story = {
  args: { rarity: 'C' },
  render: (args) => ({
    components: { RarityboxCard },
    setup() {
      return { args };
    },
    template: `
      <RarityboxCard v-bind="args" style="width: 220px;">
        <template #default>
          <span>Card body content</span>
        </template>
      </RarityboxCard>
    `,
  }),
};

export const WithBackgroundImage: Story = {
  args: {
    rarity: 'R',
    imageUrl: 'https://cdn.waifu.im/7623.jpg',
  },
  render: (args) => ({
    components: { RarityboxCard, RarityboxButton },
    setup() {
      return { args };
    },
    template: `
      <RarityboxCard v-bind="args" style="width: 240px;">
        <template #header>
          <span class="s-title">With image</span>
        </template>
        <template #footer>
          <RarityboxButton variant="default">Action</RarityboxButton>
        </template>
      </RarityboxCard>
    `,
  }),
};

export const WithHeader: Story = {
  args: { rarity: 'SR' },
  render: (args) => ({
    components: { RarityboxCard },
    setup() {
      return { args };
    },
    template: `
      <RarityboxCard v-bind="args" style="width: 220px;">
        <template #header>
          <span class="s-title">SR Title</span>
        </template>
        <template #default>
          <p style="margin: 0; color: inherit;">Body content</p>
        </template>
      </RarityboxCard>
    `,
  }),
};

export const WithHeaderAndFooter: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Contents of the card bleeds into the header and footer, this is on purpose. For cases where we want contant overlay elements like a title or button, we can use the header and footer slots, but the card body is not confined to those areas. This allows for more flexible layouts and designs, such as full-bleed images or content that overlaps with the header/footer areas.',
      },
    },
  },
  args: { rarity: 'UR' },
  render: (args) => ({
    components: { RarityboxCard, RarityboxButton },
    setup() {
      return { args };
    },
    template: `
      <RarityboxCard v-bind="args" style="width: 240px;">
        <template #header>
          <span class="s-title">UR Card</span>
        </template>
        <template #default>
          <div style="padding-bottom: 1rem;">Raritybox card with header and footer.</div>
        </template>
        <template #footer>
          <RarityboxButton variant="special">Action</RarityboxButton>
        </template>
      </RarityboxCard>
    `,
  }),
};

const rarities = ['C', 'U', 'R', 'SR', 'UR', 'XR'] as const;

export const AllRarities: Story = {
  render: () => ({
    components: { RarityboxCard },
    setup() {
      return { rarities };
    },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 1rem;">
        <RarityboxCard
          v-for="r in rarities"
          :key="r"
          :rarity="r"
          style="width: 140px; min-height: 100px;"
        >
          <template #header>
            <span class="s-title">{{ r }}</span>
          </template>
          <template #default>
            <span style="font-size: 0.9rem;">Tier {{ r }}</span>
          </template>
        </RarityboxCard>
      </div>
    `,
  }),
};

export const Obtained: Story = {
  args: { rarity: 'SR', obtained: true },
  render: (args) => ({
    components: { RarityboxCard },
    setup() {
      return { args };
    },
    template: `
      <RarityboxCard v-bind="args" style="width: 200px;">
        <template #header>
          <span class="s-title">Obtained</span>
        </template>
        <template #default>
          <span>Greyed out (obtained)</span>
        </template>
      </RarityboxCard>
    `,
  }),
};

export const Unavailable: Story = {
  args: { rarity: 'R', disabled: true },
  render: (args) => ({
    components: { RarityboxCard },
    setup() {
      return { args };
    },
    template: `
      <RarityboxCard v-bind="args" style="width: 200px;">
        <template #header>
          <span class="s-title">Unavailable</span>
        </template>
        <template #default>
          <span>Disabled state</span>
        </template>
      </RarityboxCard>
    `,
  }),
};
