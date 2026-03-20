import type { Meta, StoryObj } from '@storybook/vue3-vite';
import ThemeShowcase from './ThemeShowcase.vue';
import TagPill from '../stardust-ui/TagPill/TagPill.vue';
import Badge from '../stardust-ui/Badge/Badge.vue';
import ArtistTag from '../components/ArtistTag/ArtistTag.vue';
import '../stardust-ui/TagPill/TagPill.scss';
import '../stardust-ui/Badge/Badge.scss';
import '../components/ArtistTag/ArtistTag.scss';

const meta: Meta<typeof ThemeShowcase> = {
  title: 'Themes/Color Schemes',
  component: ThemeShowcase,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Use the **Themes** toolbar control above to switch between color schemes. Each theme defines its own palette of accent, secondary, background, and semantic colors.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ThemeShowcase>;

export const ColorPalette: Story = {
  render: () => ({
    components: { ThemeShowcase },
    template: `<ThemeShowcase />`,
  }),
};

export const ComponentPreview: Story = {
  render: () => ({
    components: { TagPill, Badge, ArtistTag },
    template: `
      <div style="padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem;">
        <div>
          <h3 style="margin: 0 0 0.5rem; color: var(--on-main); font-size: 0.9rem;">Tags</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            <TagPill color="default">Default</TagPill>
            <TagPill color="accent">Accent</TagPill>
            <TagPill color="success">Success</TagPill>
            <TagPill color="warning">Warning</TagPill>
            <TagPill color="error">Error</TagPill>
          </div>
        </div>
        <div>
          <h3 style="margin: 0 0 0.5rem; color: var(--on-main); font-size: 0.9rem;">Badge</h3>
          <Badge>3</Badge>
        </div>
        <div>
          <h3 style="margin: 0 0 0.5rem; color: var(--on-main); font-size: 0.9rem;">Artist tag</h3>
          <ArtistTag>Artist Name</ArtistTag>
        </div>
      </div>
    `,
  }),
};
