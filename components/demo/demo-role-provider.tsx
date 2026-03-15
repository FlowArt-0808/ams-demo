"use client"

import { createContext, useContext, useEffect, useState } from "react"

import { type DemoRole, isDemoRole } from "@/lib/demo-navigation"

const DEMO_ROLE_STORAGE_KEY = "ams-demo-role"

type DemoRoleContextValue = {
  role: DemoRole
  setRole: (role: DemoRole) => void
}

const DemoRoleContext = createContext<DemoRoleContextValue | null>(null)

export function DemoRoleProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [role, setRole] = useState<DemoRole>("higher-ups")

  useEffect(() => {
    const storedRole = window.localStorage.getItem(DEMO_ROLE_STORAGE_KEY)

    if (isDemoRole(storedRole)) {
      setRole(storedRole)
    }
  }, [])

  const updateRole = (nextRole: DemoRole) => {
    setRole(nextRole)
    window.localStorage.setItem(DEMO_ROLE_STORAGE_KEY, nextRole)
  }

  return (
    <DemoRoleContext.Provider value={{ role, setRole: updateRole }}>
      {children}
    </DemoRoleContext.Provider>
  )
}

export function useDemoRole() {
  const context = useContext(DemoRoleContext)

  if (!context) {
    throw new Error("useDemoRole must be used within DemoRoleProvider.")
  }

  return context
}
