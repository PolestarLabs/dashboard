import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import SearchableSelectPlus, { SearchableSelectPlusOption } from './SearchableSelectPlus.vue';

const sampleOptions: SearchableSelectPlusOption[] = [
  { value: 'apple', label: 'Apple', tags: 'fruit red', rarity: 'C' },
  { value: 'banana', label: 'Banana', tags: 'fruit yellow', rarity: 'C' },
  { value: 'cherry', label: 'Cherry', tags: 'fruit red', rarity: 'R' },
  { value: 'date', label: 'Date', tags: 'fruit brown', rarity: 'U' },
  { value: 'elderberry', label: 'Elderberry', tags: 'fruit purple', rarity: 'SR' },
  { value: 'fig', label: 'Fig', tags: 'fruit purple', rarity: 'R' },
  { value: 'grape', label: 'Grape', tags: 'fruit green', rarity: 'U' },
  { value: 'honeydew', label: 'Honeydew', tags: 'fruit green', rarity: 'SR' },
  { value: 'kiwi', label: 'Kiwi', tags: 'fruit green', rarity: 'U' },
];

const meta: Meta<typeof SearchableSelectPlus> = {
  title: 'ProfileEdit/SearchableSelectPlus',
  component: SearchableSelectPlus,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    options: { control: false },
    filter: { control: false },
    columns: { control: { type: 'number', min: 1, max: 3, step: 1 } },
  },
};

export default meta;

type Story = StoryObj<typeof SearchableSelectPlus>;

export const Default: Story = {
  render: (args) => ({
    setup() {
      const value = ref(sampleOptions[0].value);
      return { args, value, sampleOptions };
    },
    components: { SearchableSelectPlus },
    template: `
      <SearchableSelectPlus
        v-model="value"
        :options="sampleOptions"
        placeholder="Search fruits..."
        label="Fruit"
        v-bind="args"
      />
      <p style="margin-top: 1rem; font-size: 0.9rem;">Selected: {{ value }}</p>
    `,
  }),
  args: {
    listMaxHeight: '30vh',
    triggerAriaLabel: 'Fruit selector',
  },
};

export const WithCustomOptionTemplate: Story = {
  render: (args) => ({
    setup() {
      const value = ref(sampleOptions[2].value);
      return { args, value, sampleOptions };
    },
    components: { SearchableSelectPlus },
    template: `
      <SearchableSelectPlus
        v-model="value"
        :options="sampleOptions"
        placeholder="Search fruits..."
        label="Fruit"
        v-bind="args"
      >
        <template #option="{ option }">
          <div style="display:flex; justify-content: space-between; gap: 0.5rem; width: 100%;">
            <span>{{ option.label }}</span>
            <span style="opacity: 0.7; font-size: 0.85rem;">{{ option.rarity }}</span>
          </div>
        </template>
      </SearchableSelectPlus>

      <p style="margin-top: 1rem; font-size: 0.9rem;">Selected: {{ value }}</p>
    `,
  }),
  args: {
    listMaxHeight: '30vh',
  },
};

export const ThreeColumnPersistentMenu: Story = {
  render: (args) => ({
    setup() {
      const value = ref(sampleOptions[0].value);
      return { args, value, sampleOptions };
    },
    components: { SearchableSelectPlus },
    template: `
      <SearchableSelectPlus
        v-model="value"
        :options="sampleOptions"
        placeholder="Search fruits..."
        label="Fruit"
        v-bind="args"
      />
      <p style="margin-top: 1rem; font-size: 0.9rem;">Selected: {{ value }}</p>
    `,
  }),
  args: {
    listMaxHeight: '40vh',
    columns: 3,
    closeOnOutsideClick: false,
  },
};
