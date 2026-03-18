import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import MultiSelect from './MultiSelect.vue';
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

const meta: Meta<typeof MultiSelect> = {
  title: 'Stardust UI/Select/Multi Select',
  component: MultiSelect,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    options: { control: false },
    filter: { control: false },
    variant: { control: { type: 'select' }, options: ['solid', 'ghost'] },
    size: { control: { type: 'select' }, options: ['sm', 'md'] },
    columns: { control: { type: 'number', min: 1, max: 3, step: 1 } },
    maxVisibleTags: { control: { type: 'number', min: 1, max: 20, step: 1 } },
    max: { control: { type: 'number', min: 0, max: 20, step: 1 } },
  },
};

export default meta;

type Story = StoryObj<typeof MultiSelect>;

export const Ghost: Story = {
  render: (args) => ({
    setup() {
      const values = ref<(string | number)[]>(['apple', 'cherry']);
      return { args, values, sampleOptions };
    },
    components: { MultiSelect },
    template: `
      <div style="width: 340px; height: 400px;">
        <MultiSelect
          v-model="values"
          :options="sampleOptions"
          placeholder="Select fruits..."
          label="Fruits (ghost)"
          v-bind="args"
        />
        <p style="margin-top: 1rem; font-size: 0.85rem; opacity: 0.7;">Selected: {{ values }}</p>
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
      const values = ref<(string | number)[]>(['fig']);
      return { args, values, sampleOptions };
    },
    components: { MultiSelect },
    template: `
      <div style="width: 340px; height: 400px;">
        <MultiSelect
          v-model="values"
          :options="sampleOptions"
          placeholder="Select fruits..."
          label="Fruits (solid)"
          v-bind="args"
        />
        <p style="margin-top: 1rem; font-size: 0.85rem; opacity: 0.7;">Selected: {{ values }}</p>
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
      const values = ref<(string | number)[]>(['fig']);
      return { args, values, sampleOptions };
    },
    components: { MultiSelect },
    template: `
      <div style="width: 340px; height: 400px;">
        <MultiSelect
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
        </MultiSelect>
        <p style="margin-top: 1rem; font-size: 0.85rem; opacity: 0.7;">Selected: {{ values }}</p>
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
    components: { MultiSelect },
    template: `
      <div style="width: 340px; height: 400px;">
        <MultiSelect
          v-model="values"
          :options="sampleOptions"
          placeholder="Pick up to 3..."
          label="Fruits (max 3)"
          :max="3"
          v-bind="args"
        />
        <p style="margin-top: 1rem; font-size: 0.85rem; opacity: 0.7;">Selected: {{ values }}</p>
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
    components: { MultiSelect },
    template: `
      <div style="width: 340px; height: 400px;">
        <MultiSelect
          v-model="values"
          :options="sampleOptions"
          placeholder="Select fruits..."
          label="All selected"
          :maxVisibleTags="3"
          v-bind="args"
        />
        <p style="margin-top: 1rem; font-size: 0.85rem; opacity: 0.7;">Selected: {{ values.length }} items</p>
      </div>
    `,
  }),
};
