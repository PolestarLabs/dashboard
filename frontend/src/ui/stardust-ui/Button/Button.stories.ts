import type { Meta, StoryObj } from '@storybook/vue3-vite';
import Button from './Button.vue';

const meta: Meta<typeof Button> = {
  title: 'Stardust UI/Basic Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: { 
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'ghost'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
    icon: {
      control: { type: 'text' },
      description: 'Font Awesome icon class(es), e.g. fas fa-check',
    },
    iconposition: {
      control: { type: 'select' },
      options: ['left', 'right'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const PrimaryWithIcon: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    iconposition: 'left',
    icon: 'fab fa-dribbble',
    label: 'Continue',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'md',
    label: 'Za Warudo',
  },
};

export const GhostSmall: Story = {
  args: {
    variant: 'ghost',
    size: 'sm',
    iconposition: 'left',
    icon: 'fas fa-ghost',
    label: 'Ghost',
  },
};

export const WithIconOnRight: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    iconposition: 'right',
    icon: 'fas fa-arrow-right',
    label: 'Next',
  },
};
