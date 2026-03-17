// Mock data for the QR scanning, storage, and distribution workflow demo

export type AssetCategory = "Laptop" | "Monitor" | "Phone" | "Tablet" | "Other"
export type AssetCondition = "Good" | "Fair" | "Damaged"
export type AssetStatus =
  | "AVAILABLE"
  | "ASSIGNED"
  | "PENDING_RETRIEVAL"
  | "OVERDUE_RETRIEVAL"
  | "IN_REPAIR"
  | "PENDING_DISPOSAL"

export interface Employee {
  id: string
  name: string
  email: string
  department: string
  title: string
  branch: string
  phone: string
}

export interface Asset {
  id: string
  name: string
  category: AssetCategory
  assignedTo: string
  location: string
  condition: AssetCondition
  status: AssetStatus
  verified: boolean
  verifiedAt?: string
  serialNumber: string
  purchaseDate: string
  purchaseCost: number
  currentBookValue: number
  description: string
}

export interface AssetHistoryEvent {
  id: string
  date: string
  title: string
  description: string
  condition: AssetCondition
  ownerLabel: string
  location: string
}

export interface Census {
  id: string
  name: string
  scope: "Full Company" | "Department" | "Asset Category"
  scopeValue?: string
  startDate: string
  deadline: string
  status: "Draft" | "Active" | "Completed" | "Overdue"
  totalAssets: number
  verifiedAssets: number
  createdAt: string
}

export interface CensusTask {
  id: string
  censusId: string
  assetId: string
  employeeId: string
  status: "Pending" | "Verified" | "Discrepancy"
  verifiedAt?: string
  verifiedBy?: string
  condition?: AssetCondition
  locationConfirmed?: string
}

export const assetStatusLabels: Record<AssetStatus, string> = {
  AVAILABLE: "Available",
  ASSIGNED: "Assigned",
  PENDING_RETRIEVAL: "Pending Retrieval",
  OVERDUE_RETRIEVAL: "Overdue Retrieval",
  IN_REPAIR: "In Repair",
  PENDING_DISPOSAL: "Pending Disposal",
}

export const assetStatuses: AssetStatus[] = [
  "AVAILABLE",
  "ASSIGNED",
  "PENDING_RETRIEVAL",
  "OVERDUE_RETRIEVAL",
  "IN_REPAIR",
  "PENDING_DISPOSAL",
]

