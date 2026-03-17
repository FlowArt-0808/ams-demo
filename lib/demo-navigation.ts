export type DemoRole =
  | "higher-ups"
  | "employee"
  | "inventory-head"
  | "hr"
  | "finance"
  | "it-admin"
  | "system-admin"

export type DemoWorkflow = "qr" | "distribution" | "issues" | "dispose" | "terminate"

const storageDetailRoles: DemoRole[] = [
  "inventory-head",
  "hr",
  "finance",
  "it-admin",
  "system-admin",
]

export type DemoMenuId =
  | "home"
  | "notifications"
  | "order"
  | "receive"
  | "storage"
  | "distribution"
  | "distribution-workflow"
  | "terminate-workflow"
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
  | "higher-ups-terminate"
  | "hr-termination-recovery"
  | "employee-return-notice"
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
    id: "notifications",
    label: "Notifications",
    description: "View employee alerts such as return requests and action-required messages.",
    href: "/employee/assets/IPH-2025-008?notice=return",
    section: "main",
    roles: ["employee", "system-admin"],
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
    id: "terminate-workflow",
    label: "Terminate Employee Workflow",
    description: "Role-based walkthrough for termination approval, retrieval notification, and return follow-up.",
    href: "/?workflow=terminate",
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
    label: "Step 1: HR Starts Census",
    href: "/hr/census",
    description:
      "HR starts the census and defines which assets need to be verified.",
    badge: "Step 1",
    roles: ["hr", "inventory-head", "system-admin"],
  },
  {
    id: "auditor-scan",
    workflow: "qr",
    ownerRole: "inventory-head",
    label: "Step 2: Auditor Scans QR",
    href: "/auditor/scan",
    description:
      "The auditor scans QR codes and records verification details.",
    badge: "Step 2",
    roles: ["inventory-head", "system-admin"],
  },
  {
    id: "employee-assets",
    workflow: "qr",
    ownerRole: "employee",
    label: "Step 3: Employee Opens Asset Page",
    href: "/employee/assets/MAC-2026-001",
    description:
      "The employee opens the QR-linked asset page and views the asset details.",
    badge: "Step 3",
    roles: ["employee", "system-admin"],
  },
  {
    id: "hr-distribution",
    workflow: "distribution",
    ownerRole: "hr",
    label: "Step 1: HR Reviews Requests",
    href: "/hr/distribution",
    description:
      "HR reviews requests and starts the asset assignment flow.",
    badge: "Step 1",
    roles: ["higher-ups", "hr", "it-admin", "system-admin"],
  },
  {
    id: "it-distribution",
    workflow: "distribution",
    ownerRole: "it-admin",
    label: "Step 2: IT Prepares Assets",
    href: "/hr/distribution",
    description:
      "IT reviews readiness, prepares devices, and tracks handoff progress.",
    badge: "Step 2",
    roles: ["it-admin", "system-admin"],
  },
  {
    id: "employee-request",
    workflow: "distribution",
    ownerRole: "employee",
    label: "Step 3: Employee Requests Asset",
    href: "/employee/request",
    description: "The employee submits an asset request with business justification.",
    badge: "Step 3",
    roles: ["employee", "system-admin"],
  },
  {
    id: "employee-acknowledge",
    workflow: "distribution",
    ownerRole: "employee",
    label: "Step 4: Employee Acknowledges Receipt",
    href: "/employee/acknowledge",
    description: "The employee confirms receipt of the assigned asset electronically.",
    badge: "Step 4",
    roles: ["employee", "system-admin"],
  },
  {
    id: "higher-ups-terminate",
    workflow: "terminate",
    ownerRole: "higher-ups",
    label: "Step 1: Higher-Up Submits Termination",
    href: "/hr/distribution?startTermination=1",
    description:
      "A higher-up starts the offboarding flow.",
    badge: "Step 1",
    roles: ["higher-ups", "system-admin"],
  },
  {
    id: "hr-termination-recovery",
    workflow: "terminate",
    ownerRole: "hr",
    label: "Step 2: Notifications Sent to HR and Employee",
    href: "/hr/distribution",
    description:
      "HR receives the retrieval notice and the employee receives the return notice at the same time.",
    badge: "Step 2",
    roles: ["hr", "system-admin"],
  },
  {
    id: "employee-return-notice",
    workflow: "terminate",
    ownerRole: "hr",
    label: "Step 3: Asset Retrieval Is Completed or Failed and Status Is Updated",
    href: "/hr/distribution",
    description:
      "After retrieval succeeds or fails, the asset status is updated based on the outcome.",
    badge: "Step 3",
    roles: ["hr", "system-admin"],
  },
  {
    id: "issue-queue",
    workflow: "issues",
    ownerRole: "hr",
    label: "Step 1: Report Missing or Broken Asset",
    href: "/?view=missing-broken",
    description:
      "HR or operations reports the missing or broken asset case.",
    badge: "Step 1",
    roles: ["hr", "inventory-head", "it-admin", "system-admin"],
  },
  {
    id: "it-issue-triage",
    workflow: "issues",
    ownerRole: "it-admin",
    label: "Step 2: IT Reviews and Triage",
    href: "/?view=missing-broken",
    description:
      "IT reviews the issue, decides next action, and moves the case forward.",
    badge: "Step 2",
    roles: ["it-admin", "system-admin"],
  },
  {
    id: "dispose-queue",
    workflow: "dispose",
    ownerRole: "finance",
    label: "Step 1: Finance Reviews Disposal",
    href: "/?view=dispose",
    description:
      "Finance reviews the disposal request and confirms the write-off path.",
    badge: "Step 1",
    roles: ["finance", "hr", "it-admin", "system-admin"],
  },
  {
    id: "it-dispose",
    workflow: "dispose",
    ownerRole: "it-admin",
    label: "Step 2: IT Wipes and Finalizes",
    href: "/?view=dispose",
    description:
      "IT uploads wipe evidence and completes the final disposal steps.",
    badge: "Step 2",
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
  if (pathname.startsWith("/employee/assets/") && searchParams.get("notice") === "return") {
    return "notifications"
  }

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

    if (searchParams.get("workflow") === "terminate") {
      return "terminate-workflow"
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

  if (pathname === "/hr/distribution") {
    const workflowMenu = demoMenus.find(
      (menu) => menu.id === "terminate-workflow",
    )

    if (workflowMenu && workflowMenu.roles.includes(role)) {
      return resolveMenuItem(workflowMenu, role).href
    }
  }

  return getResolvedMenuItem(role, "home").href
}
