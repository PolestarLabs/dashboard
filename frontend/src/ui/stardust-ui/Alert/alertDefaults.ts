import type { SweetAlertOptions } from 'sweetalert2';
 
export const DEFAULTS: SweetAlertOptions = {
  customClass: {
    popup:         'plx-swal-popup',
    title:         'plx-swal-title',
    htmlContainer: 'plx-swal-body',
    icon:          'plx-swal-icon',
    actions:       'plx-swal-actions',
    confirmButton: 's-btn s-btn--primary',
    cancelButton:  's-btn s-btn--danger s-btn--ghost',
    denyButton:    's-btn s-btn--secondary ',
    closeButton:   'plx-swal-close',
  },
  buttonsStyling: false,
  showCloseButton: true,
  allowOutsideClick: true,
};
