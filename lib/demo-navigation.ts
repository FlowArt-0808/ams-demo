export type DemoRole =
  | "higher-ups"
  | "employee"
  | "inventory-head"
  | "hr"
  | "finance"
  | "it-admin"
  | "system-admin"

export type DemoWorkflow = "qr" | "distribution" | "issues" | "dispose"

const storageDetailRoles: DemoRole[] = [
  "inventory-head",
  "hr",
  "finance",
  "it-admin",
  "system-admin",
]

export type DemoMenuId =
  | "home"
  | "order"
  | "receive"
  | "storage"
  | "distribution"
  | "distribution-workflow"
  | "issues-workflow"
  | "dispose-workflow"
  | "missing-broken"
  | "dispose"
  | "settings"
  | "qr"

export type DemoMenuSection = "main" | "workflow"

export type DemoScreenId =
  | "hr-census"
  | "auditor-scan"
  | "employee-assets"
  | "hr-distribution"
  | "it-distribution"
  | "employee-request"
  | "employee-acknowledge"
  | "issue-queue"
  | "it-issue-triage"
  | "dispose-queue"
  | "it-dispose"

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
    description: "Uses employee-facing asset pages, requests, and acknowledgment screens.",
  },
  {
    id: "inventory-head",
    label: "Inventory Head",
    description: "Owns ordering, receiving, storage, and QR asset intake.",
  },
  {
    id: "hr",
    label: "HR",
    description: "Owns census, distribution coordination, and exception handling.",
  },
  {
    id: "finance",
    label: "Finance",
    description: "Focuses on receiving confirmation, write-offs, and finance checkpoints.",
  },
  {
    id: "it-admin",
    label: "IT Admin",
    description: "Handles repairs, device readiness, and data wipe certification.",
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
    description: "Browse the asset register, inspect ownership, and generate QR label links.",
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
    roles: ["hr", "it-admin", "system-admin"],
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
    roles: ["hr", "finance", "it-admin", "system-admin"],
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
  {
    id: "issues-workflow",
    label: "Missing/Broken Workflow",
    description: "Role-based walkthrough for incident triage and asset recovery work.",
    href: "/?workflow=issues",
    section: "workflow",
    roles: demoRoles.map((role) => role.id),
  },
  {
    id: "dispose-workflow",
    label: "Dispose Workflow",
    description: "Role-based walkthrough for write-off review and disposal execution.",
    href: "/?workflow=dispose",
    section: "workflow",
    roles: demoRoles.map((role) => role.id),
  },
]

export const demoScreens: DemoScreenConfig[] = [
  {
    id: "hr-census",
    workflow: "qr",
    ownerRole: "hr",
    label: "Census Management",
    href: "/hr/census",
    description:
      "Create census periods, scope the audit, and track verification progress.",
    badge: "Step 1",
    roles: ["hr", "inventory-head", "system-admin"],
  },
  {
    id: "auditor-scan",
    workflow: "qr",
    ownerRole: "inventory-head",
    label: "Audit Management",
    href: "/auditor/scan",
    description:
      "Walk through locations, scan QR codes, and record audit verification details.",
    badge: "Step 2",
    roles: ["inventory-head", "system-admin"],
  },
  {
    id: "employee-assets",
    workflow: "qr",
    ownerRole: "employee",
    label: "When Employee Scans QR Code",
    href: "/employee/assets/MAC-2026-001",
    description:
      "Open the employee-facing asset page that a QR code resolves to.",
    badge: "Step 3",
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
    roles: ["hr", "it-admin", "system-admin"],
  },
  {
    id: "it-distribution",
    workflow: "distribution",
    ownerRole: "it-admin",
    label: "IT Readiness",
    href: "/hr/distribution",
    description:
      "Review pending acknowledgments, coordinate device prep, and follow the outbound handoff.",
    badge: "IT",
    roles: ["it-admin", "system-admin"],
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
  {
    id: "issue-queue",
    workflow: "issues",
    ownerRole: "hr",
    label: "Missing/Broken Queue",
    href: "/?view=missing-broken",
    description:
      "Report incidents, monitor recovery work, and route damaged devices into technical review.",
    badge: "Step 1",
    roles: ["hr", "inventory-head", "it-admin", "system-admin"],
  },
  {
    id: "it-issue-triage",
    workflow: "issues",
    ownerRole: "it-admin",
    label: "Technical Triage",
    href: "/?view=missing-broken",
    description:
      "Assess damaged assets, decide repair versus retirement, and push technical cases forward.",
    badge: "Step 2",
    roles: ["it-admin", "system-admin"],
  },
  {
    id: "dispose-queue",
    workflow: "dispose",
    ownerRole: "finance",
    label: "Dispose Queue",
    href: "/?view=dispose",
    description:
      "Review write-offs, confirm wipe evidence, and complete the disposal archive flow.",
    badge: "Step 1",
    roles: ["finance", "hr", "it-admin", "system-admin"],
  },
  {
    id: "it-dispose",
    workflow: "dispose",
    ownerRole: "it-admin",
    label: "Wipe & Finalize",
    href: "/?view=dispose",
    description:
      "Upload the wipe certificate, complete the operational checklist, and finish the disposal.",
    badge: "IT",
    roles: ["it-admin", "system-admin"],
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
  if (pathname.startsWith("/storage/assets/")) {
    return "storage"
  }

  if (pathname.startsWith("/employee/assets/")) {
    return "qr"
  }

  if (pathname === "/") {
    if (searchParams.get("workflow") === "distribution") {
      return "distribution-workflow"
    }

    if (searchParams.get("workflow") === "issues") {
      return "issues-workflow"
    }

    if (searchParams.get("workflow") === "dispose") {
      return "dispose-workflow"
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

  if (pathname === "/auditor/scan" || pathname === "/hr/census") {
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

  if (pathname.startsWith("/storage/assets/")) {
    return storageDetailRoles.includes(role)
  }

  if (pathname.startsWith("/employee/assets/")) {
    return true
  }

  const screen = getScreenByPath(pathname)
  if (!screen) {
    return true
  }

  return screen.roles.includes(role)
}

export function getFallbackHref(role: DemoRole, pathname: string): string {
  if (pathname.startsWith("/storage/assets/")) {
    const storageMenu = demoMenus.find((menu) => menu.id === "storage")

    if (storageMenu && storageMenu.roles.includes(role)) {
      return resolveMenuItem(storageMenu, role).href
    }
  }

  if (pathname === "/auditor/scan" || pathname === "/hr/census") {
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
