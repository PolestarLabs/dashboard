import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import BackgroundPicker from './BackgroundPicker.vue';
import { sampleBackgrounds } from '../profileEditMockFixtures';

const meta: Meta<typeof BackgroundPicker> = {
  title: 'ProfileEdit/BackgroundPicker',
  component: BackgroundPicker,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    options: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof BackgroundPicker>;

export const Default: Story = {
  render: (args) => ({
    setup() {
      const value = ref(sampleBackgrounds[0].code);
      const sortBy = ref('obtained');
      return { args, value, sortBy };
    },
    components: { BackgroundPicker },
    template: '<BackgroundPicker v-model="value" :sort-by="sortBy" :options="args.options" :accent-color="args.accentColor" @sort="sortBy = $event" />',
  }),
  args: {
    options: sampleBackgrounds,
    accentColor: '#8b5cf6',
  },
};
