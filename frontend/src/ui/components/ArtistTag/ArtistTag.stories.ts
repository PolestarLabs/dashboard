import type { Meta, StoryObj } from '@storybook/vue3-vite';
import ArtistTag from './ArtistTag.vue';
import RarityboxCard from '../RarityboxCard/RarityboxCard.vue';
import RarityboxButton from '../RarityboxButton/RarityboxButton.vue';
import './ArtistTag.scss';

const meta: Meta<typeof ArtistTag> = {
  title: 'Pollux-Specific Components/Misc/Artist Tag',
  parameters: {
    backgrounds: { default: 'light' },
    docs: {
      description: {
        component: 'Artist attribution on artwork cards.',
      },
    },
  },
  component: ArtistTag,
  tags: ['autodocs'],
  argTypes: {
    href: { control: { type: 'text' } },
    noBackground: { control: { type: 'boolean' } },
  },
};

export default meta;

type Story = StoryObj<typeof ArtistTag>;

const demoWrapperStyle = 'width: 260px; height: 140px; background: var(--darker); display: flex; align-items: flex-end; padding: 12px;';

const basicStoryStyle =
  'width: 100vw; height: 148px; position: absolute; top: -100px; left: -100px; overflow: hidden;' +
  'background-color: var(--lighter); ' +
  'background-image: linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px); ' +
  'background-size: 20px 20px;';

export const Basic: Story = {
  args: {},
  render: (args: object) => ({
    components: { ArtistTag },
    setup() {
      return { args };
    },
    template: `
      <div :style="'${basicStoryStyle}'" />
      <ArtistTag v-bind="args">Artist Name</ArtistTag>
    `,
  }),
};

export const NoBackground: Story = {
  args: {
    noBackground: true,
  },
  render: (args: object) => ({
    components: { ArtistTag },
    setup() {
      return { args };
    },
    template: `
        <div :style="'${basicStoryStyle}'" />
        <ArtistTag v-bind="args">Artist Name</ArtistTag>

    `,
  }),
};

export const WithLink: Story = {
  args: {
    href: 'https://example.com/artist',
  },
  render: (args: object) => ({
    components: { ArtistTag },
    setup() {
      return { args };
    },
    template: `
      <div :style="'${basicStoryStyle}'" />
      <ArtistTag v-bind="args">Artist Name</ArtistTag>

    `,
  }),
};


/** ArtistTag with link inside RarityboxCard with background image */
export const InRarityboxWithImage: Story = {
  args: {
    href: 'https://example.com/artist/sakimichan',
  },
  render: (args: object) => ({
    components: { ArtistTag, RarityboxCard, RarityboxButton },
    setup() {
      return { args };
    },
    template: `
      <RarityboxCard rarity="SR" style="width: 220px;">
        <template #header>
          <span class="s-title">Card Title</span>
        </template>
        <template #image>
          <div
            style="
              position: relative;
              width: 100%;
              min-height: 180px;
              background-image: url(https://cdn.waifu.im/7623.jpg);
              background-size: cover;
              background-position: center;
            "
          >
            <ArtistTag
              v-bind="args"
            >
              Awesome Artist
            </ArtistTag>
          </div>
        </template>
        <template #footer>
           <RarityboxButton>View Artwork</RarityboxButton>
        </template>
      </RarityboxCard>
    `,
  }),
};

