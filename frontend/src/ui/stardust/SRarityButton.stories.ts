import type { Meta, StoryObj } from '@storybook/vue3-vite';
import SRarityButton from './SRarityButton.vue';

const meta: Meta<typeof SRarityButton> = {
  title: 'Stardust/SRarityButton',
  component: SRarityButton,
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

type Story = StoryObj<typeof SRarityButton>;

export const Default: Story = {
  args: { variant: 'default' },
  render: (args) => ({
    components: { SRarityButton },
    setup() {
      return { args };
    },
    template: `
      <SRarityButton v-bind="args">
        <span class="s-rarity-btn__price">Buy</span>
      </SRarityButton>
    `,
  }),
};

export const SpecialAlt: Story = {
  args: { variant: 'special', alt: true },
  render: (args) => ({
    components: { SRarityButton },
    setup() {
      return { args };
    },
    template: `
      <SRarityButton v-bind="args">
        <i class="fas fa-star" aria-hidden="true"></i>
        <span class="s-rarity-btn__price">Special</span>
      </SRarityButton>
    `,
  }),
};

export const Sticker: Story = {
  args: { variant: 'sticker', alt: true },
  render: (args) => ({
    components: { SRarityButton },
    setup() {
      return { args };
    },
    template: `
      <SRarityButton v-bind="args">
        <i class="fas fa-info-circle" aria-hidden="true"></i>
        <span class="s-rarity-btn__price">PACK INFO</span>
      </SRarityButton>
    `,
  }),
};

export const Craft: Story = {
  args: { variant: 'craft', alt: true },
  render: (args) => ({
    components: { SRarityButton },
    setup() {
      return { args };
    },
    template: `
      <SRarityButton v-bind="args">
        <i class="fas fa-flask" aria-hidden="true"></i>
        <span class="s-rarity-btn__price">CRAFT INFO</span>
      </SRarityButton>
    `,
  }),
};

export const EventWithPrice: Story = {
  args: { variant: 'event', alt: true },
  render: (args) => ({
    components: { SRarityButton },
    setup() {
      return { args };
    },
    template: `
      <SRarityButton v-bind="args">
        <i class="fas fa-ticket-alt" aria-hidden="true"></i>
        <span class="s-rarity-btn__price">1 500</span>
      </SRarityButton>
    `,
  }),
};

export const Search: Story = {
  args: { variant: 'search' },
  render: (args) => ({
    components: { SRarityButton },
    setup() {
      return { args };
    },
    template: `
      <SRarityButton v-bind="args">
        <span class="s-rarity-btn__price">Search</span>
      </SRarityButton>
    `,
  }),
};

export const Disabled: Story = {
  args: { variant: 'default', disabled: true },
  render: (args) => ({
    components: { SRarityButton },
    setup() {
      return { args };
    },
    template: `
      <SRarityButton v-bind="args">
        <i class="fas fa-check" aria-hidden="true"></i>
        <span class="s-rarity-btn__price">Obtained</span>
      </SRarityButton>
    `,
  }),
};

export const Limitless: Story = {
  args: { variant: 'default', limitless: true },
  render: (args) => ({
    components: { SRarityButton },
    setup() {
      return { args };
    },
    template: `
      <SRarityButton v-bind="args">
        <span class="s-rarity-btn__price">Wide label</span>
      </SRarityButton>
    `,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    components: { SRarityButton },
    template: `
      <div class="flex flex-wrap gap-4 p-4 bg-base-300 rounded-lg">
        <SRarityButton variant="default"><span class="s-rarity-btn__price">Default</span></SRarityButton>
        <SRarityButton variant="sticker" alt><i class="fas fa-box" aria-hidden="true"></i><span class="s-rarity-btn__price">Sticker</span></SRarityButton>
        <SRarityButton variant="special" alt><i class="fas fa-star" aria-hidden="true"></i><span class="s-rarity-btn__price">Special</span></SRarityButton>
        <SRarityButton variant="craft" alt><i class="fas fa-flask" aria-hidden="true"></i><span class="s-rarity-btn__price">Craft</span></SRarityButton>
        <SRarityButton variant="advcraft" alt><i class="fas fa-vial" aria-hidden="true"></i><span class="s-rarity-btn__price">Adv. Craft</span></SRarityButton>
        <SRarityButton variant="event" alt><i class="fas fa-ticket-alt" aria-hidden="true"></i><span class="s-rarity-btn__price">Event</span></SRarityButton>
        <SRarityButton variant="search"><span class="s-rarity-btn__price">Search</span></SRarityButton>
      </div>
    `,
  }),
};
