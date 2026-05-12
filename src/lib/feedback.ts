import type { AppToastAction } from '@/src/components/ui/AppToastHost';
import type { useToast } from '@/src/contexts/ToastContext';

type ToastApi = ReturnType<typeof useToast>;

export function notifyCreateSuccess(toast: ToastApi, title: string, description?: string, action?: AppToastAction) {
  toast.success(title, description, action);
}

export function notifyUpdateSuccess(toast: ToastApi, title: string, description?: string, action?: AppToastAction) {
  toast.success(title, description, action);
}

export function notifyDeleteSuccess(toast: ToastApi, title: string, description?: string, action?: AppToastAction) {
  toast.success(title, description, action);
}

export function notifyValidationError(toast: ToastApi, title: string, description?: string, action?: AppToastAction) {
  toast.warning(title, description, action);
}

export function notifyNetworkError(toast: ToastApi, title: string, description?: string, action?: AppToastAction) {
  toast.error(title, description, action);
}

export function notifyUnexpectedError(toast: ToastApi, title: string, description?: string, action?: AppToastAction) {
  toast.error(title, description, action);
}
