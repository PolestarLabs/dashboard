import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import Radio from './Radio.vue';

const meta: Meta<typeof Radio> = {
  title: 'Stardust UI/Form Elements/Radio',
  component: Radio,
  tags: ['autodocs'],
  argTypes: {
    label: { control: { type: 'text' } },
    disabled: { control: { type: 'boolean' } },
    value: { control: { type: 'text' } },
  },
};

export default meta;

type Story = StoryObj<typeof Radio>;

const groupRender = (initial = 'a') => (args: object) => ({
  setup() {
    const selected = ref<string | number>(initial);
    return { args, selected };
  },
  components: { Radio },
  template: `
    <div style="display:flex; flex-direction:column; gap:1rem; font-family: Panton, system-ui, sans-serif;">
      <div>
        <Radio v-model="selected" value="a" label="Option A" v-bind="args" />
      </div>
      <div>
        <Radio v-model="selected" value="b" label="Option B" v-bind="args" />
      </div>
      <div>
        <Radio v-model="selected" value="c" label="Option C" v-bind="args" />
      </div>
      <div>Selected: {{ selected }}</div>
    </div>
  `,
});

export const Default: Story = {
  render: groupRender('a'),
  args: {},
};

export const Disabled: Story = {
  render: groupRender('a'),
  args: {
    disabled: true,
  },
};

export const CustomValues: Story = {
  render: groupRender('x'),
  args: {},
};
