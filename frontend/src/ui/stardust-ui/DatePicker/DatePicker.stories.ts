import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import DatePicker from './DatePicker.vue';

const meta: Meta<typeof DatePicker> = {
  title: 'Stardust UI/Form Elements/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A fully accessible, dependency-free date picker following the stardust-ui design system.

- **v-model** binds to an ISO \`YYYY-MM-DD\` string
- **Year picker** — click the month/year title in the header to jump directly to a year
- **Range mode** — \`mode="range"\` with \`v-model\` (start) + \`v-model:endValue\` (end); hover previews the range
- Calendar stays open after picking a date — close with **Escape** or clicking outside
- Supports \`solid\` and \`ghost\` variants, \`sm\` / \`md\` sizes, \`min\` / \`max\` bounds
- Full keyboard navigation: **Arrow** keys, **Home/End**, **PageUp/PageDown**, **Enter/Space**, **Escape**
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'radio' },
      options: ['solid', 'ghost'],
    },
    size: {
      control: { type: 'radio' },
      options: ['sm', 'md'],
    },
    mode: {
      control: { type: 'radio' },
      options: ['single', 'range'],
    },
    placeholder: { control: { type: 'text' } },
    label:       { control: { type: 'text' } },
    disabled:    { control: { type: 'boolean' } },
    error:       { control: { type: 'text' } },
    min:         { control: { type: 'text' }, description: 'ISO YYYY-MM-DD lower bound' },
    max:         { control: { type: 'text' }, description: 'ISO YYYY-MM-DD upper bound' },
  },
};

export default meta;

type Story = StoryObj<typeof DatePicker>;

/** Wrapper that manages the v-model ref so Storybook controls work */
const render = (initial = '') => (args: object) => ({
  setup() {
    const value = ref(initial);
    return { args, value };
  },
  components: { DatePicker },
  template: `
    <div style="height: 400px; display: flex; flex-direction: column; align-items: flex-start; gap: 1rem;">
      <DatePicker v-model="value" v-bind="args" />
      <p style="font-size: 0.8rem; opacity: 0.55; font-family: monospace;">
        v-model: {{ value || '—' }}
      </p>
    </div>
  `,
});

// ── Stories ─────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: render(),
  args: {
    label:       'Birthday',
    placeholder: 'Pick a date…',
    variant:     'solid',
    size:        'md',
  },
};

export const WithPreselectedDate: Story = {
  render: render('2026-03-21'),
  args: {
    label:   'Created at',
    variant: 'solid',
  },
};

export const Ghost: Story = {
  render: render(),
  args: {
    label:       'Scheduled date',
    placeholder: 'Pick a date…',
    variant:     'ghost',
  },
};

/** Small size (32 px) — pairs with Button sm and Input sm in GlueContainer */
export const Small: Story = {
  render: render(),
  args: {
    placeholder: 'Date…',
    size:        'sm',
    variant:     'solid',
  },
};

export const ErrorState: Story = {
  render: render(''),
  args: {
    label:   'Due date',
    error:   'A due date is required',
    variant: 'ghost',
  },
};

export const Disabled: Story = {
  render: render('2026-01-01'),
  args: {
    label:    'Locked date',
    disabled: true,
    variant:  'solid',
  },
};

/** min/max constrain which days are selectable */
export const WithMinMax: Story = {
  render: render(),
  args: {
    label:       'Booking window (March 2026 only)',
    placeholder: 'Pick a date…',
    min:         '2026-03-01',
    max:         '2026-03-31',
    variant:     'solid',
  },
};

// ── Year picker story ──────────────────────────────────────────────────────

/** Click the month/year title in the header to open the year grid and jump to any year */
export const YearPicker: Story = {
  render: () => ({
    components: { DatePicker },
    setup() {
      const value = ref('');
      return { value };
    },
    template: `
      <div style="height: 400px; display: flex; flex-direction: column; align-items: flex-start; gap: 1rem;">
        <DatePicker v-model="value" label="Click the header title to pick a year" variant="solid" placeholder="Pick a date…" />
        <p style="font-size: 0.8rem; opacity: 0.55; font-family: monospace;">Selected: {{ value || '—' }}</p>
      </div>
    `,
  }),
};

// ── Range mode stories ─────────────────────────────────────────────────────

/**
 * Range mode: first click sets the start date, second click sets the end.
 * Hover over days to preview the range before committing.
 */
export const RangeMode: Story = {
  render: () => ({
    components: { DatePicker },
    setup() {
      const start = ref('');
      const end   = ref('');
      return { start, end };
    },
    template: `
      <div style="height: 420px; display: flex; flex-direction: column; align-items: flex-start; gap: 1rem;">
        <DatePicker
          v-model="start"
          v-model:endValue="end"
          mode="range"
          label="Select a date range"
          placeholder="From – To…"
          variant="solid"
        />
        <p style="font-size: 0.8rem; opacity: 0.55; font-family: monospace;">
          start: {{ start || '—' }} &nbsp;|&nbsp; end: {{ end || '—' }}
        </p>
      </div>
    `,
  }),
};

export const RangeModePreset: Story = {
  render: () => ({
    components: { DatePicker },
    setup() {
      const start = ref('2026-03-10');
      const end   = ref('2026-03-21');
      return { start, end };
    },
    template: `
      <div style="height: 420px; display: flex; flex-direction: column; align-items: flex-start; gap: 1rem;">
        <DatePicker
          v-model="start"
          v-model:endValue="end"
          mode="range"
          label="Trip dates"
          variant="solid"
        />
        <p style="font-size: 0.8rem; opacity: 0.55; font-family: monospace;">
          {{ start }} – {{ end }}
        </p>
      </div>
    `,
  }),
};

export const RangeModeGhost: Story = {
  render: () => ({
    components: { DatePicker },
    setup() {
      const start = ref('');
      const end   = ref('');
      return { start, end };
    },
    template: `
      <div style="height: 420px; display: flex; flex-direction: column; align-items: flex-start; gap: 1rem;">
        <DatePicker
          v-model="start"
          v-model:endValue="end"
          mode="range"
          label="Filter period"
          placeholder="From – To…"
          variant="ghost"
        />
        <p style="font-size: 0.8rem; opacity: 0.55; font-family: monospace;">
          start: {{ start || '—' }} &nbsp;|&nbsp; end: {{ end || '—' }}
        </p>
      </div>
    `,
  }),
};

// ── All states overview ────────────────────────────────────────────────────

export const AllStates: Story = {
  render: () => ({
    components: { DatePicker },
    setup() {
      const v1 = ref('');
      const v2 = ref('2026-03-21');
      const v3 = ref('');
      const v4 = ref('2026-03-15');
      return { v1, v2, v3, v4 };
    },
    template: `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem 3rem; padding: 1rem 0; min-height: 420px;">
        <DatePicker v-model="v1" label="Solid — empty"       variant="solid" placeholder="Pick a date…" />
        <DatePicker v-model="v2" label="Solid — pre-filled"  variant="solid" />
        <DatePicker v-model="v3" label="Ghost — with error"  variant="ghost" error="Date is required" placeholder="Pick a date…" />
        <DatePicker v-model="v4" label="Disabled"            variant="solid" disabled />
      </div>
    `,
  }),
};

/** "From → To" toolbar row using two small ghost pickers */
export const SmallInline: Story = {
  render: () => ({
    components: { DatePicker },
    setup() {
      const from = ref('');
      const to   = ref('');
      return { from, to };
    },
    template: `
      <div style="display: flex; align-items: center; gap: 0.5rem; min-height: 220px;">
        <DatePicker v-model="from" placeholder="From…" size="sm" variant="ghost" />
        <span style="opacity: 0.4; font-size: 0.9rem;">→</span>
        <DatePicker v-model="to"   placeholder="To…"   size="sm" variant="ghost" />
      </div>
    `,
  }),
};
