"use client"

import Image from "next/image"
import {
  Building2,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  Package2,
  ShoppingCart,
} from "lucide-react"

import { useDemoRole } from "@/components/demo/demo-role-provider"
import { RolePerspectivePanel } from "@/components/demo/role-perspective-panel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { type DemoRole } from "@/lib/demo-navigation"

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const orderDetails = {
  requestId: "REQ-20260315-001",
  requestDate: "March 15, 2026",
  deliveryDate: "March 22, 2026",
  department: "Administration",
}

const orderItems = [
  {
    id: "OFF-PEN-023-A4",
    name: "Office Paper A4",
    code: "OFF-PEN-023",
    quantity: 50,
    unit: "Ream",
    price: 8.5,
    note: "General office replenishment for the next monthly cycle.",
    tone: "bg-sky-500/10 text-sky-700",
    imageAlt: "Office paper stack preview",
  },
  {
    id: "OFF-PEN-023-BLUE",
    name: "Ballpoint Pens (Blue)",
    code: "OFF-PEN-023",
    quantity: 100,
    unit: "Box",
    price: 12,
    note: "Shared supply for front desk and HR onboarding kits.",
    tone: "bg-emerald-500/10 text-emerald-700",
    imageAlt: "Blue ballpoint pens preview",
  },
  {
    id: "OFF-PEN-025",
    name: "Sticky Notes 3x3",
    code: "OFF-PEN-025",
    quantity: 30,
    unit: "Pack",
    price: 4.25,
    note: "Requested for operations desks and meeting room usage.",
    tone: "bg-amber-500/10 text-amber-700",
    imageAlt: "Sticky notes preview",
  },
] as const

const orderRoleCopy: Record<
  DemoRole,
  {
    responsibilities: string[]
    visibility: string[]
    nextAction: string
  }
> = {
  "inventory-head": {
    responsibilities: [
      "Check the requested quantities and confirm the line items are ready to send for approval.",
      "Make sure the requested delivery date and department match the operational need.",
      "Keep the order card view clean so approvers can review the request quickly.",
    ],
    visibility: [
      "Full request details, quantity and price on each item card, and the total order value.",
      "Operational notes on why each item is being purchased.",
      "A submit-oriented action state instead of final approval controls.",
    ],
    nextAction: "Submit for Approval",
  },
  "higher-ups": {
    responsibilities: [
      "Review the order as a budget and necessity decision, not as a line-item editing screen.",
      "Focus on the order total, delivery timing, and whether the request should be approved.",
      "Approve or return the request after scanning the item cards.",
    ],
    visibility: [
      "A concise summary of the request and the full card-based list of items being ordered.",
      "Department, dates, and total order value for fast executive review.",
      "Approval-oriented action messaging instead of procurement editing tasks.",
    ],
    nextAction: "Approve Order",
  },
  "system-admin": {
    responsibilities: [
      "Validate that the shared order demo works cleanly for both procurement and approver roles.",
      "Use the same card view to inspect the request across role states.",
      "Confirm the order can later hand off into receiving without losing context.",
    ],
    visibility: [
      "Everything the shared roles can see, including the order summary and item cards.",
      "The role switcher so the handoff between inventory and approver is easy to demo.",
      "A neutral admin action that keeps the workflow visible without impersonating a business decision.",
    ],
    nextAction: "Review Workflow State",
  },
  employee: {
    responsibilities: [],
    visibility: [],
    nextAction: "Open Order",
  },
  finance: {
    responsibilities: [],
    visibility: [],
    nextAction: "Open Order",
  },
  hr: {
    responsibilities: [],
    visibility: [],
    nextAction: "Open Order",
  },
  "it-admin": {
    responsibilities: [],
    visibility: [],
    nextAction: "Open Order",
  },
}

function OrderDetailCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: typeof ClipboardList
}) {
  return (
    <div className="rounded-3xl border border-dashed bg-muted/20 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background shadow-sm">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 font-medium">{value}</p>
        </div>
      </div>
    </div>
  )
}

