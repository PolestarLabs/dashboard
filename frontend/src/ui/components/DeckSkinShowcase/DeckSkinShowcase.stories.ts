import type { Meta, StoryObj } from '@storybook/vue3-vite';
import DeckSkinShowcase from './DeckSkinShowcase.vue';
import RarityboxCard from '../RarityboxCard/RarityboxCard.vue';
import RarityboxButton from '../RarityboxButton/RarityboxButton.vue';

const meta: Meta<typeof DeckSkinShowcase> = {
  title: 'Pollux-Specific Components/Deck Skin Showcase',
  component: DeckSkinShowcase,
  tags: ['autodocs'],
  argTypes: {
    game: { control: { type: 'select' }, options: ['casino', 'tarot'] },
    skinId: { control: 'text' },
    frontCard: {
      control: { type: 'select' },
      options: ['HQ', 'star'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof DeckSkinShowcase>;

export const Default: Story = {
  args: {
    game: 'casino',
    skinId: 'yugioh',
    frontCard: 'HQ',
  },
  render: (args) => ({
    components: { DeckSkinShowcase },
    setup() {
      return { args };
    },
    template: `<DeckSkinShowcase v-bind="args" />`,
  }),
};

export const TarotFront: Story = {
  args: {
    game: 'tarot',
    skinId: 'persona3',
    frontCard: 'star',
  },
  render: (args) => ({
    components: { DeckSkinShowcase },
    setup() {
      return { args };
    },
    template: `<DeckSkinShowcase v-bind="args" />`,
  }),
};

export const InsideRarityboxCard: Story = {
  args: {
    game: 'casino',
    skinId: 'yugioh',
    frontCard: 'HQ',
  },
  render: (args) => ({
    components: { RarityboxCard, DeckSkinShowcase, RarityboxButton },
    setup() {
      return { args };
    },
    template: `
      <RarityboxCard rarity="SR" style="width: 240px;">
        <template #header>
          <span class="s-title">Deck Skin</span>
        </template>
        <template #default>
          <DeckSkinShowcase v-bind="args" />
        </template>
        <template #footer>
          <RarityboxButton variant="advcraft">Adv. Craft</RarityboxButton>
        </template>
      </RarityboxCard>
    `,
  }),
};
