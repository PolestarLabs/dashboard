import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import MedalPickerNext from './MedalPickerNext.vue';
import type { MedalItem } from './MedalPicker.vue';
import { sampleMedals } from '../profileEditMockFixtures';

const meta: Meta<typeof MedalPickerNext> = {
  title: 'ProfileEdit/MedalPickerNext',
  component: MedalPickerNext,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    equipped: { control: false },
    inventory: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof MedalPickerNext>;

export const Default: Story = {
  render: () => ({
    setup() {
      const equipped = ref<MedalItem[]>(sampleMedals.slice(0, 6));
      const inventory = ref<MedalItem[]>(sampleMedals.slice(6));
      return { equipped, inventory };
    },
    components: { MedalPickerNext },
    template: '<MedalPickerNext :equipped="equipped" :inventory="inventory" />',
  }),
};
