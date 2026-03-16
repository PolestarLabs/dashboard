import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { defineComponent } from 'vue';
import { useAlert } from './useAlert';

// The Alert system is a composable (programmatic API), not a rendered component.
// Stories render a trigger panel so the Storybook user can click and see dialogs.

const AlertDemo = defineComponent({
  name: 'AlertDemo',
  setup() {
    const { success, error, warning, info, confirm, ask, deleteConfirm, withLoader, fire } =
      useAlert();

    async function triggerWithLoader() {
      const result = await withLoader('Saving changes…', () => {
        return new Promise<void>(resolve => setTimeout(resolve, 1800));
      });
      if (result.isConfirmed) success('Saved!', 'Your changes have been saved.');
    }

    async function triggerDeleteConfirm() {
      const result = await deleteConfirm('Delete this item?', 'This action cannot be undone.');
      if (result.isConfirmed) success('Deleted!', 'The item has been removed.');
    }

    async function triggerCustom() {
      fire({
        title: 'Make an excellent acquisition?',
        html: '<p>This will spend <strong>3 Sapphires</strong> from your balance.</p>',
        iconVariant: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes pls!',
        cancelButtonText: 'Nevermind…',
      });
    }

    return {
      success,
      error,
      warning,
      info,
      confirm,
      ask,
      deleteConfirm,
      triggerWithLoader,
      triggerDeleteConfirm,
      triggerCustom,
    };
  },
  template: `
    <div style="display:flex; flex-wrap:wrap; gap:10px; padding:1.5rem; font-family: Panton, system-ui, sans-serif;">
      <button class="plx-swal-btn plx-swal-btn--confirm" @click="success('Operation complete!', 'Everything went perfectly.')">
        ✔ Success
      </button>
      <button class="plx-swal-btn plx-swal-btn--danger" @click="error('Something went wrong', 'Please try again or contact support.')">
        ✖ Error / Danger
      </button>
      <button class="plx-swal-btn" style="background:var(--plx-yellow,#fc2);color:#1a1a1a;" @click="warning('Watch out!', 'This action may have side effects.')">
        ⚠ Warning
      </button>
      <button class="plx-swal-btn" style="background:var(--plx-blue,#56f);color:#fff;" @click="info('Heads up', 'Here is some useful information for you.')">
        ℹ Info
      </button>
      <button class="plx-swal-btn plx-swal-btn--deny" @click="triggerDeleteConfirm">
        🗑 Delete confirm
      </button>
      <button class="plx-swal-btn plx-swal-btn--confirm" @click="triggerWithLoader">
        ⏳ With loader
      </button>
      <button class="plx-swal-btn plx-swal-btn--confirm" @click="triggerCustom">
        🛒 Custom (buy item)
      </button>
    </div>
  `,
});

const meta: Meta = {
  title: 'Stardust UI/Alert (SweetAlert2)',
  component: AlertDemo,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
**Alert** wraps SweetAlert2 v11 with the Pollux design-system theme.

Import the composable and call its helpers:

\`\`\`ts
import { useAlert } from '@/ui/stardust-ui/Alert/useAlert';

const { success, error, warning, info, confirm, ask, deleteConfirm, withLoader, fire } = useAlert();

// Simple variant alerts
await success('Saved!', 'Your settings have been updated.');
await error('Oops', 'Something went wrong.');
await warning('Watch out!', 'This may have side effects.');
await info('Note', 'Here is some info.');

// Boolean confirm shorthand
if (await ask('Delete this item?', 'This cannot be undone.')) {
  // user clicked Confirm
}

// Pre-built delete confirmation
const result = await deleteConfirm('Remove role?');
if (result.isConfirmed) { /* delete */ }

// Loading task dialog
await withLoader('Saving…', async () => {
  await apiCall();
});

// Full escape hatch
fire({ title: 'Custom', html: '<b>Rich HTML</b>', iconVariant: 'question', showCancelButton: true });
\`\`\`

For non-setup contexts (stores, router guards, etc.), use the singleton:

\`\`\`ts
import { plxAlert } from '@/ui/stardust-ui/Alert/useAlert';
await plxAlert.ask('Continue?');
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Showcase: Story = {
  render: () => AlertDemo,
  name: 'All Variants',
};
