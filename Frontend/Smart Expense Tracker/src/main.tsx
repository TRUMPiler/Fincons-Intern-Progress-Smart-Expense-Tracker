import { StrictMode } from 'react'
// Ensure Chart.js components are registered for PrimeReact Chart
import 'chart.js/auto';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router'
import { SidebarProvider } from './components/ui/sidebar.tsx'
import { ThemeProvider } from './components/ui/ThemeProvider.tsx'
import { PrimeReactProvider } from 'primereact/api'
import { Provider } from 'react-redux'
import store from './store'
// const root = document.getElementById('root')!;
// root.attachShadow({ mode: 'open' }); // Open the shadowRoot
// const mountHere = root.shadowRoot;

// const options = { appendTo: mountHere, styleContainer: mountHere};
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <SidebarProvider defaultOpen={true}>
          <PrimeReactProvider>
            <BrowserRouter>
              <App />

            </BrowserRouter>
          </PrimeReactProvider>
        </SidebarProvider>
      </ThemeProvider>
    </Provider>
  </StrictMode>
)