const assetHistoryById: Record<string, AssetHistoryEvent[]> = {
  "MAC-2026-001": [
    {
      id: "MAC-2026-001-ordered",
      date: "2025-12-22",
      title: "Ordered",
      description: "Approved as part of the engineering workstation refresh purchase order.",
      condition: "Good",
      ownerLabel: "Inventory Team",
      location: "Vendor | Seattle",
    },
    {
      id: "MAC-2026-001-storage-arrival",
      date: "2026-01-04",
      title: "Arrived at storage",
      description: "Received, tagged, and placed in Warehouse A staging for intake checks.",
      condition: "Good",
      ownerLabel: "Storage",
      location: "Warehouse A",
    },
    {
      id: "MAC-2026-001-previous-owner",
      date: "2026-01-08",
      title: "Assigned to previous owner",
      description: "Provisioned for Daniel Reed during onboarding and handed over from storage.",
      condition: "Good",
      ownerLabel: "Daniel Reed | Product Engineering",
      location: "HQ - Floor 2",
    },
    {
      id: "MAC-2026-001-returned",
      date: "2026-01-11",
      title: "Returned to storage",
      description: "Recovered after team reshuffle and checked back into the storage queue.",
      condition: "Good",
      ownerLabel: "Storage",
      location: "Warehouse A",
    },
    {
      id: "MAC-2026-001-current-owner",
      date: "2026-01-12",
      title: "Assigned to current owner",
      description: "Issued to Sarah Chen as the primary engineering workstation.",
      condition: "Good",
      ownerLabel: "Sarah Chen | Engineering",
      location: "HQ - Floor 3",
    },
  ],
  "MAC-2026-002": [
    {
      id: "MAC-2026-002-ordered",
      date: "2025-11-28",
      title: "Ordered",
      description: "Added to the creative team hardware purchase batch.",
      condition: "Good",
      ownerLabel: "Inventory Team",
      location: "Vendor | Portland",
    },
    {
      id: "MAC-2026-002-storage-arrival",
      date: "2025-12-09",
      title: "Arrived at storage",
      description: "Received and staged for creative team imaging and accessory bundling.",
      condition: "Good",
      ownerLabel: "Storage",
      location: "Warehouse A",
    },
    {
      id: "MAC-2026-002-current-owner",
      date: "2025-12-15",
      title: "Assigned to current owner",
      description: "Assigned to Michael Torres for campaign production and travel work.",
      condition: "Good",
      ownerLabel: "Michael Torres | Marketing",
      location: "HQ - Floor 2",
    },
  ],
  "IPH-2025-008": [
    {
      id: "IPH-2025-008-ordered",
      date: "2025-06-18",
      title: "Ordered",
      description: "Ordered with the finance mobile device refresh request.",
      condition: "Good",
      ownerLabel: "Inventory Team",
      location: "Vendor | San Jose",
    },
    {
      id: "IPH-2025-008-storage-arrival",
      date: "2025-07-02",
      title: "Arrived at storage",
      description: "Checked into secure mobile storage for enrollment and compliance setup.",
      condition: "Good",
      ownerLabel: "Storage",
      location: "Secure Cage - Warehouse B",
    },
    {
      id: "IPH-2025-008-previous-owner",
      date: "2025-07-05",
      title: "Assigned to previous owner",
      description: "Initially issued to the interim controller during quarter-close coverage.",
      condition: "Good",
      ownerLabel: "Nina Patel | Finance",
      location: "HQ - Floor 1",
    },
    {
      id: "IPH-2025-008-reassigned",
      date: "2025-09-01",
      title: "Reassigned to current owner",
      description: "Transferred to Emily Watson after the interim assignment ended.",
      condition: "Good",
      ownerLabel: "Emily Watson | Finance",
      location: "HQ - Floor 1",
    },
  ],
}

// Mock Employees
export const mockEmployees: Employee[] = [
  {
    id: "EMP-001",
    name: "Sarah Chen",
    email: "sarah.chen@company.com",
    department: "Engineering",
    title: "Senior Product Engineer",
    branch: "HQ - Floor 3",
    phone: "+1 (206) 555-0101",
  },
  {
    id: "EMP-002",
    name: "Michael Torres",
    email: "michael.torres@company.com",
    department: "Marketing",
    title: "Brand Designer",
    branch: "HQ - Floor 2",
    phone: "+1 (206) 555-0102",
  },
  {
    id: "EMP-003",
    name: "Emily Watson",
    email: "emily.watson@company.com",
    department: "Finance",
    title: "Finance Analyst",
    branch: "HQ - Floor 1",
    phone: "+1 (206) 555-0103",
  },
  {
    id: "EMP-004",
    name: "James Kim",
    email: "james.kim@company.com",
    department: "Engineering",
    title: "Engineering Manager",
    branch: "Remote - Seattle",
    phone: "+1 (206) 555-0104",
  },
  {
    id: "EMP-005",
    name: "Lisa Anderson",
    email: "lisa.anderson@company.com",
    department: "HR",
    title: "HR Business Partner",
    branch: "HQ - Floor 4",
    phone: "+1 (206) 555-0105",
  },
]

