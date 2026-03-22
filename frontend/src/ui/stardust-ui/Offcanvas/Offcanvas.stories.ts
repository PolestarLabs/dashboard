import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import Offcanvas from './Offcanvas.vue';

const meta: Meta<typeof Offcanvas> = {
  title: 'Stardust UI/Offcanvas',
  component: Offcanvas,
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: { type: 'radio' },
      options: ['slide', 'reveal', 'push'],
    },
    overlay: { control: 'boolean' },
    flip: { control: 'boolean' },
    showClose: { control: 'boolean' },
    closeOnEsc: { control: 'boolean' },
    closeOnOverlay: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Slide-over / off-canvas panel. Ported from the legacy `plx-offcanvas` / `plx-offcanvas-reveal` / `plx-offcanvas-overlay` system. Supports **slide** and **reveal** modes, optional overlay, and left / right (flip) positioning.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Offcanvas>;

/* ─── helpers ────────────────────────────────────────────────── */
const sampleContent = `
  <nav style="display:flex;flex-direction:column;gap:12px;padding-top:40px;">
    <a href="#" style="color:inherit;text-decoration:none;font-size:1.1rem;">Dashboard</a>
    <a href="#" style="color:inherit;text-decoration:none;font-size:1.1rem;">Profile</a>
    <a href="#" style="color:inherit;text-decoration:none;font-size:1.1rem;">Inventory</a>
    <a href="#" style="color:inherit;text-decoration:none;font-size:1.1rem;">Settings</a>
    <a href="#" style="color:inherit;text-decoration:none;font-size:1.1rem;">Servers</a>
  </nav>
`;

function renderWithToggle(args: InstanceType<typeof Offcanvas>['$props']) {
  return {
    components: { Offcanvas },
    setup() {
      const open = ref(false);
      return { open, args };
    },
    template: `
      <div>
        <button @click="open = true" style="padding:8px 20px;cursor:pointer;">Open Offcanvas</button>
        <Offcanvas v-bind="args" v-model="open">
          ${sampleContent}
        </Offcanvas>
      </div>
    `,
  };
}

/* ─── stories ────────────────────────────────────────────────── */

/** Default slide-in from left with overlay. */
export const SlideLeft: Story = {
  render: (args) => renderWithToggle(args),
  args: {
    mode: 'slide',
    overlay: true,
    flip: false,
    showClose: true,
  },
};

/** Slide-in from the right (flip). */
export const SlideRight: Story = {
  render: (args) => renderWithToggle(args),
  args: {
    mode: 'slide',
    overlay: true,
    flip: true,
    showClose: true,
  },
};

/** Reveal mode — panel is "uncovered" rather than sliding over. */
export const RevealLeft: Story = {
  render: (args) => renderWithToggle(args),
  args: {
    mode: 'reveal',
    overlay: true,
    flip: false,
    showClose: true,
  },
};

/** Reveal from the right side. */
export const RevealRight: Story = {
  render: (args) => renderWithToggle(args),
  args: {
    mode: 'reveal',
    overlay: true,
    flip: true,
    showClose: true,
  },
};

/** Push mode: content shifts while panel reveals underneath. */
export const Push: Story = {
  render: (args) => renderWithToggle(args),
  args: {
    mode: 'push',
    overlay: true,
    flip: false,
    showClose: true,
  },
};

/** No overlay — panel only, click outside does nothing. */
export const NoOverlay: Story = {
  render: (args) => renderWithToggle(args),
  args: {
    mode: 'slide',
    overlay: false,
    flip: false,
    showClose: true,
  },
};
