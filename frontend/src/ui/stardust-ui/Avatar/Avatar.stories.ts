import type { Meta, StoryObj } from '@storybook/vue3-vite';
import Avatar from './Avatar.vue';
import './Avatar.scss';

const meta: Meta<typeof Avatar> = {
  title: 'Stardust UI/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: { control: { type: 'range', min: 40, max: 200, step: 10 } },
    shape: { control: 'select', options: ['circle', 'rounded', 'hexagon'] },
    status: { control: 'select', options: ['online', 'idle', 'dnd', 'offline'] },
    border: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof Avatar>;

const sampleSrc = 'https://i.pinimg.com/736x/2c/44/c8/2c44c8604aa20501c797c7d8f14f9536.jpg';

export const Default: Story = {
  args: { src: sampleSrc, size: 150, shape: 'circle' },
};

export const PlaceholderCircle: Story = {
  args: { src: '', size: 150, shape: 'circle' },
};

export const Rounded: Story = {
  args: { src: sampleSrc, size: 100, shape: 'rounded' },
};

export const Hexagon: Story = {
  args: { src: sampleSrc, size: 100, shape: 'hexagon' },
};

export const Statuses: Story = {
  render: () => ({
    components: { Avatar },
    setup() {
      return { src: sampleSrc, statuses: ['online', 'idle', 'dnd', 'offline'] as const };
    },
    template: `
      <div style="display:flex;gap:32px;align-items:center;padding:24px;">
        <Avatar v-for="s in statuses" :key="s" :src="src" :size="100" shape="circle" :status="s" />
      </div>
    `,
  }),
};

export const StatusBorder: Story = {
  render: () => ({
    components: { Avatar },
    setup() {
      return { src: sampleSrc, statuses: ['online', 'idle', 'dnd', 'offline'] as const };
    },
    template: `
      <div style="display:flex;gap:40px;align-items:center;padding:32px;">
        <Avatar v-for="s in statuses" :key="s" :src="src" :size="100" shape="circle" :status="s" :border="true" />
      </div>
    `,
  }),
};


export const CustomStatus: Story = {
  render: () => ({
    components: { Avatar },
    setup() {
      const examples = [
        { shape: 'hexagon', color: '#a855f7', iconClass: 'fas fa-gamepad' },
        { shape: 'circle', color: '#3b82f6', iconClass: 'fas fa-music' },
        { shape: 'rounded', color: '#f97316', iconClass: 'fas fa-fire' },
      ];
      return { src: sampleSrc, examples };
    },
    template: `
      <div style="display:flex;gap:32px;align-items:center;padding:24px;">
        <Avatar v-for="(cs, i) in examples" :key="i" :src="src" :size="100" :shape="cs.shape" :customStatus="cs" :border="true" />
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { Avatar },
    setup() {
      return { src: sampleSrc, sizes: [40, 64, 100, 150] as const };
    },
    template: `
      <div style="display:flex;gap:32px;align-items:center;padding:24px;">
        <Avatar v-for="s in sizes" :key="s" :src="src" :size="s" shape="circle" />
      </div>
    `,
  }),
};