// Mock Assets already assigned or in active workflows
export const mockAssets: Asset[] = [
  {
    id: "MAC-2026-001",
    name: 'MacBook Pro 16"',
    category: "Laptop",
    assignedTo: "EMP-001",
    location: "HQ - Floor 3",
    condition: "Good",
    status: "ASSIGNED",
    verified: false,
    serialNumber: "C02X91ABMD6T",
    purchaseDate: "2026-01-12",
    purchaseCost: 3200,
    currentBookValue: 2940,
    description: "Primary engineering workstation with elevated memory and storage for build pipelines.",
  },
  {
    id: "MAC-2026-002",
    name: "MacBook Air M3",
    category: "Laptop",
    assignedTo: "EMP-002",
    location: "HQ - Floor 2",
    condition: "Good",
    status: "ASSIGNED",
    verified: false,
    serialNumber: "C02X91AC8L0Q",
    purchaseDate: "2025-12-15",
    purchaseCost: 1850,
    currentBookValue: 1680,
    description: "Marketing content laptop assigned for campaign design and travel.",
  },
  {
    id: "DEL-2025-015",
    name: 'Dell UltraSharp 27"',
    category: "Monitor",
    assignedTo: "EMP-001",
    location: "HQ - Floor 3",
    condition: "Fair",
    status: "ASSIGNED",
    verified: false,
    serialNumber: "CN0M27AQ3W2",
    purchaseDate: "2025-08-19",
    purchaseCost: 640,
    currentBookValue: 510,
    description: "External monitor paired with Sarah's workstation for multi-window engineering work.",
  },
  {
    id: "IPH-2025-008",
    name: "iPhone 15 Pro",
    category: "Phone",
    assignedTo: "EMP-003",
    location: "HQ - Floor 1",
    condition: "Good",
    status: "PENDING_RETRIEVAL",
    verified: true,
    verifiedAt: "2026-03-10T14:30:00Z",
    serialNumber: "FK2ZJ91QM8Y4",
    purchaseDate: "2025-07-09",
    purchaseCost: 1299,
    currentBookValue: 980,
    description: "Corporate phone with finance MFA and approval apps installed.",
  },
  {
    id: "MAC-2025-022",
    name: 'MacBook Pro 14"',
    category: "Laptop",
    assignedTo: "EMP-004",
    location: "Remote - Seattle",
    condition: "Good",
    status: "ASSIGNED",
    verified: false,
    serialNumber: "C02X90EF4GV2",
    purchaseDate: "2025-05-02",
    purchaseCost: 2640,
    currentBookValue: 2130,
    description: "Remote engineering leadership machine with device management and VPN preloaded.",
  },
  {
    id: "IPD-2024-003",
    name: 'iPad Pro 12.9"',
    category: "Tablet",
    assignedTo: "EMP-005",
    location: "HQ - Floor 4",
    condition: "Good",
    status: "ASSIGNED",
    verified: false,
    serialNumber: "DMPZH10Q4N7M",
    purchaseDate: "2024-11-11",
    purchaseCost: 1499,
    currentBookValue: 940,
    description: "Tablet used for HR onboarding packets, offboarding checklists, and floor walk-throughs.",
  },
  {
    id: "DEL-2024-019",
    name: 'Dell Monitor 24"',
    category: "Monitor",
    assignedTo: "EMP-002",
    location: "HQ - Floor 2",
    condition: "Damaged",
    status: "IN_REPAIR",
    verified: false,
    serialNumber: "CN0M24R73D1",
    purchaseDate: "2024-09-03",
    purchaseCost: 390,
    currentBookValue: 190,
    description: "Secondary display currently flagged for panel replacement after transport damage.",
  },
  {
    id: "LEN-2025-007",
    name: "Lenovo ThinkPad X1",
    category: "Laptop",
    assignedTo: "EMP-003",
    location: "HQ - Floor 1",
    condition: "Good",
    status: "ASSIGNED",
    verified: false,
    serialNumber: "PF4X12KM08JQ",
    purchaseDate: "2025-04-18",
    purchaseCost: 2140,
    currentBookValue: 1660,
    description: "Finance fallback laptop kept assigned for close-week coverage and travel.",
  },
]

