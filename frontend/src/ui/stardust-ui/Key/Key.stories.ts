import type { Meta, StoryObj } from '@storybook/vue3';
import Key from './Key.vue';

const meta: Meta<typeof Key> = {
    title: 'Stardust UI / Key',
    component: Key,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
The Key component visually represents a keyboard key or a device button.
- Renders with a stylized box, rounded corners, and subtle shadow
- Can be used inline within text or as standalone elements
                `,
            },
        },
        layout: 'centered',
    },
    argTypes: {
        k: { control: 'text' },
        styled: { control: 'boolean', description: 'Apply styled variant based on current theme' },
        size: { control: 'radio', options: ['xs', 'sm', 'md', 'lg'] },
        round: { control: 'boolean', description: 'Apply fully rounded style (circle shape)' },
        color: { control: 'radio', options: ['primary', 'secondary', 'danger', 'success', 'warn', 'info','other'], description: 'Apply color variant based on theme. For "other", use ***`--key-color-foreground`*** and ***`--key-color-background`*** CSS variables.\n' },
    },
};

export default meta;
type Story = StoryObj<typeof Key>;

export const Default: Story = {
  args: { k: 'Ctrl', size: 'md' },
  render: (args) => ({
    components: { Key },
    setup: () => ({ args }),
    template: `
      <span> Surrounding <Key v-bind="args" /> text. </span>`,
  }),
};

export const RoundedWithColors: Story = {
  render: (args) => ({
    components: { Key },
    setup: () => ({ args }),
    template: `
     <Key k="A" round color="success" />
     <Key k="B" round color="danger" />
     <Key k="X" round color="warn" />
     <Key k="Y" round color="info" />
     <span > • </span>
     <Key k="1" round color="primary" />
     <Key k="2" round color="secondary" />
     <Key k="3" round color="custom" />
     `,
  }),
};


export const Sizes: Story = {
  render: () => ({
    components: { Key},
    template: `
    <div style="display:flex;gap:32px;align-items:center;justify-content:space-around;flex-wrap:wrap;padding:10px;">
    <div v-for="key in ['cmd', 'shift', 'space', 'C']" :k="key">
      
        <Key size="xs" :k="key" />
        <Key size="sm" :k="key" />
        <Key size="md" :k="key" />
        <Key size="lg" :k="key" />

    </div>
    </div>
      `,
  }),
};

export const Styled: Story = {
  render: () => ({
    components: { Key, Plus },
    template: `
      <div style="display:flex;gap:32px;align-items:center;justify-content:center;flex-wrap:wrap;padding:60px;">
        <Key styled k="cmd" />
        <Key styled k="shift" />
        <Key styled k="ctrl" />
        <Key styled k="ctrl:mac" />
        <Key styled k="option" />
        <Key styled k="winkey" />
        <Key styled k="enter" />
        <Key styled k="backspace" />
        <Key styled k="tab" />
        <Key styled k="space" />
        <Key styled k="command" /> <Plus /> <Key styled k="c" />
      </div>`,
  }),
};

import Plus from './Plus.vue';
export const AllPlacements: Story = {
  render: () => ({
    components: { Key, Plus },
    template: `
      <div style="display:flex;gap:32px;align-items:center;justify-content:center;flex-wrap:wrap;padding:60px;">
        <Key k="cmd" />
        <Key k="shift" />
        <Key k="ctrl" />
        <Key k="ctrl:mac" />
        <Key k="option" />
        <Key k="winkey" />
        <Key k="enter" />
        <Key k="backspace" />
        <Key k="tab" />
        <Key k="space" />
        <Key k="command" /> <Plus /> <Key k="c" />
      </div>`,
  }),
};

