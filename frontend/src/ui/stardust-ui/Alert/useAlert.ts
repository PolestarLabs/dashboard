import { createApp, type Component } from 'vue';
import Swal, { type SweetAlertOptions, type SweetAlertResult } from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import './Alert.scss';
import ErrorIcon from './Icons/Error.vue';
import InformationIcon from './Icons/Information.vue';
import QuestionIcon from './Icons/Question.vue';
import SuccessIcon from './Icons/Success.vue';
import WarningIcon from './Icons/Warning.vue';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

/** Variants that have a custom icon in Alert/Icons (includes 'question' for confirm-style dialogs). */
export type AlertIconVariant = AlertVariant | 'question';

const VARIANT_ICONS: Record<AlertIconVariant, Component> = {
  success: SuccessIcon,
  danger:  ErrorIcon,
  warning: WarningIcon,
  info:    InformationIcon,
  question: QuestionIcon,
};

const ICON_MOUNT_MARKER = 'data-plx-icon-mount';
const ICON_HTML = `<div ${ICON_MOUNT_MARKER}></div>`;

function mountIcon(modal: HTMLElement, variant: AlertIconVariant): void {
  const slot = modal.querySelector(`.plx-swal-icon [${ICON_MOUNT_MARKER}]`);
  if (!slot || !(slot instanceof HTMLElement)) return;
  const IconComponent = VARIANT_ICONS[variant];
  if (!IconComponent) return;
  const app = createApp(IconComponent);
  app.mount(slot);
}

/** Shared baseline applied to every Swal.fire() call. `buttonsStyling: false`
 *  hands full control to our SCSS — matching the Stardust Button component. */
const DEFAULTS: SweetAlertOptions = {
  customClass: {
    popup:         'plx-swal-popup',
    title:         'plx-swal-title',
    htmlContainer: 'plx-swal-body',
    icon:          'plx-swal-icon',
    actions:       'plx-swal-actions',
    confirmButton: 'plx-swal-btn plx-swal-btn--confirm',
    cancelButton:  'plx-swal-btn plx-swal-btn--cancel',
    denyButton:    'plx-swal-btn plx-swal-btn--deny',
    closeButton:   'plx-swal-close',
  },
  buttonsStyling: false,
  showCloseButton: true,
  allowOutsideClick: true,
};

/** Options for fire(). Extends SweetAlertOptions with optional custom icon variant. */
export type PlxAlertFireOptions = SweetAlertOptions & {
  /** Use a custom Vue icon from Alert/Icons. When set, vanilla Swal icon is not used. */
  iconVariant?: AlertIconVariant;
};

export function useAlert() {
  /** Low-level escape hatch — passes straight to Swal.fire() with project defaults merged in.
   *  Pass iconVariant to show a custom icon from Alert/Icons instead of vanilla Swal. */
  function fire(opts: PlxAlertFireOptions): Promise<SweetAlertResult> {
    const { iconVariant, ...swalOpts } = opts;
    if (iconVariant) {
      const base: SweetAlertOptions = {
        ...swalOpts,
        iconHtml: ICON_HTML,
        didOpen: (modal) => {
          mountIcon(modal as HTMLElement, iconVariant);
          swalOpts.didOpen?.(modal);
        },
      };
      return Swal.fire({ ...DEFAULTS, ...base } as SweetAlertOptions);
    }
    return Swal.fire({ ...DEFAULTS, ...swalOpts } as SweetAlertOptions);
  }

  /** Single-button informational alert. Uses custom Vue icons from Alert/Icons. */
  function alert(
    title: string,
    text?: string,
    variant: AlertVariant = 'info',
  ): Promise<SweetAlertResult> {
    return fire({
      title,
      text,
      iconHtml: ICON_HTML,
      didOpen: (modal) => mountIcon(modal as HTMLElement, variant),
    });
  }

  /** Confirm dialog — resolves with the full SweetAlertResult.
   *  Use `ask()` for a simple boolean shorthand. */
  function confirm(
    title: string,
    text?: string,
    opts?: Omit<SweetAlertOptions, 'title' | 'text'>,
  ): Promise<SweetAlertResult> {
    return fire({
      title,
      text,
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      ...opts,
    } as PlxAlertFireOptions);
  }

  /** Boolean shorthand for confirm — resolves `true` if the user clicked Confirm. */
  async function ask(
    title: string,
    text?: string,
    opts?: Omit<SweetAlertOptions, 'title' | 'text'>,
  ): Promise<boolean> {
    const result = await confirm(title, text, opts);
    return result.isConfirmed;
  }

  /** Preset: success */
  function success(title: string, text?: string): Promise<SweetAlertResult> {
    return alert(title, text, 'success');
  }

  /** Preset: error / danger */
  function error(title: string, text?: string): Promise<SweetAlertResult> {
    return alert(title, text, 'danger');
  }

  /** Preset: warning */
  function warning(title: string, text?: string): Promise<SweetAlertResult> {
    return alert(title, text, 'warning');
  }

  /** Preset: info */
  function info(title: string, text?: string): Promise<SweetAlertResult> {
    return alert(title, text, 'info');
  }

  /** Delete-confirmation shortcut — pre-configured with danger styling and Error icon.
   *  Mirrors the pattern used heavily in the legacy adm_menus.js / boorusave.pug. */
  function deleteConfirm(
    title = 'Are you sure?',
    text?: string,
  ): Promise<SweetAlertResult> {
    return fire({
      title,
      text,
      iconHtml: ICON_HTML,
      didOpen: (modal) => mountIcon(modal as HTMLElement, 'danger'),
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      customClass: {
        ...DEFAULTS.customClass,
        confirmButton: 'plx-swal-btn plx-swal-btn--danger',
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });
  }

  /** Async task dialog — shows a spinner while `task` runs, then resolves.
   *  Replicates the `showLoaderOnConfirm + preConfirm` pattern from legacy code. */
  function withLoader(
    title: string,
    task: () => Promise<unknown>,
    opts?: Omit<SweetAlertOptions, 'title'>,
  ): Promise<SweetAlertResult> {
    return fire({
      title,
      allowEscapeKey: () => !Swal.isLoading(),
      allowOutsideClick: () => !Swal.isLoading(),
      showConfirmButton: false,
      showLoaderOnConfirm: true,
      preConfirm: task,
      didOpen: () => Swal.clickConfirm(),
      ...opts,
    } as PlxAlertFireOptions);
  }

  return { fire, alert, confirm, ask, success, error, warning, info, deleteConfirm, withLoader };
}

/** Singleton instance — import `plxAlert` for script-context usage (outside Vue setup). */
export const plxAlert = useAlert();
