import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import GlueContainer from './GlueContainer.vue';
import Input from '../Form Elements/Input/Input.vue';
import Button from '../Button/Button.vue';
import Badge from '../Badge/Badge.vue';
import Select from '../Select/Select.vue';
import DropdownSelect from '../Select/DropdownSelect.vue';

const meta: Meta<typeof GlueContainer> = {
  title: 'Stardust UI/GlueContainer',
  component: GlueContainer,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof GlueContainer>;

/** Input + Button: input and button touch with no gap, single shadow, no radius at junction */
export const InputAndButton: Story = {
  render: (args) => ({
    setup() {
      const value = ref('');
      return { args, value };
    },
    components: { GlueContainer, Input, Button },
    template: `
      <GlueContainer v-bind="args">
        <Input v-model="value" placeholder="Search..." />
        <Button label="Go" icon="fas fa-search" />
      </GlueContainer>
    `,
  }),
  args: {},
};

/** Button + Input: button on the left, merges into input; label can go in #label slot below. Use Input size="sm" to match Button sm. */
export const ButtonAndInput: Story = {
  render: (args) => ({
    setup() {
      const value = ref('');
      return { args, value };
    },
    components: { GlueContainer, Input, Button },
    template: `
      <GlueContainer v-bind="args">
        <template #label>Setting A</template>
        <Button label="Set" icon="fas fa-cog" size="sm" />
        <Input v-model="value" placeholder="+123" size="sm" />
      </GlueContainer>
    `,
  }),
  args: {},
};

/** Button + Badge: layout auto-detected from Badge in slot; badge positioned at top-right of button */
export const ButtonWithBadge: Story = {
  render: (args) => ({
    components: { GlueContainer, Button, Badge },
    template: `
      <GlueContainer v-bind="args">
        <Button label="Notifications" icon="fas fa-bell" />
        <Badge :value="3" />
      </GlueContainer>
    `,
  }),
  args: {},
};

/**
 * **Badge behaviour** (auto-detected when a Badge is in the slot):
 *
 * - **Single badge:** The badge is sent to the very end of the line (e.g. one button + one badge → button on the left, badge aligned right).
 * - **Several badges:** Behaves like a **segment** row (one continuous pill), but each badge is **inside** the button it is coupled to, overlaying it (e.g. top-right corner).
 *
 * No need to pass `layout="badge"` — the container detects Badge children and applies the right layout.
 */
export const BadgeBehaviour: Story = {
  render: (args) => ({
    components: { GlueContainer, Button, Badge },
    template: `
      <div>
        <p style="margin-bottom: 0.5rem; font-weight: 600;">Single badge → pushed to the end of the line</p>
        <GlueContainer>
          <Button label="Notifications" icon="fas fa-bell" />
          <Badge :value="3" />
        </GlueContainer>

        <p style="margin: 1.5rem 0 0.5rem; font-weight: 600;">Several badges → segment-like pill; each badge overlays its button (top-right)</p>
        <GlueContainer>
          <Button label="Inbox" icon="fas fa-inbox" variant="primary" />
          <Badge :value="12" />
          <Button label="Sent" icon="fas fa-paper-plane" variant="secondary" />
          <Badge :value="1" />
          <Button label="Drafts" icon="fas fa-file" variant="ghost" />
          <Badge :value="0" />
        </GlueContainer>
      </div>
    `,
  }),
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          '**Single badge:** The badge is placed at the very end of the line (e.g. one button on the left, badge on the right). ' +
          '**Several badges:** Same as a segment row (one continuous pill), but each badge sits inside the button it is coupled to and overlays it (e.g. top-right corner).',
      },
    },
  },
};

/** Several Buttons: layout auto-detected from 3+ children; one wide pill, each segment a separate button */
export const Segments: Story = {
  render: (args) => ({
    components: { GlueContainer, Button },
    template: `
      <GlueContainer v-bind="args">
        <Button label="One" variant="primary" />
        <Button label="Two" variant="secondary" />
        <Button label="Three" variant="fancy" />
        <Button label="Four" variant="ghost" />
      </GlueContainer>
    `,
  }),
  args: {},
};

export const SegmentWithIcons: Story = {
  render: (args) => ({
    components: { GlueContainer, Button },
    template: `
      <GlueContainer v-bind="args">
        <Button icon="fab fa-linux" label="One" variant="primary" />
        <Button icon="fab fa-apple" label="Two" variant="secondary" />
        <Button icon="fab fa-windows" label="Three" variant="ghost" />
      </GlueContainer>
      <br /><br />
      <GlueContainer v-bind="args">
        <Button icon="fab fa-linux" label="One" variant="ghost" />
        <Button icon="fab fa-apple" label="Two" variant="ghost" />
        <Button icon="fab fa-windows" label="Three" variant="ghost" />
      </GlueContainer>
      <br /><br />
      <GlueContainer v-bind="args">
        <Button icon="fab fa-linux" label="One" variant="secondary" />
        <Button icon="fab fa-apple" label="Two" variant="secondary" />
        <Button icon="fab fa-windows" label="Three" variant="secondary" />
      </GlueContainer>
      <br /><br />
      <GlueContainer v-bind="args">
        <Button icon="fab fa-linux" label="One" variant="fancy" />
        <Button icon="fab fa-apple" label="Two" variant="fancy" theme="secondary" />
        <Button icon="fab fa-windows" label="Three" variant="fancy" theme="danger" />
      </GlueContainer>
    `,
  }),
  args: {},
};

export const SelectsInGroup: Story = {
  render: (args) => ({
    setup() {
      const value1 = ref('en');
      const value2 = ref('fr');
      return { args, value1, value2 };
    },
    components: { GlueContainer, Select, DropdownSelect },
    template: `
      <GlueContainer class="s-glue-container--inline" style="width: 400px;" v-bind="args" >
        <Select v-model="value1" :options="[{ value: 'en', label: 'English' }, { value: 'de', label: 'Deutsch' }, { value: 'fr', label: 'Français' }]" />
        <DropdownSelect v-model="value2" :options="[{ value: 'us', label: 'USA' }, { value: 'fr', label: 'France' }, { value: 'de', label: 'Germany' }]" />
      </GlueContainer>
      <div style="margin-top: 1rem; font-size: 0.85rem; color: #666;">
        Selected: {{ value1 }} / {{ value2 }}
      </div>
    `,
  }),
  args: {},
};
