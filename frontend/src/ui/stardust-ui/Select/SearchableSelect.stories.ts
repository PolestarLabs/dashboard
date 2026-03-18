import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import SearchableSelect from './SearchableSelect.vue';
import type { SelectOption } from './Select.vue';

const sampleOptions: SelectOption[] = [
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

const meta: Meta<typeof SearchableSelect> = {
  title: 'Stardust UI/Select/Searchable Select',
  component: SearchableSelect,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    options: { control: false },
    filter: { control: false },
    variant: { control: { type: 'select' }, options: ['solid', 'ghost'] },
    size: { control: { type: 'select' }, options: ['sm', 'md'] },
    columns: { control: { type: 'number', min: 1, max: 3, step: 1 } },
  },
};

export default meta;

type Story = StoryObj<typeof SearchableSelect>;

export const Ghost: Story = {
  render: (args) => ({
    setup() {
      const value = ref(sampleOptions[0].value);
      return { args, value, sampleOptions };
    },
    components: { SearchableSelect },
    template: `
      <div style="height: 380px; width: 320px;">
        <SearchableSelect
          v-model="value"
          :options="sampleOptions"
          placeholder="Search fruits..."
          label="Fruit (ghost)"
          v-bind="args"
        />
        <p style="margin-top: 1rem; font-size: 0.85rem; opacity: 0.7;">Selected: {{ value }}</p>
      </div>
    `,
  }),
  args: {
    variant: 'ghost',
    listMaxHeight: '30vh',
  },
};

export const Solid: Story = {
  render: (args) => ({
    setup() {
      const value = ref(sampleOptions[2].value);
      return { args, value, sampleOptions };
    },
    components: { SearchableSelect },
    template: `
      <div style="height: 380px; width: 320px;">
        <SearchableSelect
          v-model="value"
          :options="sampleOptions"
          placeholder="Search fruits..."
          label="Fruit (solid)"
          v-bind="args"
        />
        <p style="margin-top: 1rem; font-size: 0.85rem; opacity: 0.7;">Selected: {{ value }}</p>
      </div>
    `,
  }),
  args: {
    variant: 'solid',
    listMaxHeight: '30vh',
  },
};

export const WithCustomOptionTemplate: Story = {
  render: (args) => ({
    setup() {
      const value = ref(sampleOptions[2].value);
      return { args, value, sampleOptions };
    },
    components: { SearchableSelect },
    template: `
      <div style="height: 380px; width: 320px;">
        <SearchableSelect
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
        </SearchableSelect>
        <p style="margin-top: 1rem; font-size: 0.85rem; opacity: 0.7;">Selected: {{ value }}</p>
      </div>
    `,
  }),
  args: {
    listMaxHeight: '30vh',
  },
};

export const ThreeColumnGrid: Story = {
  render: (args) => ({
    setup() {
      const value = ref(sampleOptions[0].value);
      return { args, value, sampleOptions };
    },
    components: { SearchableSelect },
    template: `
      <div style="height: 500px; width: 500px;">
        <SearchableSelect
          v-model="value"
          :options="sampleOptions"
          placeholder="Search fruits..."
          label="Fruit (3-column)"
          v-bind="args"
        />
        <p style="margin-top: 1rem; font-size: 0.85rem; opacity: 0.7;">Selected: {{ value }}</p>
      </div>
    `,
  }),
  args: {
    columns: 3,
    closeOnOutsideClick: false,
    listMaxHeight: '40vh',
  },
};
