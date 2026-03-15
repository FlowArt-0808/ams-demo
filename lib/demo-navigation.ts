export type DemoRole =
  | "higher-ups"
  | "employee"
  | "inventory-head"
  | "hr"
  | "finance"
  | "it-admin"
  | "system-admin"

export type DemoWorkflow = "qr" | "distribution"

export type DemoMenuId =
  | "home"
  | "order"
  | "receive"
  | "storage"
  | "distribution"
  | "distribution-workflow"
  | "missing-broken"
  | "dispose"
  | "settings"
  | "qr"

export type DemoMenuSection = "main" | "workflow"

export type DemoScreenId =
  | "hr-census"
  | "auditor-scan"
  | "employee-verify"
  | "hr-distribution"
  | "employee-request"
  | "employee-acknowledge"

export interface DemoRoleOption {
  id: DemoRole
  label: string
  description: string
}

export interface DemoMenuConfig {
  id: DemoMenuId
  label: string
  description: string
  href: string
  section: DemoMenuSection
  roles: DemoRole[]
  roleLabels?: Partial<Record<DemoRole, string>>
  roleDescriptions?: Partial<Record<DemoRole, string>>
  roleHrefs?: Partial<Record<DemoRole, string>>
}

export interface ResolvedDemoMenuItem extends DemoMenuConfig {
  label: string
  description: string
  href: string
}

export interface DemoScreenConfig {
  id: DemoScreenId
  workflow: DemoWorkflow
  ownerRole: DemoRole
  label: string
  href: string
  description: string
  badge: string
  roles: DemoRole[]
}

export const demoRoles: DemoRoleOption[] = [
  {
    id: "higher-ups",
    label: "Higher-ups",
    description: "Approves purchase orders created by the inventory team.",
  },
  {
    id: "employee",
    label: "Employee",
    description: "Uses employee-facing asset, acknowledgment, and QR verification screens.",
  },
  {
    id: "inventory-head",
    label: "Inventory Head",
    description: "Owns ordering, receiving, storage, and QR asset intake.",
  },
  {
    id: "hr",
    label: "HR",
    description: "Works with storage visibility and distribution to employees.",
  },
  {
    id: "finance",
    label: "Finance",
    description: "Focuses on receiving confirmation and finance-side checkpoints.",
  },
  {
    id: "it-admin",
    label: "IT Admin",
    description: "Reserved for later role definition in this demo.",
  },
  {
    id: "system-admin",
    label: "System Admin",
    description: "Can see every menu and every implemented screen.",
  },
]

export const demoMenus: DemoMenuConfig[] = [
  {
    id: "home",
    label: "Dashboard",
    description: "Overview of your asset management system.",
    href: "/",
    section: "main",
    roles: demoRoles.map((role) => role.id),
    roleLabels: {
      employee: "Assets",
    },
    roleDescriptions: {
      employee:
        "View the employee-facing asset touchpoints available in this demo.",
    },
  },
  {
    id: "order",
    label: "Order",
    description: "Create, approve, and confirm purchase orders.",
    href: "/?view=order",
    section: "main",
    roles: ["higher-ups", "inventory-head", "system-admin"],
  },
  {
    id: "receive",
    label: "Receive",
    description: "Confirm deliveries and move incoming assets toward storage.",
    href: "/?view=receive",
    section: "main",
    roles: ["inventory-head", "finance", "system-admin"],
  },
  {
    id: "storage",
    label: "Storage",
    description: "View warehouses and the assets currently inside them.",
    href: "/?view=storage",
    section: "main",
    roles: ["inventory-head", "hr", "system-admin"],
  },
  {
    id: "distribution",
    label: "Distribution",
    description:
      "Assign assets, handle employee requests, and manage acknowledgment flow.",
    href: "/hr/distribution",
    section: "main",
    roles: ["hr", "system-admin"],
  },
  {
    id: "missing-broken",
    label: "Missing/Broken Asset",
    description: "Track damaged or missing asset cases.",
    href: "/?view=missing-broken",
    section: "main",
    roles: ["inventory-head", "hr", "it-admin", "system-admin"],
  },
  {
    id: "dispose",
    label: "Dispose",
    description: "Manage asset retirement and disposal decisions.",
    href: "/?view=dispose",
    section: "main",
    roles: ["hr", "finance", "system-admin"],
  },
  {
    id: "settings",
    label: "Settings",
    description: "Demo-level settings and placeholder admin controls.",
    href: "/?view=settings",
    section: "main",
    roles: demoRoles.map((role) => role.id),
  },
  {
    id: "qr",
    label: "QR Workflow",
    description: "QR asset tagging and verification touchpoints for this demo.",
    href: "/?workflow=qr",
    section: "workflow",
    roles: demoRoles.map((role) => role.id),
  },
  {
    id: "distribution-workflow",
    label: "Distribution Workflow",
    description:
      "Role-based walkthrough for requests, assignment, and acknowledgment.",
    href: "/?workflow=distribution",
    section: "workflow",
    roles: demoRoles.map((role) => role.id),
  },
]

