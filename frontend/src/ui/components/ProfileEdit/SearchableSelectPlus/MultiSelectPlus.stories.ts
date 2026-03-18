import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import MultiSelectPlus from './MultiSelectPlus.vue';
import type { SearchableSelectPlusOption } from './SearchableSelectPlus.vue';

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

const meta: Meta<typeof MultiSelectPlus> = {
  title: 'ProfileEdit/MultiSelectPlus',
  component: MultiSelectPlus,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    options: { control: false },
    filter: { control: false },
    columns: { control: { type: 'number', min: 1, max: 3, step: 1 } },
    maxVisibleTags: { control: { type: 'number', min: 1, max: 20, step: 1 } },
    max: { control: { type: 'number', min: 0, max: 20, step: 1 } },
  },
};

export default meta;

type Story = StoryObj<typeof MultiSelectPlus>;

export const Default: Story = {
  render: (args) => ({
    setup() {
      const values = ref<(string | number)[]>(['apple', 'cherry']);
      return { args, values, sampleOptions };
    },
    components: { MultiSelectPlus },
    template: `
      <div style="width: 340px;">
        <MultiSelectPlus
          v-model="values"
          :options="sampleOptions"
          placeholder="Select fruits..."
          label="Fruits"
          v-bind="args"
        />
        <p style="margin-top: 1rem; font-size: 0.9rem;">Selected: {{ values }}</p>
      </div>
    `,
  }),
  args: {
    listMaxHeight: '30vh',
    triggerAriaLabel: 'Fruit multi-selector',
  },
};

export const WithCustomOptionTemplate: Story = {
  render: (args) => ({
    setup() {
      const values = ref<(string | number)[]>(['fig']);
      return { args, values, sampleOptions };
    },
    components: { MultiSelectPlus },
    template: `
      <div style="width: 340px;">
        <MultiSelectPlus
          v-model="values"
          :options="sampleOptions"
          placeholder="Select fruits..."
          label="Fruits"
          v-bind="args"
        >
          <template #option="{ option, selected }">
            <div style="display:flex; justify-content: space-between; gap: 0.5rem; width: 100%;">
              <span>{{ option.label }}</span>
              <span style="opacity: 0.7; font-size: 0.85rem;">{{ option.rarity }}</span>
            </div>
          </template>
        </MultiSelectPlus>
        <p style="margin-top: 1rem; font-size: 0.9rem;">Selected: {{ values }}</p>
      </div>
    `,
  }),
  args: {
    listMaxHeight: '30vh',
  },
};

export const MaxSelection: Story = {
  render: (args) => ({
    setup() {
      const values = ref<(string | number)[]>([]);
      return { args, values, sampleOptions };
    },
    components: { MultiSelectPlus },
    template: `
      <div style="width: 340px;">
        <MultiSelectPlus
          v-model="values"
          :options="sampleOptions"
          placeholder="Pick up to 3..."
          label="Fruits (max 3)"
          :max="3"
          v-bind="args"
        />
        <p style="margin-top: 1rem; font-size: 0.9rem;">Selected: {{ values }}</p>
      </div>
    `,
  }),
};

export const TagOverflow: Story = {
  render: (args) => ({
    setup() {
      const values = ref<(string | number)[]>(sampleOptions.map((o) => o.value));
      return { args, values, sampleOptions };
    },
    components: { MultiSelectPlus },
    template: `
      <div style="width: 340px;">
        <MultiSelectPlus
          v-model="values"
          :options="sampleOptions"
          placeholder="Select fruits..."
          label="All selected"
          :maxVisibleTags="3"
          v-bind="args"
        />
        <p style="margin-top: 1rem; font-size: 0.9rem;">Selected: {{ values.length }} items</p>
      </div>
    `,
  }),
};
