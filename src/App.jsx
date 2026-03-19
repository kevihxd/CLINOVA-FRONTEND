import { RouterProvider } from 'react-router-dom';
import router from './router';
import { AlertProvider } from './providers/AlertProvider';
import { AuthProvider } from './providers/AuthProvider';
import { DashboardConfigProvider } from './providers/DashboardConfigProvider';

function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <DashboardConfigProvider>
          <RouterProvider router={router} />
        </DashboardConfigProvider>
      </AlertProvider>
    </AuthProvider>
  )
}

export default App
