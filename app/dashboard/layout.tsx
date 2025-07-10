import type React from "react"
import { cookies } from "next/headers"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Suspense } from "react"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex min-h-screen w-full bg-muted/40">
        <AppSidebar />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 w-full">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <SidebarTrigger className="sm:hidden" />
            <div className="relative ml-auto flex-1 md:grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Suspense fallback={<div>Loading...</div>}>
                <Input
                  type="search"
                  placeholder="Buscar..."
                  className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                />
              </Suspense>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="overflow-hidden rounded-full bg-transparent">
                    <Avatar>
                      <AvatarImage src="/placeholder-user.jpg" alt="Avatar" />
                      <AvatarFallback>M</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Configurações</DropdownMenuItem>
                  <DropdownMenuItem>Suporte</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Sair</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Suspense>
          </header>
          <main className="flex-1 p-4 sm:px-6 sm:py-0">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
