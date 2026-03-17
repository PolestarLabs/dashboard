import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import Accordion, { AccordionItem } from './Accordion.vue';

const meta: Meta<typeof Accordion> = {
  title: 'Stardust UI / Accordion',
  component: Accordion,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'ghost', 'solid'],
      description: 'Style variant of the accordion.',
      defaultValue: 'default',
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
A simple accordion component.
- Supports a single open section (default) or multiple open sections via the \`multiple\` prop.
- Uses named slots matching each item\'s \`key\` to render panel content.
- Supports a \`collapsible\` mode where clicking an open section closes it.
- Adds a \`title-icon\` slot to render an icon next to each title.
      `,
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Accordion>;

const DEMO_ITEMS: AccordionItem[] = [
  { key: 'profile', title: 'Profile' },
  { key: 'settings', title: 'Settings' },
  { key: 'help', title: 'Help & Support' },
];

export const Default: Story = {
  render: () => ({
    components: { Accordion },
    setup() {
      const open = ref('profile');
      return { open, items: DEMO_ITEMS };
    },
    template: `
      <Accordion v-model="open" :items="items">
        <template #profile>
          <p style="color:var(--text-main,#eee)">Your profile information goes here.</p>
        </template>
        <template #settings>
          <p style="color:var(--text-main,#eee)">Settings content goes here.</p>
        </template>
        <template #help>
          <p style="color:var(--text-main,#eee)">Help info and troubleshooting tips can be displayed here.</p>
        </template>
      </Accordion>
    `,
  }),
};

export const MultipleOpen: Story = {
  render: () => ({
    components: { Accordion },
    setup() {
      const open = ref<Array<string | number>>(['profile', 'help']);
      return { open, items: DEMO_ITEMS };
    },
    template: `
      <Accordion v-model="open" :items="items" multiple>
        <template #profile>
          <p style="color:var(--text-main,#eee)">Your profile information goes here.</p>
        </template>
        <template #settings>
          <p style="color:var(--text-main,#eee)">Settings content goes here.</p>
        </template>
        <template #help>
          <p style="color:var(--text-main,#eee)">Help info and troubleshooting tips can be displayed here.</p>
        </template>
      </Accordion>
    `,
  }),
};

export const GhostVariant: Story = {
  render: () => ({
    components: { Accordion },
    setup() {
      const open = ref('profile');
      return { open, items: DEMO_ITEMS };
    },
    template: `
      <Accordion v-model="open" :items="items" variant="ghost">
        <template #profile>
          <p style="color:var(--text-main,#eee)">Your profile information goes here.</p>
        </template>
        <template #settings>
          <p style="color:var(--text-main,#eee)">Settings content goes here.</p>
        </template>
        <template #help>
          <p style="color:var(--text-main,#eee)">Help info and troubleshooting tips can be displayed here.</p>
        </template>
      </Accordion>
    `,
  }),
};

export const SolidVariant: Story = {
  render: () => ({
    components: { Accordion },
    setup() {
      const open = ref('profile');
      return { open, items: DEMO_ITEMS };
    },
    template: `
      <Accordion v-model="open" :items="items" variant="solid">
        <template #profile>
          <p style="color:var(--text-main,#eee)">Your profile information goes here.</p>
        </template>
        <template #settings>
          <p style="color:var(--text-main,#eee)">Settings content goes here.</p>
        </template>
        <template #help>
          <p style="color:var(--text-main,#eee)">Help info and troubleshooting tips can be displayed here.</p>
        </template>
      </Accordion>
    `,
  }),
};

export const WithIconSlot: Story = {
  render: () => ({
    components: { Accordion },
    setup() {
      const open = ref('profile');
      return { open, items: DEMO_ITEMS };
    },
    template: `
      <Accordion v-model="open" :items="items">
        <template #title-icon="{ item }">
          <i class="fa fa-star" aria-hidden="true" />
        </template>

        <template #profile>
          <p style="color:var(--text-main,#eee)">Your profile information goes here.</p>
        </template>
        <template #settings>
          <p style="color:var(--text-main,#eee)">Settings content goes here.</p>
        </template>
        <template #help>
          <p style="color:var(--text-main,#eee)">Help info and troubleshooting tips can be displayed here.</p>
        </template>
      </Accordion>
    `,
  }),
};
