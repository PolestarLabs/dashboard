import type { Meta, StoryObj } from '@storybook/vue3-vite';
import SuperShadow from './SuperShadow.vue';
import './SuperShadow.scss';

const meta: Meta<typeof SuperShadow> = {
  title: 'Stardust UI/SuperShadow',
  component: SuperShadow,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['title', 'text', 'slim'] },
    lineCol: { control: 'color' },
  },
};

export default meta;

type Story = StoryObj<typeof SuperShadow>;

export const Title: Story = {
  args: { variant: 'title' },
  render: (args) => ({
    components: { SuperShadow },
    setup() {
      return { args };
    },
    template: `<SuperShadow v-bind="args">SuperShadow Title</SuperShadow>`,
  }),
};

export const Text: Story = {
  args: { variant: 'text' },
  render: (args) => ({
    components: { SuperShadow },
    setup() {
      return { args };
    },
    template: `
      
        <SuperShadow v-bind="args">SuperShadow Text</SuperShadow>
     
    `,
  }),
};

export const Slim: Story = {
  args: { variant: 'slim' },
  render: (args) => ({
    components: { SuperShadow },
    setup() {
      return { args };
    },
    template: `<SuperShadow v-bind="args">SuperShadow Slim</SuperShadow>`,
  }),
};

export const CustomLineColor: Story = {
  args: {
    variant: 'title',
    lineCol: '#3a2a4a',
  },
  render: (args) => ({
    components: { SuperShadow },
    setup() {
      return { args };
    },
    template: `
      
        <SuperShadow v-bind="args">Custom Shadow Color</SuperShadow>
     
    `,
  }),
};
