import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import { store } from './store';
import './i18n/config';

import './index.css'
import './styles/theme.css'
import './styles/languages.css'

import App from './App.jsx'
import { ThemeProvider } from "./context/ThemeContext.jsx";
import GlobalLoader from './components/GlobalLoader.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      {/* ✅ ThemeProvider inside Provider allows it to access Redux if needed */}
      <ThemeProvider> 
        <BrowserRouter>
          <Toaster 
            position="top-right" 
            reverseOrder={false} 
            toastOptions={{
              // ✅ Optional: Make toasts theme-aware
              className: 'dark:bg-zinc-900 dark:text-white dark:border-zinc-800',
            }}
          />
          <GlobalLoader />
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)