import Modal from './Modal';
import Button from '../ui/Button';

/*
|--------------------------------------------------------------------------
| Admin Confirm Dialog
|--------------------------------------------------------------------------
| Light wrapper around Modal for "are you sure?" prompts.
|--------------------------------------------------------------------------
*/
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  confirmVariant = 'primary',
  busy = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <Button
            onClick={onConfirm}
            loading={busy}
            className={confirmVariant === 'danger' ? '!bg-rose-600 hover:!bg-rose-700' : ''}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-ink-700">{message}</p>
    </Modal>
  );
}
