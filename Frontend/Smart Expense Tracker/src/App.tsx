import './App.css'
import { Routes, Route } from 'react-router'
import Login from './pages/Login'
import Registration from './pages/Registration'
import Home from './pages/Home'
import { NotFound } from './pages/NotFound'
import LoadingAnimation from './assets/Material wave loading.gif';
import { createContext, Suspense, useState } from 'react'
import VerifyUser from './pages/verify';
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar'
import { PanelLeftOpen } from 'lucide-react'
import SidebarExample, { type SideBarContextProps } from './components/sideBar'
import Budget from './components/Budget'
import Transcation from './components/TransactionOnlyPage'
import DashboardL from './pages/Dashboard'
// import Dashboard1L from './pages/Dashboard copy'
import { PrimeReactProvider } from 'primereact/api'
import Chat from './pages/Chat'

export const SideBarContext = createContext<any>(null);

function App() {
  const [open, SetOpen] = useState<boolean>(false);
  const value: SideBarContextProps = { open, setOpen: SetOpen };

  return (
    <>
    <PrimeReactProvider>
      <SideBarContext.Provider value={value}>
        <SidebarProvider open={value.open} onOpenChange={value.setOpen}>
          <SidebarExample />
          {!value.open && (
            <div className='fixed top-4 left-4 z-40'>
              <SidebarTrigger asChild>
                {/* <button className="flex items-center justify-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"> */}
                  <PanelLeftOpen className="text-black dark:text-white"/>
                {/* </button> */}
              </SidebarTrigger>
            </div>
          )}
          <main className='w-full'>
            <Suspense fallback={<div className='flex justify-center items-center min-h-screen'>
              <LoadingAnimation />
            </div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Registration />} />
                <Route path='/budget' element={<Budget/>}/>
                <Route path='/dashboard' element={<DashboardL/>}/>
                   {/* <Route path='/dashboardcopy' element={<Dashboard1L/>}/> */}
                <Route path='/transcation' element={<Transcation/>}/>
                <Route path='/verify/:id' element={<VerifyUser />} />
                <Route path='/verified' element={<Registration />} />
                <Route path='/chat' element={<Chat/>}/>;
                <Route path='*' element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
        </SidebarProvider>
      </SideBarContext.Provider>
      </PrimeReactProvider>
    </>
  )
}

export default App
