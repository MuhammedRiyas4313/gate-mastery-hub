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

export function AppSidebar() {
  const { state, setOpenMobile, isMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { logout, user } = useAuth();

  return (
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
          onClick={() => logout()}
          className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-all hover:bg-destructive/10 text-muted-foreground hover:text-destructive active:scale-95 ${collapsed ? 'justify-center' : ''}`}
          title="Logout"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="font-bold text-sm tracking-tight">Logout</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
