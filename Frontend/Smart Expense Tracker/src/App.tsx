import './App.css'
import { Routes, Route } from 'react-router'
import Login from './pages/Login'
import Registration from './pages/Registration'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import { NotFound } from './pages/NotFound'
import LoadingAnimation from './assets/Material wave loading.gif'
import { createContext, Suspense, useState } from 'react'
import VerifyUser from './pages/verify'
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar'
import { PanelLeftOpen } from 'lucide-react'
import SidebarExample, { type SideBarContextProps } from './components/sideBar'
import Budget from './components/Budget'
import Transcation from './components/TransactionOnlyPage'
import DashboardL from './pages/Dashboard'
import { PrimeReactProvider } from 'primereact/api'
import Chat from './pages/Chat'
import { DashboardContext } from './store/slices/chartsSlice'

export const SideBarContext = createContext<any>(null);

function App() {
  const [open, SetOpen] = useState<boolean>(false);
  const value: SideBarContextProps = { open, setOpen: SetOpen };

  const [dashMonth, setDashMonth] = useState<number>(-1);
  const [dashYear, setDashYear] = useState<number>(-1);

  return (
    <PrimeReactProvider>
      <SideBarContext.Provider value={value}>
        <DashboardContext.Provider
          value={{
            month: dashMonth,
            year: dashYear,
            setMonth: setDashMonth,
            setYear: setDashYear,
          }}
        >
          <SidebarProvider open={value.open} onOpenChange={value.setOpen}>
            
            {/* Sidebar */}
            <SidebarExample />

            {/* ✅ Mobile Sidebar Trigger */}
            {!value.open && (
              <div className="md:hidden fixed top-0 left-4 z-60 bg-black w-full">
                <SidebarTrigger asChild>
                  <button className=" rounded-lg bg-white mt-4 dark:bg-black backdrop-blur-md shadow-md transition hover:scale-105">
                    <PanelLeftOpen className="text-black dark:text-white" />
                  </button>
                </SidebarTrigger>
              </div>
            )}

            {/* Main Content */}
            <main className="w-full">
              
              {/* Navbar (Desktop only handled inside Navbar) */}
              <Navbar />

              <Suspense
                fallback={
                  <div className="flex justify-center items-center min-h-screen">
                    <img src={LoadingAnimation} alt="loading" />
                  </div>
                }
              >
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Registration />} />
                  <Route path="/budget" element={<Budget />} />
                  <Route path="/dashboard" element={<DashboardL />} />
                  <Route path="/transcation" element={<Transcation />} />
                  <Route path="/verify/:id" element={<VerifyUser />} />
                  <Route path="/verified" element={<Registration />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>

            </main>

          </SidebarProvider>
        </DashboardContext.Provider>
      </SideBarContext.Provider>
    </PrimeReactProvider>
  )
}

export default App