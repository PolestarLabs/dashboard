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
  },
};

export default meta;

type Story = StoryObj<typeof Avatar>;

const sampleSrc = 'https://i.pinimg.com/736x/2c/44/c8/2c44c8604aa20501c797c7d8f14f9536.jpg';

export const Default: Story = {
  args: { src: sampleSrc, size: 150, shape: 'circle' },
};

export const Small: Story = {
  args: { src: sampleSrc, size: 64, shape: 'circle' },
};

export const Rounded: Story = {
  args: { src: sampleSrc, size: 150, shape: 'rounded' },
};

export const Hexagon: Story = {
  args: { src: sampleSrc, size: 150, shape: 'hexagon' },
};

