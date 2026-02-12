import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/theme.css'
import './styles/languages.css'
import App from './App.jsx'
import { store } from './store';
import './i18n/config';
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import GlobalLoader from './components/GlobalLoader.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Toaster position="top-right" reverseOrder={false} />
    <ThemeProvider>
      <Provider store={store}>  
<BrowserRouter> 
    <GlobalLoader />
    <App />
</BrowserRouter>
      </Provider>
    </ThemeProvider>
  </StrictMode>,
)