export const demoScreens: DemoScreenConfig[] = [
  {
    id: "hr-census",
    workflow: "qr",
    ownerRole: "inventory-head",
    label: "Census Management",
    href: "/hr/census",
    description:
      "Create census periods, scope the audit, and track verification progress.",
    badge: "Step 1",
    roles: ["inventory-head", "system-admin"],
  },
  {
    id: "auditor-scan",
    workflow: "qr",
    ownerRole: "inventory-head",
    label: "Auditor Scanner",
    href: "/auditor/scan",
    description:
      "Walk through locations, scan QR codes, and record verification details.",
    badge: "Step 2",
    roles: ["inventory-head", "system-admin"],
  },
  {
    id: "employee-verify",
    workflow: "qr",
    ownerRole: "employee",
    label: "QR Scanner",
    href: "/employee/verify",
    description:
      "Employees confirm possession of their assigned assets from a QR flow.",
    badge: "Employee",
    roles: ["employee", "system-admin"],
  },
  {
    id: "hr-distribution",
    workflow: "distribution",
    ownerRole: "hr",
    label: "Distribution Dashboard",
    href: "/hr/distribution",
    description:
      "Assign assets, review requests, and track outbound assignment activity.",
    badge: "HR",
    roles: ["hr", "system-admin"],
  },
  {
    id: "employee-request",
    workflow: "distribution",
    ownerRole: "employee",
    label: "Asset Request",
    href: "/employee/request",
    description: "Submit a new asset request with a business justification.",
    badge: "Employee",
    roles: ["employee", "system-admin"],
  },
  {
    id: "employee-acknowledge",
    workflow: "distribution",
    ownerRole: "employee",
    label: "Acknowledgment",
    href: "/employee/acknowledge",
    description: "Acknowledge receipt of an assigned asset electronically.",
    badge: "Employee",
    roles: ["employee", "system-admin"],
  },
]

export function isDemoRole(value: string | null | undefined): value is DemoRole {
  return demoRoles.some((role) => role.id === value)
}

export function isDemoMenuId(
  value: string | null | undefined,
): value is DemoMenuId {
  return demoMenus.some((item) => item.id === value)
}

export function getRoleOption(role: DemoRole): DemoRoleOption {
  return demoRoles.find((option) => option.id === role) ?? demoRoles[0]
}

export function getMenuConfig(menuId: DemoMenuId): DemoMenuConfig {
  return demoMenus.find((menu) => menu.id === menuId) ?? demoMenus[0]
}

export function resolveMenuItem(
  menu: DemoMenuConfig,
  role: DemoRole,
): ResolvedDemoMenuItem {
  return {
    ...menu,
    label: menu.roleLabels?.[role] ?? menu.label,
    description: menu.roleDescriptions?.[role] ?? menu.description,
    href: menu.roleHrefs?.[role] ?? menu.href,
  }
}

export function getVisibleMenuItems(
  role: DemoRole,
  section: DemoMenuSection,
): ResolvedDemoMenuItem[] {
  return demoMenus
    .filter((menu) => menu.section === section && menu.roles.includes(role))
    .map((menu) => resolveMenuItem(menu, role))
}

export function getResolvedMenuItem(
  role: DemoRole,
  menuId: DemoMenuId,
): ResolvedDemoMenuItem {
  return resolveMenuItem(getMenuConfig(menuId), role)
}

export function getScreenByPath(pathname: string): DemoScreenConfig | undefined {
  return demoScreens.find((screen) => screen.href === pathname)
}

export function getScreensForRole(role: DemoRole): DemoScreenConfig[] {
  return demoScreens.filter((screen) => screen.roles.includes(role))
}

export function getScreensForWorkflow(
  role: DemoRole,
  workflow: DemoWorkflow,
): DemoScreenConfig[] {
  return demoScreens.filter(
    (screen) => screen.workflow === workflow && screen.roles.includes(role),
  )
}

export function getWorkflowSteps(workflow: DemoWorkflow): DemoScreenConfig[] {
  return demoScreens.filter((screen) => screen.workflow === workflow)
}

export function getActiveMenuId(
  pathname: string,
  searchParams: URLSearchParams,
): DemoMenuId {
  if (pathname === "/") {
    if (searchParams.get("workflow") === "distribution") {
      return "distribution-workflow"
    }

    if (searchParams.get("workflow") === "qr") {
      return "qr"
    }

    const view = searchParams.get("view")

    if (isDemoMenuId(view)) {
      return view
    }

    return "home"
  }

  if (pathname === "/hr/distribution") {
    return "distribution"
  }

  if (pathname === "/employee/verify" || pathname === "/auditor/scan" || pathname === "/hr/census") {
    return "qr"
  }

  if (
    pathname === "/employee/request" ||
    pathname === "/employee/acknowledge"
  ) {
    return "distribution-workflow"
  }

  return "home"
}

export function canAccessPath(role: DemoRole, pathname: string): boolean {
  if (pathname === "/") {
    return true
  }

  const screen = getScreenByPath(pathname)
  if (!screen) {
    return true
  }

  return screen.roles.includes(role)
}

export function getFallbackHref(role: DemoRole, pathname: string): string {
  if (pathname === "/employee/verify" || pathname === "/auditor/scan" || pathname === "/hr/census") {
    const workflowMenu = demoMenus.find((menu) => menu.id === "qr")

    if (workflowMenu && workflowMenu.roles.includes(role)) {
      return resolveMenuItem(workflowMenu, role).href
    }
  }

  if (
    pathname === "/hr/distribution" ||
    pathname === "/employee/request" ||
    pathname === "/employee/acknowledge"
  ) {
    const workflowMenu = demoMenus.find(
      (menu) => menu.id === "distribution-workflow",
    )

    if (workflowMenu && workflowMenu.roles.includes(role)) {
      return resolveMenuItem(workflowMenu, role).href
    }
  }

  return getResolvedMenuItem(role, "home").href
}
