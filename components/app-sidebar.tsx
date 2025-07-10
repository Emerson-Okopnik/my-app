import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Home, LineChart, Package, ShoppingCart, Users, Settings, LifeBuoy } from "lucide-react"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="font-semibold text-lg">Vendas Rudnik</h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-grow">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton href="#" isActive>
              <Home className="h-4 w-4" />
              Dashboard
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="#">
              <ShoppingCart className="h-4 w-4" />
              Vendas
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="#">
              <Package className="h-4 w-4" />
              Propostas
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="#">
              <Users className="h-4 w-4" />
              Clientes
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="#">
              <LineChart className="h-4 w-4" />
              Relatórios
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton href="#">
              <Settings className="h-4 w-4" />
              Configurações
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="#">
              <LifeBuoy className="h-4 w-4" />
              Suporte
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
