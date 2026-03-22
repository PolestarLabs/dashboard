import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import DraggableMedalGrid from './DraggableMedalGrid.vue';
import { sampleMedals } from '../ProfileEdit/profileEditMockFixtures';

type MedalItem = {
  id: string;
  name: string;
};

const meta: Meta<typeof DraggableMedalGrid> = {
  title: 'Pollux-specific Components/Profile Editor/DraggableMedalGrid',
  component: DraggableMedalGrid,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    equipped: { control: false },
    inventory: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof DraggableMedalGrid>;

export const Default: Story = {
  render: () => ({
    setup() {
      const equipped = ref<MedalItem[]>(
        sampleMedals
          .slice(0, 8)
          .map(({ id, name }, index) => ({ id: id ?? `equipped-${index}`, name })),
      );
      const inventory = ref<MedalItem[]>(
        sampleMedals
          .slice(8)
          .map(({ id, name }, index) => ({ id: id ?? `inventory-${index}`, name })),
      );

      return { equipped, inventory };
    },
    components: { DraggableMedalGrid },
    template:
      '<div style="width: 480px; padding: 16px; background: #111827; color: #f9fafb; border-radius: 8px;"><DraggableMedalGrid v-model:equipped="equipped" v-model:inventory="inventory" /></div>',
  }),
};
