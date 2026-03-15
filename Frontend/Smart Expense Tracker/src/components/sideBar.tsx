import {
  Sidebar,

  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarContent,
  SidebarFooter,
} from "./ui/sidebar"

import {
  BookDashed,

  PanelLeftClose,
  FileText,
  // Users,
  // Settings,
  HelpingHand,
} from "lucide-react"

import { createContext, useContext, useRef, type Dispatch, type SetStateAction } from "react"
import { NavLink } from "react-router"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import authService from "../lib/authService";

import { Toast } from "primereact/toast";


export type SideBarContextProps = {
  open: boolean,
  setOpen: Dispatch<SetStateAction<boolean>>;
}
export const SideBarContext = createContext<SideBarContextProps | null>(null);
export default function SidebarExample() {
  const toast = useRef<Toast | null>(null);
  const SideBarcontext = useContext(SideBarContext);
  
  return (
    
    <Sidebar variant="sidebar" collapsible="offcanvas">
      <Toast ref={toast} />
      <div className="flex items-center text-center justify-between p-3 m-2">
        <h1 className="text-xl flex-1 cursor-pointer" onClick={()=>{window.location.href="/"}}>MoneyMint</h1>
        {/* {SideBarcontext?.open && ( */}
          <SidebarTrigger asChild>
            {/* <button className="flex items-center justify-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition ml-2"> */}
              <PanelLeftClose className="w-6 h-6 text-black dark:text-white" />
            {/* </button> */}
          </SidebarTrigger>
        {/* )} */}
      </div>

      <SidebarHeader />

      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex flex-col items-start justify-start border-t p-2 gap-3">
              <nav className="w-full">
                <ul className="flex flex-col gap-2">
                  <li>
                    <NavLink to="/dashboard" onClick={() => SideBarcontext?.setOpen(false)} className={({isActive}: any) => `flex items-center gap-2 p-2 rounded ${isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-green-500 dark:hover:bg-slate-800'}`}>
                      <BookDashed size={18} onClick={()=>
                        {
                          
                        }
                      }/>
                      <span>Dashboard</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/transcation" onClick={() => SideBarcontext?.setOpen(false)} className={({isActive}: any) => `flex items-center gap-2 p-2 rounded ${isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-green-500 dark:hover:bg-slate-800'}`}>
                      <FileText size={18} />
                      <span>Transactions</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/budget" onClick={() => SideBarcontext?.setOpen(false)} className={({isActive}: any) => `flex items-center gap-2 p-2 rounded ${isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' :'hover:bg-green-500 dark:hover:bg-slate-800'}`}>
                      <BookDashed size={18} />
                      <span>Budgets</span>
                    </NavLink>
                  </li>
                 <li>
                    <NavLink to="/chat" onClick={() => SideBarcontext?.setOpen(false)} className={({isActive}: any) => `flex items-center gap-2 p-2 rounded ${isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' :'hover:bg-green-500 dark:hover:bg-slate-800'}`}>
                      <HelpingHand size={18} />
                      <span>Ask Arturo for Advice</span>
                    </NavLink>
                  </li>
                  <li>
                    {/* <button onClick={() => { if(!sessionStorage.getItem("id")){toast.current?.show({severity:"error",summary:"Invalid access", detail:"Please Login/Sign-up before updating your profile"}); return;} window.location.href = '/register'; SideBarcontext?.setOpen(false); }} className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-800">
                      <Settings size={18} />
                      <span>Update Profile</span>
                    </button> */}
                  </li>
                </ul>
              </nav>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        {authService.isLoggedIn() ? (
          <div className="flex items-center justify-between gap-3 ">
            <Avatar size="lg" className="">
              <AvatarImage src="https://png.pngtree.com/png-vector/20220709/ourmid/pngtree-businessman-user-avatar-wearing-suit-with-red-tie-png-image_5809521.png" />
              <AvatarFallback>NO</AvatarFallback>
            </Avatar>
            <label className="dark:text-white">{localStorage.getItem("name")?.toUpperCase()}</label>
            <button
              className="bg-black text-center p-2 text-white rounded-lg dark:border dark:border-white"
              onClick={() => {
                authService.logout();
                sessionStorage.clear();
                window.location.href = "/login"
              }}
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-start gap-3">
            <button
              className="bg-black text-white px-4 py-2 rounded  dark:border dark:border-white"
              onClick={() => {
                window.location.href = "/login"
              }}
            >
              Sign In
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}