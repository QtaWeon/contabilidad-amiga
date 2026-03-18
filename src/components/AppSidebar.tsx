import { useState } from "react";
import { BookOpen, BookText, Package, BarChart3, List, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type Module = "diario" | "mayor" | "inventario" | "catalogo";

interface SidebarProps {
  activeModule: Module;
  onModuleChange: (module: Module) => void;
}

const navItems = [
  { id: "diario" as Module, label: "Libro Diario", icon: BookOpen },
  { id: "mayor" as Module, label: "Libro Mayor", icon: BookText },
  { id: "inventario" as Module, label: "Inventario", icon: Package },
  { id: "catalogo" as Module, label: "Catálogo de Cuentas", icon: List },
];

const AppSidebar = ({ activeModule, onModuleChange }: SidebarProps) => {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 min-h-screen bg-sidebar text-sidebar-foreground flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-sidebar-primary" />
          <div>
            <h1 className="font-display text-lg font-bold leading-tight">Sistema Contable</h1>
            <p className="text-xs text-sidebar-foreground/60 font-body">Bachillerato Técnico</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onModuleChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-3">
        {user && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-sidebar-foreground/60 font-body truncate max-w-[140px]">{user.email}</span>
            <button onClick={logout} className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors" title="Cerrar sesión">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
        <p className="text-xs text-sidebar-foreground/40 text-center font-body">
          © 2026 Sistema Contable Educativo
        </p>
      </div>
    </aside>
  );
};

export default AppSidebar;
