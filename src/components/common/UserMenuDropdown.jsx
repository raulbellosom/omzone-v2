import { useNavigate } from "react-router-dom";
import {
  User,
  CalendarCheck,
  ShoppingBag,
  UserPen,
  LayoutDashboard,
  UserCog,
  Users,
  Globe,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { displayRoleName } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/common/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/common/dropdown-menu";

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function UserMenuDropdown() {
  const { user, labels, logout, isAdmin, isClient } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const displayName = user.name || user.email || "Usuario";
  const roleName = displayRoleName(labels);
  const initials = getInitials(user.name);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const go = (route) => () => navigate(route);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-full px-1 py-1 hover:bg-warm-gray/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 cursor-pointer"
          aria-label="Menú de usuario"
        >
          <span className="hidden sm:block text-sm font-medium text-charcoal truncate max-w-32">
            {user.name?.split(" ")[0] || "User"}
          </span>
          <Avatar className="h-8 w-8">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={displayName} />}
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" sideOffset={8}>
        {/* Header */}
        <div className="px-3 py-3">
          <p className="text-sm font-semibold text-charcoal leading-tight">{displayName}</p>
          <p className="text-xs text-charcoal-muted mt-0.5 truncate">{user.email}</p>
        </div>

        <DropdownMenuSeparator />

        {/* Client section */}
        {isClient && (
          <>
            <DropdownMenuLabel>Cliente</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={go(ROUTES.PORTAL)}>
                <User className="h-4 w-4 text-charcoal-muted" />
                Mi cuenta
              </DropdownMenuItem>
              <DropdownMenuItem onClick={go(ROUTES.PORTAL_TICKETS)}>
                <CalendarCheck className="h-4 w-4 text-charcoal-muted" />
                Mis reservaciones
              </DropdownMenuItem>
              <DropdownMenuItem onClick={go(ROUTES.PORTAL_ORDERS)}>
                <ShoppingBag className="h-4 w-4 text-charcoal-muted" />
                Mis compras
              </DropdownMenuItem>
              <DropdownMenuItem onClick={go(ROUTES.PORTAL_PROFILE)}>
                <UserPen className="h-4 w-4 text-charcoal-muted" />
                Mi perfil
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Admin section */}
        {isAdmin && (
          <>
            <DropdownMenuLabel>Administración</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={go(ROUTES.ADMIN)}>
                <LayoutDashboard className="h-4 w-4 text-charcoal-muted" />
                Panel de administración
              </DropdownMenuItem>
              <DropdownMenuItem onClick={go(ROUTES.ADMIN_SETTINGS)}>
                <UserCog className="h-4 w-4 text-charcoal-muted" />
                Mi cuenta admin
              </DropdownMenuItem>
              <DropdownMenuItem onClick={go(ROUTES.ADMIN_USERS)}>
                <Users className="h-4 w-4 text-charcoal-muted" />
                Gestión de usuarios
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Navigation */}
        <DropdownMenuItem onClick={go(ROUTES.HOME)}>
          <Globe className="h-4 w-4 text-charcoal-muted" />
          Ir a la landing
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
