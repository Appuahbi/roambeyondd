import { Toaster } from 'react-hot-toast'

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#1A1A2E',
          color: '#fff',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          fontFamily: 'Inter, system-ui, sans-serif',
        },
        success: {
          iconTheme: { primary: '#059669', secondary: '#fff' },
        },
        error: {
          iconTheme: { primary: '#E11D48', secondary: '#fff' },
        },
      }}
    />
  )
}
