import { Home, BookOpen, CalendarDays, RefreshCw, FileText, FlaskConical, BarChart3, ClipboardList, Trophy, Zap } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Subjects", url: "/subjects", icon: BookOpen },
  { title: "Planner", url: "/planner", icon: CalendarDays },
  { title: "Revision", url: "/revision", icon: RefreshCw },
  { title: "PYQ", url: "/pyq", icon: FileText },
  { title: "Quizzes", url: "/quizzes", icon: FlaskConical },
  { title: "DPP", url: "/dpp", icon: ClipboardList },
  { title: "Test Series", url: "/test-series", icon: Trophy },
  { title: "Institute Logs", url: "/schedules", icon: FileText },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

import { SidebarFooter } from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";

export function AppSidebar() {
  const { state, setOpenMobile, isMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { logout, user } = useAuth();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  return (
    <>
      <Sidebar collapsible="icon" className="border-r-0">
        <SidebarContent className="pt-8">
          {!collapsed && (
            <div className="px-6 pb-8 mb-2">
              <Logo size={42} />
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center pb-8 mb-2">
               <div className="h-10 w-10 flex items-center justify-center bg-primary rounded-xl shadow-lg shadow-primary/20 hover:scale-110 transition-transform">
                  <Zap className="text-white h-5 w-5" strokeWidth={3} />
               </div>
            </div>
          )}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1 px-2">
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                      tooltip={item.title}
                      className="h-11 rounded-xl"
                    >
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className="gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-primary/10 hover:text-primary"
                        activeClassName="bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20"
                        onClick={() => {
                          if (isMobile) {
                            setOpenMobile(false);
                          }
                        }}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!collapsed && <span className="font-medium tracking-tight">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-primary/5">
          <button
            onClick={() => setLogoutConfirmOpen(true)}
            className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-all hover:bg-destructive/10 text-muted-foreground hover:text-destructive active:scale-95 ${collapsed ? 'justify-center' : ''}`}
            title="Logout"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="font-bold text-sm tracking-tight">Logout</span>}
          </button>
        </SidebarFooter>
      </Sidebar>

      <AlertDialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <AlertDialogContent className="rounded-[2.5rem] border-primary/10 p-10 max-w-sm">
          <AlertDialogHeader>
            <div className="flex items-center gap-5 mb-6">
              <div className="w-14 h-14 bg-destructive/10 rounded-2xl flex items-center justify-center shrink-0">
                <LogOut className="h-7 w-7 text-destructive" />
              </div>
              <AlertDialogTitle className="font-heading text-2xl md:text-3xl font-black text-left">Ready to exit?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base text-muted-foreground pt-1 text-left leading-relaxed">
              We'll miss you. Are you sure you want to end your current session?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex flex-col sm:flex-row gap-3">
            <AlertDialogCancel className="h-12 flex-1 rounded-2xl font-black uppercase tracking-widest text-[10px] border-primary/5">Wait, stay</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => logout()} 
              className="h-12 flex-1 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-destructive text-white hover:bg-destructive/90 shadow-xl shadow-destructive/20"
            >
              Yes, Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
