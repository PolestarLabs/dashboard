import type { Meta, StoryObj } from '@storybook/vue3-vite';
import Typography from './Typography.vue';

const meta: Meta<typeof Typography> = {
  title: 'Stardust UI/Typography',
  component: Typography,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Typography component palette and system tokens. Includes headings, subtitles, body, caption and small text variants for consistent UX text hierarchy.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Typography>;

export const AllVariants: Story = {
  render: () => ({
    components: { Typography },
    template: `
      <div style="padding: 2rem; display: grid; gap: 1rem; max-width: 820px;">
        <Typography variant="h1">H1 Title — Lorem ipsum dolor sit amet</Typography>
        <Typography variant="h2">H2 Heading — Quick brown fox</Typography>
        <Typography variant="h3">H3 Section Title — A new experience</Typography>
        <Typography variant="h4">H4 Small Title — Status details</Typography>
        <Typography variant="subtitle">Subtitle / Label – Secondary hint text</Typography>
        <Typography variant="body">Body text — Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.</Typography>
        <Typography variant="small">Small text — Helper message and footnotes.</Typography>
        <Typography variant="caption">Caption — UI token text, micro helper and time stamps.</Typography>
      </div>
    `,
  }),
};

export const ColorTokens: Story = {
  render: () => ({
    components: { Typography },
    template: `
      <div style="padding: 2rem; display: grid; gap: 0.75rem; max-width: 540px;">
        <Typography variant="subtitle">Text Color Tokens</Typography>
        <p style="margin: 0; color: var(--text-main)">--text-main: var(--text-main)</p>
        <p style="margin: 0; color: var(--text-bold)">--text-bold: var(--text-bold)</p>
        <p style="margin: 0; color: var(--text-dim)">--text-dim: var(--text-dim)</p>
        <p style="margin: 0; color: var(--text-faint)">--text-faint: var(--text-faint)</p>
        <p style="margin: 0; color: var(--color-primary)">--color-primary</p>
        <p style="margin: 0; color: var(--color-secondary)">--color-secondary</p>
      </div>
    `,
  }),
};

export const FontTokens: Story = {
  render: () => ({
    components: { Typography },
    template: `
      <div style="padding: 2rem; display: grid; gap: 1rem; max-width: 720px;">
        <Typography variant="h3">Font Token Preview</Typography>
        <div style="display: grid; gap: 0.65rem;">
          <p style="margin: 0; font-family: var(--display-font); font-size: 1.2rem; color: var(--text-main);">--display-font: Display font (titles)</p>
          <p style="margin: 0; font-family: var(--strong-font); font-size: 1.1rem; color: var(--text-main);">--strong-font: Strong font (buttons/labels)</p>
          <p style="margin: 0; font-family: var(--main-font); font-size: 1rem; color: var(--text-main);">--main-font: Main body font</p>
          <p style="margin: 0; font-family: var(--second-font); font-size: 0.95rem; color: var(--text-main);">--second-font: Secondary voice</p>
          <p style="margin: 0; font-family: var(--mono-font); font-size: 0.92rem; color: var(--text-main);">--mono-font: Monospace (code)</p>
        </div>
      </div>
    `,
  }),
};
