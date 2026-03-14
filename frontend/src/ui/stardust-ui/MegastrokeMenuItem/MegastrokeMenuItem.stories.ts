import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import MegastrokeMenuItem from './MegastrokeMenuItem.vue';
import './MegastrokeMenuItem.scss';

const meta: Meta<typeof MegastrokeMenuItem> = {
  title: 'Stardust UI/MegastrokeMenuItem',
  component: MegastrokeMenuItem,
  tags: ['autodocs'],
  argTypes: {
    active: { control: 'boolean' },
    disabled: { control: 'boolean' },
    icon: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof MegastrokeMenuItem>;

const sidebarStyle =
  'list-style: none; margin: 0; padding: 0; background: #050510; color: #eee; width: 300px; display: flex; flex-direction: column;';

export const Default: Story = {
  args: { active: false, icon: 'fa fa-store' },
  render: (args) => ({
    components: { MegastrokeMenuItem },
    setup() {
      return { args };
    },
    template: `
      <ul :style="'${sidebarStyle}'">
        <MegastrokeMenuItem v-bind="args" @click="() => {}">Storefront</MegastrokeMenuItem>
      </ul>
    `,
  }),
};

export const Disabled: Story = {
  args: { active: false, disabled: true, icon: 'fa fa-store' },
  render: (args) => ({
    components: { MegastrokeMenuItem },
    setup() {
      return { args };
    },
    template: `
      <ul :style="'${sidebarStyle}'">
        <MegastrokeMenuItem v-bind="args" @click="() => {}">Storefront</MegastrokeMenuItem>
      </ul>
    `,
  }),
};

export const Active: Story = {
  args: { active: true, icon: 'fa fa-store' },
  render: (args) => ({
    components: { MegastrokeMenuItem },
    setup() {
      return { args };
    },
    template: `
      <ul :style="'${sidebarStyle}'">
        <MegastrokeMenuItem v-bind="args" @click="() => {}">Storefront</MegastrokeMenuItem>
      </ul>
    `,
  }),
};

export const SidebarList: Story = {
  render: () => ({
    components: { MegastrokeMenuItem },
    setup() {
      const activeIndex = ref(0);
      const setActive = (i: number) => {
        activeIndex.value = i;
      };
      const items = [
        { icon: 'fa fa-store', label: 'Storefront' },
        { icon: 'fa fa-gift', label: 'Arrivals' },
        { icon: 'fa fa-star', label: 'Featured' },
      ];
      return { activeIndex, items, setActive };
    },
    template: `
      <ul :style="'${sidebarStyle}'">
        <MegastrokeMenuItem
          v-for="(item, i) in items"
          :key="item.label"
          :icon="item.icon"
          :active="activeIndex === i"
          @click="setActive(i)"
        >
          {{ item.label }}
        </MegastrokeMenuItem>
      </ul>
    `,
  }),
};
