import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import Tabs from './Tabs.vue';

const meta: Meta<typeof Tabs> = {
  title: 'Stardust UI / Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Keyboard-accessible tab component.
- **Arrow Left / Right** — cycle between enabled tabs
- **Home / End** — jump to first / last tab
- Each panel is a named slot matching \`tab.key\`
      `,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Tabs>;

const DEMO_TABS = [
  { key: 'overview', label: 'Overview',  icon: 'fas fa-house' },
  { key: 'stats',    label: 'Stats',     icon: 'fas fa-chart-bar' },
  { key: 'settings', label: 'Settings',  icon: 'fas fa-gear' },
];

export const Default: Story = {
  render: () => ({
    components: { Tabs },
    setup() {
      const active = ref('overview');
      return { active, tabs: DEMO_TABS };
    },
    template: `
      <Tabs v-model="active" :tabs="tabs">
        <template #overview><p style="color:var(--text-main,#eee)">Overview panel content.</p></template>
        <template #stats><p style="color:var(--text-main,#eee)">Stats panel content.</p></template>
        <template #settings><p style="color:var(--text-main,#eee)">Settings panel content.</p></template>
      </Tabs>`,
  }),
};

export const WithDisabledTab: Story = {
  render: () => ({
    components: { Tabs },
    setup() {
      const active = ref('overview');
      const tabs = [
        { key: 'overview', label: 'Overview', icon: 'fas fa-house' },
        { key: 'beta',     label: 'Beta',     icon: 'fas fa-flask',  disabled: true },
        { key: 'settings', label: 'Settings', icon: 'fas fa-gear' },
      ];
      return { active, tabs };
    },
    template: `
      <Tabs v-model="active" :tabs="tabs">
        <template #overview><p style="color:var(--text-main,#eee)">Overview content.</p></template>
        <template #settings><p style="color:var(--text-main,#eee)">Settings content.</p></template>
      </Tabs>`,
  }),
};

export const WithIcons: Story = {
  render: () => ({
    components: { Tabs },
    setup() {
      const active = ref('profile');
      const tabs = [
        { key: 'profile',   label: 'Profile',   icon: 'fas fa-user' },
        { key: 'inventory', label: 'Inventory',  icon: 'fas fa-box-open' },
        { key: 'stats',     label: 'Stats',      icon: 'fas fa-chart-bar' },
        { key: 'settings',  label: 'Settings',   icon: 'fas fa-cog' },
      ];
      return { active, tabs };
    },
    template: `
      <Tabs v-model="active" :tabs="tabs">
        <template #profile><p style="color:var(--text-main,#eee)">Profile panel content.</p></template>
        <template #inventory><p style="color:var(--text-main,#eee)">Inventory panel content.</p></template>
        <template #stats><p style="color:var(--text-main,#eee)">Stats panel content.</p></template>
        <template #settings><p style="color:var(--text-main,#eee)">Settings panel content.</p></template>
      </Tabs>`,
  }),
};

export const ManyTabs: Story = {
  render: () => ({
    components: { Tabs },
    setup() {
      const active = ref('a');
      const tabs = ['a','b','c','d','e','f'].map((k) => ({ key: k, label: `Tab ${k.toUpperCase()}` }));
      return { active, tabs };
    },
    template: `
      <Tabs v-model="active" :tabs="tabs" style="max-width:600px;">
        <template v-for="t in tabs" #[t.key]>
          <p style="color:var(--text-main,#eee)">Panel for {{ t.label }}</p>
        </template>
      </Tabs>`,
  }),
};
