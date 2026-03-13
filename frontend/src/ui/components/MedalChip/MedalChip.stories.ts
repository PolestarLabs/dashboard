import type { Meta, StoryObj } from '@storybook/vue3-vite';
import MedalChip from './MedalChip.vue';
import './MedalChip.scss';

const meta: Meta<typeof MedalChip> = {
  title: 'Stardust PLX/Misc/Medal Chip',
  component: MedalChip,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MedalChip>;

export const Basic: Story = {
  args: {
    backgroundImage: 'https://cdn.pollux.gg/medals/sample.png',
  },
  render: (args) => ({
    components: { MedalChip },
    setup() {
      return { args };
    },
    template: `
      <MedalChip v-bind="args">
        <template #rarity>
          <span class="badge badge-secondary text-xs">UR</span>
        </template>
      </MedalChip>
    `,
  }),
};

