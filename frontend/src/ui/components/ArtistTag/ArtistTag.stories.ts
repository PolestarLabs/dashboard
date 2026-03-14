import type { Meta, StoryObj } from '@storybook/vue3-vite';
import ArtistTag from './ArtistTag.vue';
import './ArtistTag.scss';

const meta: Meta<typeof ArtistTag> = {
  title: 'Pollux-Specific Components/Misc/Artist Tag',
  component: ArtistTag,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ArtistTag>;

export const Basic: Story = {
  render: () => ({
    components: { ArtistTag },
    template: `
      <div class="relative inline-block" style="width: 260px; height: 140px; background:#222;">
        <ArtistTag>Artist Name</ArtistTag>
      </div>
    `,
  }),
};