// Mock Censuses
export const mockCensuses: Census[] = [
  {
    id: "CEN-2026-001",
    name: "Q1 2026 Full Asset Audit",
    scope: "Full Company",
    startDate: "2026-03-01",
    deadline: "2026-03-31",
    status: "Active",
    totalAssets: 8,
    verifiedAssets: 1,
    createdAt: "2026-02-28T10:00:00Z",
  },
  {
    id: "CEN-2025-004",
    name: "Q4 2025 Laptop Census",
    scope: "Asset Category",
    scopeValue: "Laptop",
    startDate: "2025-12-01",
    deadline: "2025-12-15",
    status: "Completed",
    totalAssets: 45,
    verifiedAssets: 45,
    createdAt: "2025-11-28T09:00:00Z",
  },
  {
    id: "CEN-2025-003",
    name: "Engineering Department Audit",
    scope: "Department",
    scopeValue: "Engineering",
    startDate: "2025-10-01",
    deadline: "2025-10-15",
    status: "Completed",
    totalAssets: 28,
    verifiedAssets: 28,
    createdAt: "2025-09-28T11:00:00Z",
  },
]

// Mock Census Tasks for the active census
export const mockCensusTasks: CensusTask[] = mockAssets.map((asset) => ({
  id: `TASK-${asset.id}`,
  censusId: "CEN-2026-001",
  assetId: asset.id,
  employeeId: asset.assignedTo,
  status: asset.verified ? "Verified" : "Pending",
  verifiedAt: asset.verifiedAt,
  condition: asset.verified ? asset.condition : undefined,
  locationConfirmed: asset.verified ? asset.location : undefined,
}))

// Locations for dropdown
export const locations = [
  "HQ - Floor 1",
  "HQ - Floor 2",
  "HQ - Floor 3",
  "HQ - Floor 4",
  "Remote - Seattle",
  "Remote - New York",
  "Remote - Austin",
  "Warehouse A",
  "Warehouse B",
  "Secure Cage - Warehouse B",
]

// Departments for dropdown
export const departments = [
  "Engineering",
  "Marketing",
  "Finance",
  "HR",
  "Operations",
  "Sales",
  "Storage",
]

// Asset categories
export const assetCategories: AssetCategory[] = [
  "Laptop",
  "Monitor",
  "Phone",
  "Tablet",
  "Other",
]

// =====================
// DISTRIBUTION WORKFLOW
// =====================

export interface AssetRequest {
  id: string
  employeeId: string
  assetCategory: AssetCategory
  justification: string
  status: "Pending" | "Approved" | "Rejected" | "Fulfilled"
  requestedAt: string
  reviewedAt?: string
  reviewedBy?: string
  rejectionReason?: string
}

export interface AssetAssignment {
  id: string
  assetId: string
  employeeId: string
  assignedBy: string
  status: "Pending Acknowledgment" | "Acknowledged" | "Expired"
  assignedAt: string
  acknowledgedAt?: string
  signedName?: string
  expiresAt: string
}

