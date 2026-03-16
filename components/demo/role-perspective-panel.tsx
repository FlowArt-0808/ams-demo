"use client"

import { Eye, ListChecks, ShieldUser } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getRoleOption, type DemoRole } from "@/lib/demo-navigation"

function getVisibleRoles(roles: DemoRole[], currentRole: DemoRole) {
  return roles.includes(currentRole) ? roles : [...roles, currentRole]
}

export function RolePerspectivePanel({
  currentRole,
  onRoleChange,
  roles,
  title,
  description,
  responsibilities,
  visibility,
}: {
  currentRole: DemoRole
  onRoleChange: (role: DemoRole) => void
  roles: DemoRole[]
  title: string
  description: string
  responsibilities: string[]
  visibility: string[]
}) {
  const visibleRoles = getVisibleRoles(roles, currentRole)
  const currentRoleOption = getRoleOption(currentRole)

  return (
    <Card className="rounded-[28px] border-0 shadow-sm">
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/10">
                <ShieldUser className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Switch role
            </p>
            <div className="inline-flex flex-wrap rounded-2xl border bg-muted/30 p-1">
              {visibleRoles.map((role) => {
                const roleOption = getRoleOption(role)

                return (
                  <Button
                    key={role}
                    variant={currentRole === role ? "default" : "ghost"}
                    className="rounded-xl"
                    onClick={() => onRoleChange(role)}
                  >
                    {roleOption.label}
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{currentRoleOption.label}</Badge>
          <Badge variant="outline">Shared tab with role-specific actions</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-dashed bg-muted/20 p-4">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-emerald-600" />
            <p className="font-medium">What this role should be doing</p>
          </div>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            {responsibilities.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-dashed bg-muted/20 p-4">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-violet-600" />
            <p className="font-medium">What this role should be seeing</p>
          </div>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            {visibility.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
