import { Home, BookOpen, CalendarDays, CheckSquare, RefreshCw, FileText, FlaskConical, BarChart3 } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
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
  { title: "Dashboard", url: "/", icon: Home, emoji: "🏠" },
  { title: "Subjects", url: "/subjects", icon: BookOpen, emoji: "📚" },
  { title: "Planner", url: "/planner", icon: CalendarDays, emoji: "📅" },
  { title: "Tasks", url: "/tasks", icon: CheckSquare, emoji: "✅" },
  { title: "Revision", url: "/revision", icon: RefreshCw, emoji: "🔁" },
  { title: "PYQ", url: "/pyq", icon: FileText, emoji: "📝" },
  { title: "Quizzes", url: "/quizzes", icon: FlaskConical, emoji: "🧪" },
  { title: "Analytics", url: "/analytics", icon: BarChart3, emoji: "📊" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="pt-4">
        {!collapsed && (
          <div className="px-4 pb-4 mb-2">
            <h1 className="font-heading text-xl font-bold text-primary">GATE Tracker</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Study smart, not hard</p>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center pb-4 mb-2">
            <span className="text-primary font-heading font-bold text-lg">G</span>
          </div>
        )}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-secondary"
                      activeClassName="bg-secondary text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
