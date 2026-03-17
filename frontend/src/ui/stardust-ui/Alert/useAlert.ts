import Swal, { type SweetAlertOptions, type SweetAlertResult } from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import './Alert.scss';

import { AlertVariant, PlxAlertFireOptions } from './AlertTypes';
import { DEFAULTS } from './alertDefaults';
import { attachBgAnimationHandlers, mergeClassNames } from './alertUtils';
import { ICON_HTML, mountIcon, normalizeIconVariant } from './alertIcons';

export function useAlert() {
  /**
   * Low-level escape hatch — passes straight to Swal.fire() with project defaults merged in.
   * Pass iconVariant to show a custom icon from Alert/Icons instead of vanilla Swal.
   */
  function fire(opts: PlxAlertFireOptions): Promise<SweetAlertResult> {
    let { iconVariant, compact, bgAnimation = true, ...swalOpts } = opts;

    if (swalOpts.icon) {
      const iconString = Array.isArray(swalOpts.icon) ? swalOpts.icon[0] : swalOpts.icon;
      iconVariant = normalizeIconVariant(iconString);
      delete swalOpts.icon;
    }

    const baseCustomClass = {
      ...DEFAULTS.customClass,
      ...swalOpts.customClass,
    };

    const customClass = compact
      ? {
          ...baseCustomClass,
          popup: mergeClassNames(baseCustomClass.popup, 'plx-swal-popup--icon-left'),
          confirmButton: mergeClassNames(baseCustomClass.confirmButton, 's-btn--sm'),
          cancelButton: mergeClassNames(baseCustomClass.cancelButton, 's-btn--sm'),
          denyButton: mergeClassNames(baseCustomClass.denyButton, 's-btn--sm'),
        }
      : baseCustomClass;

    const base: SweetAlertOptions = {
      ...swalOpts,
      customClass,
    };

    const mergedOpts = { ...DEFAULTS, ...base } as SweetAlertOptions;

    if (compact) {
      mergedOpts.allowOutsideClick = true;
    }

    if (bgAnimation) {
      attachBgAnimationHandlers(mergedOpts);
    }

    const originalDidOpen = mergedOpts.didOpen;
    const originalWillClose = mergedOpts.willClose;

    if (iconVariant) {
      return Swal.fire({
        ...mergedOpts,
        iconHtml: ICON_HTML,
        didOpen: (modal) => {
          mountIcon(modal as HTMLElement, iconVariant);
          originalDidOpen?.(modal);
        },
        willClose: (modal) => {
          originalWillClose?.(modal);
        },
      } as SweetAlertOptions);
    }

    return Swal.fire(mergedOpts);
  }

  /** Single-button informational alert. */
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
    return alert(title, text, 'error');
  }

  /** Preset: warning */
  function warning(title: string, text?: string): Promise<SweetAlertResult> {
    return alert(title, text, 'warning');
  }

  /** Preset: info */
  function info(title: string, text?: string): Promise<SweetAlertResult> {
    return alert(title, text, 'info');
  }

  /** Delete-confirmation shortcut — pre-configured with error styling and Error icon.
   *  Mirrors the pattern used heavily in the legacy adm_menus.js / boorusave.pug. */
  function deleteConfirm(
    title = 'Are you sure?',
    text?: string,
  ): Promise<SweetAlertResult> {
    return fire({
      title,
      text,
      iconHtml: ICON_HTML,
      didOpen: (modal) => mountIcon(modal as HTMLElement, 'question'),
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      showClass: { popup: 'animate__animated animate__fadeInLeft'  },
      hideClass: { popup: 'animate__animated animate__fadeOutRight' }, 
      customClass: {
        ...DEFAULTS.customClass,
        confirmButton: 's-btn s-btn--danger',
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
