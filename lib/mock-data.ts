// Mock data for the QR scanning workflow demo

export interface Employee {
  id: string
  name: string
  email: string
  department: string
}

export interface Asset {
  id: string
  name: string
  category: "Laptop" | "Monitor" | "Phone" | "Tablet" | "Other"
  assignedTo: string // Employee ID
  location: string
  condition: "Good" | "Fair" | "Damaged"
  verified: boolean
  verifiedAt?: string
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
  condition?: "Good" | "Fair" | "Damaged"
  locationConfirmed?: string
}

// Mock Employees
export const mockEmployees: Employee[] = [
  { id: "EMP-001", name: "Sarah Chen", email: "sarah.chen@company.com", department: "Engineering" },
  { id: "EMP-002", name: "Michael Torres", email: "michael.torres@company.com", department: "Marketing" },
  { id: "EMP-003", name: "Emily Watson", email: "emily.watson@company.com", department: "Finance" },
  { id: "EMP-004", name: "James Kim", email: "james.kim@company.com", department: "Engineering" },
  { id: "EMP-005", name: "Lisa Anderson", email: "lisa.anderson@company.com", department: "HR" },
]

// Mock Assets
export const mockAssets: Asset[] = [
  { id: "MAC-2026-001", name: "MacBook Pro 16\"", category: "Laptop", assignedTo: "EMP-001", location: "HQ - Floor 3", condition: "Good", verified: false },
  { id: "MAC-2026-002", name: "MacBook Air M3", category: "Laptop", assignedTo: "EMP-002", location: "HQ - Floor 2", condition: "Good", verified: false },
  { id: "DEL-2025-015", name: "Dell UltraSharp 27\"", category: "Monitor", assignedTo: "EMP-001", location: "HQ - Floor 3", condition: "Fair", verified: false },
  { id: "IPH-2025-008", name: "iPhone 15 Pro", category: "Phone", assignedTo: "EMP-003", location: "HQ - Floor 1", condition: "Good", verified: true, verifiedAt: "2026-03-10T14:30:00Z" },
  { id: "MAC-2025-022", name: "MacBook Pro 14\"", category: "Laptop", assignedTo: "EMP-004", location: "Remote - Seattle", condition: "Good", verified: false },
  { id: "IPD-2024-003", name: "iPad Pro 12.9\"", category: "Tablet", assignedTo: "EMP-005", location: "HQ - Floor 4", condition: "Good", verified: false },
  { id: "DEL-2024-019", name: "Dell Monitor 24\"", category: "Monitor", assignedTo: "EMP-002", location: "HQ - Floor 2", condition: "Damaged", verified: false },
  { id: "LEN-2025-007", name: "Lenovo ThinkPad X1", category: "Laptop", assignedTo: "EMP-003", location: "HQ - Floor 1", condition: "Good", verified: false },
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

// Helper functions
export function getEmployeeById(id: string): Employee | undefined {
  return mockEmployees.find((emp) => emp.id === id)
}

export function getAssetById(id: string): Asset | undefined {
  return mockAssets.find((asset) => asset.id === id)
}

export function getAssetsForEmployee(employeeId: string): Asset[] {
  return mockAssets.filter((asset) => asset.assignedTo === employeeId)
}

export function getCensusTasksForEmployee(employeeId: string, censusId: string): CensusTask[] {
  return mockCensusTasks.filter(
    (task) => task.employeeId === employeeId && task.censusId === censusId
  )
}

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
]

// Departments for dropdown
export const departments = [
  "Engineering",
  "Marketing",
  "Finance",
  "HR",
  "Operations",
  "Sales",
]

// Asset categories
export const assetCategories = ["Laptop", "Monitor", "Phone", "Tablet", "Other"]

// =====================
// DISTRIBUTION WORKFLOW
// =====================

export interface AssetRequest {
  id: string
  employeeId: string
  assetCategory: "Laptop" | "Monitor" | "Phone" | "Tablet" | "Other"
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
  { id: "MAC-2026-010", name: "MacBook Pro 14\" M3", category: "Laptop", assignedTo: "", location: "Warehouse A", condition: "Good", verified: true },
  { id: "MAC-2026-011", name: "MacBook Air 15\" M3", category: "Laptop", assignedTo: "", location: "Warehouse A", condition: "Good", verified: true },
  { id: "DEL-2026-001", name: "Dell UltraSharp 32\"", category: "Monitor", assignedTo: "", location: "Warehouse A", condition: "Good", verified: true },
  { id: "DEL-2026-002", name: "Dell UltraSharp 27\" 4K", category: "Monitor", assignedTo: "", location: "Warehouse A", condition: "Good", verified: true },
  { id: "IPH-2026-001", name: "iPhone 16 Pro", category: "Phone", assignedTo: "", location: "Warehouse B", condition: "Good", verified: true },
  { id: "IPD-2026-001", name: "iPad Pro 11\" M4", category: "Tablet", assignedTo: "", location: "Warehouse B", condition: "Good", verified: true },
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

// Helper functions for distribution
export function getUnassignedAssetsByCategory(category?: string): Asset[] {
  if (!category) return unassignedAssets
  return unassignedAssets.filter((asset) => asset.category === category)
}

export function getPendingRequestsForEmployee(employeeId: string): AssetRequest[] {
  return mockAssetRequests.filter(
    (req) => req.employeeId === employeeId && req.status === "Pending"
  )
}

export function getPendingAssignmentsForEmployee(employeeId: string): AssetAssignment[] {
  return mockAssetAssignments.filter(
    (assign) => assign.employeeId === employeeId && assign.status === "Pending Acknowledgment"
  )
}
