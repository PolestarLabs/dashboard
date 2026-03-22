import type { Meta, StoryObj } from '@storybook/vue3';
import Tooltip from './Tooltip.vue';
import Button from '../Button/Button.vue';

const meta: Meta<typeof Tooltip> = {
  title: 'Stardust UI / Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Tooltip wraps any trigger element via the **default slot** and teleports a floating bubble to \`<body>\`.
- Shows on **hover** (with configurable \`delay\`) and **keyboard focus**
- Arrow direction matches \`placement\`
- Accessible via \`role="tooltip"\`
        `,
      },
    },
    layout: 'centered',
  },
  argTypes: {
    content: { control: 'text' },
    placement: { control: 'select', options: ['top', 'bottom', 'left', 'right'] },
    delay: { control: { type: 'number', min: 0, max: 1000, step: 50 } },
  },
};
export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: { content: 'Hello from Tooltip!', placement: 'top', delay: 120 },
  render: (args) => ({
    components: { Tooltip, Button },
    setup: () => ({ args }),
    template: `
      <Tooltip v-bind="args">
        <Button label="Hover me" />
      </Tooltip>`,
  }),
};

export const AllPlacements: Story = {
  render: () => ({
    components: { Tooltip, Button },
    template: `
      <div style="display:flex;gap:32px;align-items:center;justify-content:center;flex-wrap:wrap;padding:60px;">
        <Tooltip content="Top tooltip" placement="top"><Button label="Top" variant="ghost" /></Tooltip>
        <Tooltip content="Bottom tooltip" placement="bottom"><Button label="Bottom" variant="ghost" /></Tooltip>
        <Tooltip content="Left tooltip" placement="left"><Button label="Left" variant="ghost" /></Tooltip>
        <Tooltip content="Right tooltip" placement="right"><Button label="Right" variant="ghost" /></Tooltip>
      </div>`,
  }),
};

import Key from '../Key/Key.vue';
export const RichContent: Story = {
  render: () => ({
    components: { Tooltip, Button, Key },
    template: `
      <Tooltip placement="bottom">
        <Button label="Keyboard shortcut" />
        <template #tooltip>
          <div style="display:flex;flex-direction:column;gap:8px;min-width:180px;">
            <img src="https://picsum.photos/seed/stardust/180/80" alt="" style="width:100%;height:80px;object-fit:cover;border-radius:6px;" />
            <span style="font-size:0.78rem;opacity:0.7;text-transform:uppercase;letter-spacing:.05em;">Save as</span>
            <div style="display:flex;gap:2px;align-items:center;margin-bottom:14px;">
              <Key k="Ctrl" size="sm"/>
              <span style="font-size:0.8rem;">+</span>
              <Key k="Shift" size="sm"/>
              <span style="font-size:0.8rem;">+</span>
              <Key k="S" size="sm"/>
            </div>
          </div>
        </template>
      </Tooltip>`,
  }),
};

export const OnIconButton: Story = {
  render: () => ({
    components: { Tooltip, Button },
    template: `
      <Tooltip content="Delete this item" placement="top">
        <Button icon="fas fa-trash" variant="ghost" />
      </Tooltip>`,
  }),
};