export function OrderWorkspace() {
  const { role, setRole } = useDemoRole()
  const visibleRoles: DemoRole[] = ["inventory-head", "higher-ups", "system-admin"]
  const roleCopy = orderRoleCopy[role] ?? orderRoleCopy["inventory-head"]

  const totalUnits = orderItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalValue = orderItems.reduce((sum, item) => sum + item.quantity * item.price, 0)

  return (
    <div className="space-y-6">
      <RolePerspectivePanel
        currentRole={role}
        onRoleChange={setRole}
        roles={visibleRoles}
        title="Order perspectives"
        description="Switch between requester and approver views while keeping the same order cards on screen."
        responsibilities={roleCopy.responsibilities}
        visibility={roleCopy.visibility}
      />

      <div className="grid gap-4 xl:grid-cols-[1.2fr,0.8fr]">
        <Card className="rounded-[28px] border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Order details</CardTitle>
            <CardDescription>
              Procurement summary for the current request before it moves to approval.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <OrderDetailCard
              label="Request ID"
              value={orderDetails.requestId}
              icon={ClipboardList}
            />
            <OrderDetailCard
              label="Request Date"
              value={orderDetails.requestDate}
              icon={CalendarDays}
            />
            <OrderDetailCard
              label="Department"
              value={orderDetails.department}
              icon={Building2}
            />
            <OrderDetailCard
              label="Required Delivery"
              value={orderDetails.deliveryDate}
              icon={ShoppingCart}
            />
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Order snapshot</CardTitle>
                <CardDescription>
                  Quick review block for the current role on this shared tab.
                </CardDescription>
              </div>
              <Badge variant="secondary">{roleCopy.nextAction}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-dashed bg-muted/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Line Items
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight">{orderItems.length}</p>
              </div>
              <div className="rounded-3xl border border-dashed bg-muted/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Total Units
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight">{totalUnits}</p>
              </div>
            </div>

            <div className="rounded-[28px] bg-zinc-950 p-5 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-zinc-300">Order Value</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight">
                    {currencyFormatter.format(totalValue)}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <CircleDollarSign className="h-6 w-6 text-zinc-100" />
                </div>
              </div>
              <p className="mt-3 text-sm text-zinc-300">
                This request is ready for the next workflow step without using row-based tables.
              </p>
            </div>

            <Button className="w-full rounded-xl">{roleCopy.nextAction}</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[28px] border-0 shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle>Order items</CardTitle>
              <CardDescription>
                Each requested item is now shown as a card so the order reads like the rest of the
                demo.
              </CardDescription>
            </div>
            <Badge variant="outline">{orderItems.length} item cards</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-3 md:grid-cols-2">
          {orderItems.map((item) => {
            const lineTotal = item.quantity * item.price

            return (
              <Card
                key={item.id}
                className="overflow-hidden rounded-[28px] border-dashed shadow-none"
              >
                <div className="relative aspect-[16/10] border-b border-dashed bg-muted/30">
                  <Image
                    src="/placeholder.jpg"
                    alt={item.imageAlt}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-zinc-950/20" />
                  <div className="absolute right-4 bottom-4 left-4 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="bg-background/90 backdrop-blur">
                      Office Supply
                    </Badge>
                    <Badge className={`${item.tone} border-0 bg-background/90`}>
                      {item.unit}
                    </Badge>
                  </div>
                </div>

                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-1">
                    <p className="text-lg font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.code}</p>
                  </div>

                  <p className="text-sm text-muted-foreground">{item.note}</p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-muted/35 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Quantity
                      </p>
                      <p className="mt-2 text-lg font-semibold">{item.quantity}</p>
                    </div>
                    <div className="rounded-2xl bg-muted/35 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Unit Price
                      </p>
                      <p className="mt-2 text-lg font-semibold">
                        {currencyFormatter.format(item.price)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-dashed p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-muted-foreground">Line total</p>
                      <p className="text-xl font-semibold">
                        {currencyFormatter.format(lineTotal)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">Ready to order</Badge>
                    <Badge variant="outline">Card-based line item</Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          <Card className="rounded-[28px] border border-dashed bg-muted/15 shadow-none">
            <CardContent className="flex h-full flex-col justify-between gap-4 pt-6">
              <div className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background shadow-sm">
                  <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-semibold">Add another item later</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This extra card slot keeps the layout ready for future order lines without
                    dropping back to a row-based table.
                  </p>
                </div>
              </div>
              <Button variant="outline" className="rounded-xl">
                Add Item
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
