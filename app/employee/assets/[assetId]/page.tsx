import { notFound } from "next/navigation"

import { EmployeeAssetPage } from "@/components/demo/employee-asset-page"
import { getAssetById, getEmployeeById } from "@/lib/mock-data"

export default async function EmployeeAssetDetailPage({
  params,
}: {
  params: Promise<{ assetId: string }>
}) {
  const { assetId } = await params
  const asset = getAssetById(assetId)

  if (!asset) {
    notFound()
  }

  const owner = getEmployeeById(asset.assignedTo) ?? null

  return <EmployeeAssetPage asset={asset} owner={owner} />
}
