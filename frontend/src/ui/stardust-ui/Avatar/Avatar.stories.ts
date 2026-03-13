import type { Meta, StoryObj } from '@storybook/vue3-vite';
import Avatar from './Avatar.vue';
import './Avatar.scss';

const meta: Meta<typeof Avatar> = {
  title: 'Stardust UI/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: { control: { type: 'range', min: 40, max: 200, step: 10 } },
  },
};

export default meta;

type Story = StoryObj<typeof Avatar>;

const sampleSrc =
  'https://cdn.discordapp.com/embed/avatars/4.png';

export const Default: Story = {
  args: { src: sampleSrc, size: 150 },
};

export const Small: Story = {
  args: { src: sampleSrc, size: 64 },
};

