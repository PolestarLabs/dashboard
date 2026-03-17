import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { defineComponent } from 'vue';
import Swal from 'sweetalert2';
import { useAlert } from './useAlert';
import Button from '../Button/Button.vue';

// The Alert system is a composable (programmatic API), not a rendered component.
// Stories render a trigger panel so the Storybook user can click and see dialogs.

const AlertDemo = defineComponent({
  name: 'AlertDemo',
  components: { Button },
  setup() {
    const { alert, success, error, warning, info, confirm, ask, deleteConfirm, withLoader, fire } =
      useAlert();

    async function triggerAlert() {
      await alert('Heads up', 'This is a custom alert using the core `alert()` helper.', 'danger');
    }

    async function triggerAlertLeftIcon() {
      await fire({
        title: 'Heads up',
        text: 'This alert shows the icon animation to the left of the content.',
        iconVariant: 'info',
        customClass: {
          popup: 'plx-swal-popup plx-swal-popup--icon-left',
        },
      });
    }

    async function triggerWithLoader() {
      const result = await withLoader('Saving changes…', () => {
        return new Promise<void>(resolve => setTimeout(resolve, 1800));
      });
      if (result.isConfirmed) success('Saved!', 'Your changes have been saved.');
    }

    async function triggerAsk() {
      if (await ask('Delete this item?', 'This action cannot be undone.')) {
        success('Deleted!', 'The item has been removed.');
      }
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

    async function triggerNoBackground() {
      await fire({
        title: 'No Background',
        text: 'This pops up without the dark backdrop overlay.',
        iconVariant: 'info',
        noBackdrop: true,
      });
    }

    return {
      alert,
      success,
      error,
      warning,
      info,
      confirm,
      ask,
      deleteConfirm,
      triggerAlert,
      triggerAlertLeftIcon,
      triggerWithLoader,
      triggerAsk,
      triggerDeleteConfirm,
      triggerCustom,
      triggerNoBackground,
    };
  },
  template: `
    <div style="display:flex; flex-wrap:wrap; gap:0.75rem; padding:1.5rem; font-family: Panton, system-ui, sans-serif;">
      <Button
        label="Success"
        icon="fas fa-check"
        variant="fancy"
        theme="success"
        size="sm"
        @click="success('Operation complete!', 'Everything went perfectly.')"
      />
      <Button
        label="Error / Danger"
        icon="fas fa-xmark"
        variant="fancy"
        theme="danger"
        size="sm"
        @click="error('Something went wrong', 'Please try again or contact support.')"
      />
      <Button
        label="Warning"
        icon="fas fa-triangle-exclamation"
        variant="fancy"
        theme="warning"
        size="sm"
        @click="warning('Watch out!', 'This action may have side effects.')"
      />
      <Button
        label="Info"
        icon="fas fa-circle-info"
        variant="secondary"
        theme="info"
        size="sm"
        @click="info('Heads up', 'Here is some useful information for you.')"
      />
      <Button
        label="Confirm (boolean)"
        icon="fas fa-question"
        theme="info"
        variant="ghost"
        size="sm"
        @click="triggerAsk"
      />
      <Button
        label="Delete confirm"
        icon="fas fa-trash"
        variant="ghost"
        theme="danger"
        size="sm"
        @click="triggerDeleteConfirm"
      />
      <Button
        label="With loader"
        icon="fas fa-spinner"
        theme="secondary"
        size="sm"
        @click="triggerWithLoader"
      />
      <Button
        label="Custom (buy item)"
        icon="fas fa-cart-shopping"
        theme="primary"
        variant="ghost"
        size="sm"
        @click="triggerCustom"
      />
      <Button
        label="No background"
        icon="fas fa-eye"
        theme="secondary"
        variant="ghost"
        size="sm"
        @click="triggerNoBackground"
      />
    </div>
  `,
});

const AlertDemoIconLeft = defineComponent({
  name: 'AlertDemoIconLeft',
  components: { Button },
  setup() {
    const { fire } = useAlert();
    
    function fireLeft(opts: any) {
      return fire({
        ...opts,
        compact: true,
        bgAnimation: true,
      });
    }

    async function triggerSuccess() {
      await fireLeft({
        title: 'Saved!',
        text: 'Your settings have been updated.',
        icon: 'success',
      });
    }

    async function triggerError() {
      await fireLeft({
        title: 'Oops',
        text: 'Something went wrong.',
        icon: 'error',
      });
    }

    async function triggerWarning() {
      await fireLeft({
        title: 'Watch out!',
        text: 'This may have side effects.',
        icon: 'warning',
      });
    }

    async function triggerInfo() {
      await fireLeft({
        title: 'Note',
        text: 'Here is some info.',
        icon: 'info',
      });
    }

    async function triggerConfirm() {
      const result = await fireLeft({
        title: 'Delete this item?',
        text: 'This cannot be undone.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
      });
      if (result.isConfirmed) {
        await fireLeft({
          title: 'Deleted!',
          text: 'The item has been removed.',
          icon: 'success',
        });
      }
    }

    async function triggerDeleteConfirm() {
      const result = await fireLeft({
        title: 'Delete this item?',
        text: 'This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it',
        cancelButtonText: 'Cancel',
      });
      if (result.isConfirmed) {
        await fireLeft({
          title: 'Deleted!',
          text: 'The item has been removed.',
          icon: 'success',
        });
      }
    }

    async function triggerWithLoader() {
      await fireLeft({
        title: 'Saving changes…',
        allowEscapeKey: () => !Swal.isLoading(),
        allowOutsideClick: () => !Swal.isLoading(),
        showConfirmButton: false,
        showLoaderOnConfirm: true,
        preConfirm: () => new Promise<void>(resolve => setTimeout(resolve, 1800)),
        didOpen: () => Swal.clickConfirm(),
      });
    }

    async function triggerCustom() {
      await fireLeft({
        title: 'Make an excellent acquisition?',
        html: '<p>This will spend <strong>3 Sapphires</strong> from your balance.</p>',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes pls!',
        cancelButtonText: 'Nevermind…',
      });
    }

    return {
      triggerSuccess,
      triggerError,
      triggerWarning,
      triggerInfo,
      triggerConfirm,
      triggerDeleteConfirm,
      triggerWithLoader,
      triggerCustom,
    };
  },
  template: `
    <div style="display:flex; flex-wrap:wrap; gap:0.75rem; padding:1.5rem; font-family: Panton, system-ui, sans-serif;">
      <Button
        label="Success"
        icon="fas fa-check"
        variant="fancy"
        theme="success"
        size="sm"
        @click="triggerSuccess"
      />
      <Button
        label="Error / Danger"
        icon="fas fa-xmark"
        variant="fancy"
        theme="danger"
        size="sm"
        @click="triggerError"
      />
      <Button
        label="Warning"
        icon="fas fa-triangle-exclamation"
        variant="fancy"
        theme="warning"
        size="sm"
        @click="triggerWarning"
      />
      <Button
        label="Info"
        icon="fas fa-circle-info"
        variant="secondary"
        theme="info"
        size="sm"
        @click="triggerInfo"
      />
      <Button
        label="Confirm (boolean)"
        icon="fas fa-question"
        theme="info"
        variant="ghost"
        size="sm"
        @click="triggerConfirm"
      />
      <Button
        label="Delete confirm"
        icon="fas fa-trash"
        variant="ghost"
        theme="danger"
        size="sm"
        @click="triggerDeleteConfirm"
      />
      <Button
        label="With loader"
        icon="fas fa-spinner"
        theme="secondary"
        size="sm"
        @click="triggerWithLoader"
      />
      <Button
        label="Custom (buy item)"
        icon="fas fa-cart-shopping"
        theme="primary"
        variant="ghost"
        size="sm"
        @click="triggerCustom"
      />
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

export const ShowcaseIconLeft: Story = {
  render: () => AlertDemoIconLeft,
  name: 'All Variants (Icon-Left)',
};