// Unassigned assets available for distribution
export const unassignedAssets: Asset[] = [
  {
    id: "MAC-2026-010",
    name: 'MacBook Pro 14" M3',
    category: "Laptop",
    assignedTo: "",
    location: "Warehouse A",
    condition: "Good",
    status: "AVAILABLE",
    verified: true,
    serialNumber: "C02XZ0Q71NA1",
    purchaseDate: "2026-03-01",
    purchaseCost: 2499,
    currentBookValue: 2499,
    description: "Freshly received laptop staged for HR distribution.",
  },
  {
    id: "MAC-2026-011",
    name: 'MacBook Air 15" M3',
    category: "Laptop",
    assignedTo: "",
    location: "Warehouse A",
    condition: "Good",
    status: "AVAILABLE",
    verified: true,
    serialNumber: "C02XZ0Q81NA2",
    purchaseDate: "2026-03-01",
    purchaseCost: 1899,
    currentBookValue: 1899,
    description: "Inventory stock reserved for new hires and contractor swaps.",
  },
  {
    id: "DEL-2026-001",
    name: 'Dell UltraSharp 32"',
    category: "Monitor",
    assignedTo: "",
    location: "Warehouse A",
    condition: "Good",
    status: "AVAILABLE",
    verified: true,
    serialNumber: "CN0D32M8Q13P",
    purchaseDate: "2026-02-24",
    purchaseCost: 780,
    currentBookValue: 780,
    description: "Large-format monitor stored for leadership desk setups.",
  },
  {
    id: "DEL-2026-002",
    name: 'Dell UltraSharp 27" 4K',
    category: "Monitor",
    assignedTo: "",
    location: "Warehouse A",
    condition: "Good",
    status: "AVAILABLE",
    verified: true,
    serialNumber: "CN0D27K9S44A",
    purchaseDate: "2026-02-24",
    purchaseCost: 620,
    currentBookValue: 620,
    description: "Standard display kit component kept in distribution-ready storage.",
  },
  {
    id: "IPH-2026-001",
    name: "iPhone 16 Pro",
    category: "Phone",
    assignedTo: "",
    location: "Warehouse B",
    condition: "Good",
    status: "AVAILABLE",
    verified: true,
    serialNumber: "FK3PR1AA9102",
    purchaseDate: "2026-03-03",
    purchaseCost: 1399,
    currentBookValue: 1399,
    description: "Corporate mobile inventory held for field and finance approvals.",
  },
  {
    id: "IPD-2026-001",
    name: 'iPad Pro 11" M4',
    category: "Tablet",
    assignedTo: "",
    location: "Warehouse B",
    condition: "Good",
    status: "AVAILABLE",
    verified: true,
    serialNumber: "DMPZJ12T54NL",
    purchaseDate: "2026-03-03",
    purchaseCost: 1099,
    currentBookValue: 1099,
    description: "Tablet inventory for field demos and onboarding stations.",
  },
]

// Storage-only items that should still appear in the asset register
export const storageOnlyAssets: Asset[] = [
  {
    id: "IPH-2023-002",
    name: "iPhone 13 Mini",
    category: "Phone",
    assignedTo: "",
    location: "Secure Cage - Warehouse B",
    condition: "Damaged",
    status: "PENDING_DISPOSAL",
    verified: true,
    verifiedAt: "2026-03-08T09:15:00Z",
    serialNumber: "FK2LG0D91AP3",
    purchaseDate: "2023-02-12",
    purchaseCost: 699,
    currentBookValue: 120,
    description: "Retired mobile device awaiting finance approval and certified disposal.",
  },
]

// Mock asset requests from employees
export const mockAssetRequests: AssetRequest[] = [
  {
    id: "REQ-2026-001",
    employeeId: "EMP-002",
    assetCategory: "Monitor",
    justification: "Need a second monitor for design work and video editing tasks.",
    status: "Pending",
    requestedAt: "2026-03-14T09:30:00Z",
  },
  {
    id: "REQ-2026-002",
    employeeId: "EMP-004",
    assetCategory: "Tablet",
    justification: "Tablet needed for on-site client presentations and demos.",
    status: "Pending",
    requestedAt: "2026-03-13T14:15:00Z",
  },
  {
    id: "REQ-2025-015",
    employeeId: "EMP-003",
    assetCategory: "Laptop",
    justification: "Current laptop is 4 years old and running slow.",
    status: "Approved",
    requestedAt: "2026-03-01T11:00:00Z",
    reviewedAt: "2026-03-02T10:00:00Z",
    reviewedBy: "HR Admin",
  },
]

// Mock asset assignments (pending acknowledgment)
export const mockAssetAssignments: AssetAssignment[] = [
  {
    id: "ASSIGN-2026-001",
    assetId: "MAC-2026-010",
    employeeId: "EMP-003",
    assignedBy: "HR Admin",
    status: "Pending Acknowledgment",
    assignedAt: "2026-03-14T10:00:00Z",
    expiresAt: "2026-03-17T10:00:00Z",
  },
]

