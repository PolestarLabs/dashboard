import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import MedalPicker from './MedalPicker.vue';
import type { MedalItem } from './MedalPicker.vue';
import { sampleMedals, sampleUserProfile } from '../profileEditMockFixtures';

const meta: Meta<typeof MedalPicker> = {
  title: 'ProfileEdit/MedalPicker',
  component: MedalPicker,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    equipped: { control: false },
    inventory: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof MedalPicker>;

export const Default: Story = {
  render: (args) => ({
    setup() {
      const equippedIds = sampleUserProfile.profile.medals as readonly string[];
      const equipped = ref<(MedalItem | null)[]>(
        equippedIds.map((id) => sampleMedals.find((m) => m.icon === id) || null)
      );
      const inventory = ref<MedalItem[]>(
        sampleMedals.filter((m) => !equippedIds.includes(m.icon || ''))
      );
      return { args, equipped, inventory };
    },
    components: { MedalPicker },
    template: '<MedalPicker v-model:equipped="equipped" v-model:inventory="inventory" v-bind="args" />',
  }),
  args: {},
};
