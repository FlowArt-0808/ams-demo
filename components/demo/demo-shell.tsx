"use client"

import Link from "next/link"
import { useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  AlertTriangle,
  Box,
  ChevronsUpDown,
  House,
  Package,
  QrCode,
  Settings,
  ShieldUser,
  ShoppingCart,
  Trash2,
  Truck,
  Warehouse,
} from "lucide-react"

import { useDemoRole } from "@/components/demo/demo-role-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  canAccessPath,
  demoRoles,
  getActiveMenuId,
  getFallbackHref,
  getRoleOption,
  getVisibleMenuItems,
  type DemoMenuId,
  type DemoRole,
} from "@/lib/demo-navigation"

const menuIcons: Record<DemoMenuId, typeof House> = {
  home: House,
  order: ShoppingCart,
  receive: Truck,
  storage: Warehouse,
  distribution: Package,
  "distribution-workflow": Package,
  "missing-broken": AlertTriangle,
  dispose: Trash2,
  settings: Settings,
  qr: QrCode,
}

const workflowRoleText: Partial<Record<DemoMenuId, string>> = {
  qr: "Roles: Inventory Head, Employee",
  "distribution-workflow": "Roles: HR, Employee",
}

export function DemoShell({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { role, setRole } = useDemoRole()

  const activeMenuId = getActiveMenuId(pathname, searchParams)
  const activeRole = getRoleOption(role)
  const workflowMenuItems = getVisibleMenuItems(role, "workflow")
  const mainMenuItems = getVisibleMenuItems(role, "main")

  useEffect(() => {
    if (pathname !== "/" && !canAccessPath(role, pathname)) {
      const fallbackHref = getFallbackHref(role, pathname)

      if (fallbackHref !== pathname) {
        router.replace(fallbackHref)
      }
    }
  }, [pathname, role, router])

  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader className="gap-4 border-b border-sidebar-border p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-sidebar-accent"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
              <Box className="h-5 w-5" />
            </div>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-semibold">AMS Demo</p>
              <p className="truncate text-xs text-sidebar-foreground/70">
                Clickable UI only
              </p>
            </div>
          </Link>

          <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/40 px-3 py-2 group-data-[collapsible=icon]:hidden">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-sidebar-foreground/60">
              Current Role
            </p>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="secondary" className="rounded-full px-2.5 py-0.5">
                {activeRole.label}
              </Badge>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workflow</SidebarGroupLabel>
            <SidebarGroupContent className="space-y-3">
              <div className="mx-2 rounded-xl border border-sidebar-primary/20 bg-sidebar-primary/10 px-3 py-3 group-data-[collapsible=icon]:hidden">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sidebar-primary">
                  Workflow Pinned Here
                </p>
                <p className="mt-1 text-xs leading-5 text-sidebar-foreground/75">
                  This section stays near the top. Open a workflow tab first,
                  then choose any step inside it to switch roles automatically.
                </p>
              </div>
              <SidebarMenu>
                {workflowMenuItems.map((menu) => {
                  const Icon = menuIcons[menu.id]

                  return (
                    <SidebarMenuItem key={menu.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={activeMenuId === menu.id}
                        tooltip={`${menu.label} | ${workflowRoleText[menu.id] ?? "Workflow"}`}
                        className="h-auto items-start px-2 py-2"
                      >
                        <Link href={menu.href}>
                          <Icon className="mt-0.5 h-4 w-4" />
                          <div className="flex min-w-0 flex-1 flex-col items-start">
                            <span>{menu.label}</span>
                            <span className="text-xs text-sidebar-foreground/60">
                              {workflowRoleText[menu.id]}
                            </span>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainMenuItems.map((menu) => {
                  const Icon = menuIcons[menu.id]

                  return (
                    <SidebarMenuItem key={menu.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={activeMenuId === menu.id}
                        tooltip={menu.label}
                      >
                        <Link href={menu.href}>
                          <Icon className="h-4 w-4" />
                          <span>{menu.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-auto w-full justify-between gap-3 border-sidebar-border bg-sidebar-accent/40 px-3 py-2 hover:bg-sidebar-accent group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background text-foreground">
                    <ShieldUser className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 text-left group-data-[collapsible=icon]:hidden">
                    <p className="truncate text-sm font-medium">
                      {activeRole.label}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      Switch role
                    </p>
                  </div>
                </div>
                <ChevronsUpDown className="h-4 w-4 shrink-0 group-data-[collapsible=icon]:hidden" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="start"
              className="w-72"
            >
              <DropdownMenuLabel>Demo Role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={role}
                onValueChange={(nextRole) => setRole(nextRole as DemoRole)}
              >
                {demoRoles.map((roleOption) => (
                  <DropdownMenuRadioItem
                    key={roleOption.id}
                    value={roleOption.id}
                    className="items-start"
                  >
                    <div className="space-y-0.5">
                      <div className="font-medium">{roleOption.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {roleOption.description}
                      </div>
                    </div>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset className="min-h-svh">
        <div className="fixed right-4 bottom-4 z-40 md:hidden">
          <SidebarTrigger className="h-11 w-11 rounded-full border bg-background shadow-lg" />
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