// Assignment history (completed)
export const mockAssignmentHistory: AssetAssignment[] = [
  {
    id: "ASSIGN-2025-042",
    assetId: "MAC-2026-002",
    employeeId: "EMP-002",
    assignedBy: "HR Admin",
    status: "Acknowledged",
    assignedAt: "2025-12-15T09:00:00Z",
    acknowledgedAt: "2025-12-15T14:30:00Z",
    signedName: "Michael Torres",
    expiresAt: "2025-12-18T09:00:00Z",
  },
  {
    id: "ASSIGN-2025-041",
    assetId: "MAC-2026-001",
    employeeId: "EMP-001",
    assignedBy: "HR Admin",
    status: "Acknowledged",
    assignedAt: "2025-12-10T11:00:00Z",
    acknowledgedAt: "2025-12-10T16:45:00Z",
    signedName: "Sarah Chen",
    expiresAt: "2025-12-13T11:00:00Z",
  },
]

// Helper functions
export function getAllAssets(): Asset[] {
  return [...mockAssets, ...unassignedAssets, ...storageOnlyAssets]
}

export function getEmployeeById(id: string): Employee | undefined {
  return mockEmployees.find((emp) => emp.id === id)
}

export function getAssetById(id: string): Asset | undefined {
  return getAllAssets().find((asset) => asset.id === id)
}

export function getAssetsForEmployee(employeeId: string): Asset[] {
  return getAllAssets().filter((asset) => asset.assignedTo === employeeId)
}

export function getAssignedAssetCount(employeeId: string): number {
  return getAssetsForEmployee(employeeId).length
}

export function getAssetHistory(assetId: string): AssetHistoryEvent[] {
  const presetHistory = assetHistoryById[assetId]

  if (presetHistory) {
    return presetHistory
  }

  const asset = getAssetById(assetId)

  if (!asset) {
    return []
  }

  const owner = getEmployeeById(asset.assignedTo)
  const storageArrival = new Date(asset.purchaseDate)
  storageArrival.setDate(storageArrival.getDate() + 5)
  const assignmentDate = new Date(asset.purchaseDate)
  assignmentDate.setDate(assignmentDate.getDate() + 9)

  return [
    {
      id: `${asset.id}-ordered`,
      date: asset.purchaseDate,
      title: "Ordered",
      description: `Approved for the ${asset.category.toLowerCase()} inventory plan.`,
      condition: "Good",
      ownerLabel: "Inventory Team",
      location: "Vendor",
    },
    {
      id: `${asset.id}-storage`,
      date: storageArrival.toISOString().slice(0, 10),
      title: "Arrived at storage",
      description: "Received, checked, and staged in storage before assignment.",
      condition: "Good",
      ownerLabel: "Storage",
      location: asset.location.includes("Warehouse") ? asset.location : "Warehouse A",
    },
    {
      id: `${asset.id}-current`,
      date: assignmentDate.toISOString().slice(0, 10),
      title: owner ? "Assigned to current owner" : "Held in storage",
      description: owner
        ? `Released from storage and assigned to ${owner.name}.`
        : "Still waiting in storage for its first assignment.",
      condition: asset.condition,
      ownerLabel: owner ? `${owner.name} | ${owner.department}` : "Storage",
      location: asset.location,
    },
  ]
}

export function getCensusTasksForEmployee(employeeId: string, censusId: string): CensusTask[] {
  return mockCensusTasks.filter(
    (task) => task.employeeId === employeeId && task.censusId === censusId,
  )
}

// Helper functions for distribution
export function getUnassignedAssetsByCategory(category?: string): Asset[] {
  if (!category) return unassignedAssets
  return unassignedAssets.filter((asset) => asset.category === category)
}

export function getPendingRequestsForEmployee(employeeId: string): AssetRequest[] {
  return mockAssetRequests.filter(
    (req) => req.employeeId === employeeId && req.status === "Pending",
  )
}

export function getPendingAssignmentsForEmployee(employeeId: string): AssetAssignment[] {
  return mockAssetAssignments.filter(
    (assign) =>
      assign.employeeId === employeeId && assign.status === "Pending Acknowledgment",
  )
}
