import type { Meta, StoryObj } from '@storybook/vue3-vite';
import RarityboxButton from './RarityboxButton.vue';

const meta: Meta<typeof RarityboxButton> = {
  title: 'Stardust PLX/Raritybox Button',
  component: RarityboxButton,
  tags: ['autodocs'],
  argTypes: {
    tag: { control: { type: 'select' }, options: ['button', 'a'] },
    variant: {
      control: { type: 'select' },
      options: [
        'default',
        'sticker',
        'special',
        'craft',
        'advcraft',
        'event',
        'sapphires',
        'rubines',
        'search',
        'custom',
      ],
    },
    alt: { control: 'boolean' },
    limitless: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof RarityboxButton>;

export const Default: Story = {
  args: { variant: 'default' },
  render: (args) => ({
    components: { RarityboxButton },
    setup() {
      return { args };
    },
    template: `
      <RarityboxButton v-bind="args">
        <span class="s-rarity-btn__price">Buy</span>
      </RarityboxButton>
    `,
  }),
};

export const SpecialAlt: Story = {
  args: { variant: 'special', alt: true },
  render: (args) => ({
    components: { RarityboxButton },
    setup() {
      return { args };
    },
    template: `
      <RarityboxButton v-bind="args">
        <i class="fas fa-star" aria-hidden="true"></i>
        <span class="s-rarity-btn__price">Special</span>
      </RarityboxButton>
    `,
  }),
};

export const Sticker: Story = {
  args: { variant: 'sticker', alt: true },
  render: (args) => ({
    components: { RarityboxButton },
    setup() {
      return { args };
    },
    template: `
      <RarityboxButton v-bind="args">
        <i class="fas fa-info-circle" aria-hidden="true"></i>
        <span class="s-rarity-btn__price">PACK INFO</span>
      </RarityboxButton>
    `,
  }),
};

export const Craft: Story = {
  args: { variant: 'craft', alt: true },
  render: (args) => ({
    components: { RarityboxButton },
    setup() {
      return { args };
    },
    template: `
      <RarityboxButton v-bind="args">
        <i class="fas fa-flask" aria-hidden="true"></i>
        <span class="s-rarity-btn__price">CRAFT INFO</span>
      </RarityboxButton>
    `,
  }),
};

export const EventWithPrice: Story = {
  args: { variant: 'event', alt: true },
  render: (args) => ({
    components: { RarityboxButton },
    setup() {
      return { args };
    },
    template: `
      <RarityboxButton v-bind="args">
        <i class="fas fa-ticket-alt" aria-hidden="true"></i>
        <span class="s-rarity-btn__price">1 500</span>
      </RarityboxButton>
    `,
  }),
};

export const Search: Story = {
  args: { variant: 'search' },
  render: (args) => ({
    components: { RarityboxButton },
    setup() {
      return { args };
    },
    template: `
      <RarityboxButton v-bind="args">
        <span class="s-rarity-btn__price">Search</span>
      </RarityboxButton>
    `,
  }),
};

export const Disabled: Story = {
  args: { variant: 'default', disabled: true },
  render: (args) => ({
    components: { RarityboxButton },
    setup() {
      return { args };
    },
    template: `
      <RarityboxButton v-bind="args">
        <i class="fas fa-check" aria-hidden="true"></i>
        <span class="s-rarity-btn__price">Obtained</span>
      </RarityboxButton>
    `,
  }),
};

export const Limitless: Story = {
  args: { variant: 'default', limitless: true },
  render: (args) => ({
    components: { RarityboxButton },
    setup() {
      return { args };
    },
    template: `
      <RarityboxButton v-bind="args">
        <span class="s-rarity-btn__price">Wide label</span>
      </RarityboxButton>
    `,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    components: { RarityboxButton },
    template: `
      <div class="flex flex-wrap gap-4 p-4 bg-base-300 rounded-lg">
        <RarityboxButton variant="default"><span class="s-rarity-btn__price">Default</span></RarityboxButton>
        <RarityboxButton variant="sticker" alt><i class="fas fa-box" aria-hidden="true"></i><span class="s-rarity-btn__price">Sticker</span></RarityboxButton>
        <RarityboxButton variant="special" alt><i class="fas fa-star" aria-hidden="true"></i><span class="s-rarity-btn__price">Special</span></RarityboxButton>
        <RarityboxButton variant="craft" alt><i class="fas fa-flask" aria-hidden="true"></i><span class="s-rarity-btn__price">Craft</span></RarityboxButton>
        <RarityboxButton variant="advcraft" alt><i class="fas fa-vial" aria-hidden="true"></i><span class="s-rarity-btn__price">Adv. Craft</span></RarityboxButton>
        <RarityboxButton variant="event" alt><i class="fas fa-ticket-alt" aria-hidden="true"></i><span class="s-rarity-btn__price">Event</span></RarityboxButton>
        <RarityboxButton variant="search"><span class="s-rarity-btn__price">Search</span></RarityboxButton>
      </div>
    `,
  }),
};
