import { RouterProvider } from 'react-router-dom';
import { QueryProvider } from '@/lib/query-provider';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { router } from '@/router';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="aimpro-theme">
      <QueryProvider>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

export default App;
