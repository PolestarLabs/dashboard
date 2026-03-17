import type { SweetAlertOptions } from 'sweetalert2';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error' | 'question';

/** Variants that have a custom icon in Alert/Icons (includes 'question' for confirm-style dialogs). */
export type AlertIconVariant = AlertVariant;

/** Options for fire(). Extends SweetAlertOptions with optional custom icon variant. */
export type PlxAlertFireOptions = SweetAlertOptions & {
  /** Use a custom Vue icon from Alert/Icons. When set, vanilla Swal icon is not used. */
  iconVariant?: AlertIconVariant;
  /** Enable compact mode: small buttons + left-aligned icon. */
  compact?: boolean;
  /** Inject a starfield backdrop into the Swal container (adds HTML + CSS). */
  bgAnimation?: boolean;
};
