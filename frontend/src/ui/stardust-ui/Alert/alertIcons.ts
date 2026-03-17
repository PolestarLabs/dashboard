import { createApp, type Component } from 'vue';
import type { AlertIconVariant } from './AlertTypes';

import ErrorIcon        from './Icons/Error.vue';
import InformationIcon  from './Icons/Information.vue';
import QuestionIcon     from './Icons/Question.vue';
import SuccessIcon      from './Icons/Success.vue';
import WarningIcon      from './Icons/Warning.vue';

const VARIANT_ICONS: Record<AlertIconVariant, Component> = {
  success:  SuccessIcon,
  error:    ErrorIcon,
  warning:  WarningIcon,
  info:     InformationIcon,
  question: QuestionIcon,
};

export const ICON_MOUNT_MARKER = 'data-plx-icon-mount';
export const ICON_HTML = `<div ${ICON_MOUNT_MARKER}></div>`;

export function mountIcon(modal: HTMLElement, variant: AlertIconVariant): void {
  const slot = modal.querySelector(`.plx-swal-icon [${ICON_MOUNT_MARKER}]`);
  if (!slot || !(slot instanceof HTMLElement)) return;
  const IconComponent = VARIANT_ICONS[variant];
  if (!IconComponent) return;
  const app = createApp(IconComponent);
  app.mount(slot);
}

export function normalizeIconVariant(icon?: string): AlertIconVariant | undefined {
  if (!icon) return undefined;
  const normalized = icon.toLowerCase();

  const iconMap: Record<string, AlertIconVariant> = {
    error:      'error',
    danger:     'error',
    success:    'success',
    warning:    'warning',
    info:       'info',
    question:   'question',
  };

  return iconMap[normalized];
}
