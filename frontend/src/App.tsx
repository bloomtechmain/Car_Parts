import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { router } from './router';
import Preloader from './components/layout/Preloader';

export default function App() {
  return (
    <>
      <Preloader />
      <RouterProvider router={router} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#161511',
            color: '#e9e3d6',
            border: '1px solid #2d2a24',
            borderRadius: 0,
            fontSize: 14,
          },
          success: { iconTheme: { primary: '#ff5a1f', secondary: '#0f0e0c' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#ffffff' } },
        }}
      />
    </>
  );
}
