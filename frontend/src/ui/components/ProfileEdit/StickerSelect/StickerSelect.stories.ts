import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import StickerSelect from './StickerSelect.vue';
import { sampleStickerPacks, sampleStickers } from '../profileEditMockFixtures';

const meta: Meta<typeof StickerSelect> = {
  title: 'ProfileEdit/StickerSelect',
  component: StickerSelect,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    packOptions: { control: false },
    stickerOptions: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof StickerSelect>;

export const Default: Story = {
  render: (args) => ({
    setup() {
      const pack = ref(sampleStickerPacks[0].id);
      const sticker = ref(sampleStickers[0].id);
      return { args, pack, sticker };
    },
    components: { StickerSelect },
    template: '<StickerSelect v-model:packModelValue="pack" v-model:stickerModelValue="sticker" v-bind="args" />',
  }),
  args: {
    packOptions: sampleStickerPacks,
    stickerOptions: sampleStickers,
    accentColor: '#8b5cf6',
    packImageBase: 'https://cdn.pollux.gg/build/boosters/showcase/',
    stickerImageBase: 'https://cdn.pollux.gg/stickers/',
  },
};
