import type { SweetAlertOptions } from 'sweetalert2';

export function mergeClassNames(base?: string | readonly string[], extra?: string) {
  const baseString = Array.isArray(base)
    ? base.join(' ')
    : typeof base === 'string'
    ? base
    : '';

  if (!extra) return baseString;

  const parts = new Set([...(baseString).split(/\s+/).filter(Boolean), ...extra.split(/\s+/).filter(Boolean)]);
  return Array.from(parts).join(' ');
}

export function createBgAnimationElement() {
  const wrapper = document.createElement('div');
  wrapper.className = 'modal-bg-animation';
  wrapper.innerHTML = `
    <div id="stars"></div>
    <div id="stars2"></div>
    <div id="stars3"></div>
    <div id="stars4"></div>
  `;
  return wrapper;
}

export function attachBgAnimationHandlers(opts: SweetAlertOptions) {
  const originalDidOpen = opts.didOpen;
  const originalWillClose = opts.willClose;

  opts.didOpen = (modal) => {
    const container =
      (modal as HTMLElement).closest('.swal2-container') ||
      document.querySelector('.swal2-container') ||
      document.body;

    const existing = document.querySelector('.modal-bg-animation');
    if (!existing) {
      container.insertBefore(createBgAnimationElement(), modal as Node);
    }

    originalDidOpen?.(modal);
  };

  opts.willClose = (modal) => {
    // If multiple SweetAlert modals are queued/stacked, only remove the animation
    // once the last modal is closed.
    const popups = document.querySelectorAll('.swal2-popup');
    if (popups.length > 1) {
      originalWillClose?.(modal);
      return;
    }

    // Delay removal slightly so SweetAlert can remove the popup first.
    setTimeout(() => {
      if (!document.querySelector('.swal2-popup')) {
        document.querySelector('.modal-bg-animation')?.remove();
      }
    }, 0);

    originalWillClose?.(modal);
  };
}
