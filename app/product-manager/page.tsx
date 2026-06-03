"use client"

export const dynamic = "force-dynamic"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Package, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { supabase } from "@/lib/supabase/client"
import {
  type Campaign,
  type CampaignForm,
  campaignToForm,
  emptyCampaignForm,
  formToCampaignPayload,
} from "@/lib/campaign-form"
import { Button } from "@/components/ui/button"

interface ProductDraft {
  id: string
  title: string
  shortDescription: string
  longDescription: string
  category: string
  price: number
  image: string
  status: string
  createdAt: string
}
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function ProductManagerPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState("")
  const [authReady, setAuthReady] = useState(false)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [draftProducts, setDraftProducts] = useState<ProductDraft[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Campaign | null>(null)
  const [form, setForm] = useState<CampaignForm>(emptyCampaignForm)
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null)
  const deleteInFlight = useRef(false)

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login?callbackUrl=/product-manager")
        return
      }

      setUserId(user.id)
      setUserEmail(user.email ?? "")
      setAuthReady(true)
    }

    init()
  }, [router])

  const fetchMyProducts = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("seller_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw new Error(error.message)

      setCampaigns((data as Campaign[]) ?? [])
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Failed to load products")
    } finally {
      setLoading(false)
    }
  }, [userId])

  const fetchMyDraftProducts = useCallback(async () => {
    if (!userId) return

    try {
      const response = await fetch(`/api/products?sellerId=${encodeURIComponent(userId)}`)
      const contentType = response.headers.get("content-type") || ""
      let data: any

      if (contentType.includes("application/json")) {
        data = await response.json()
      } else {
        const text = await response.text()
        throw new Error(
          `Expected JSON but got ${response.status} ${response.statusText}: ${text.slice(0, 200)}`
        )
      }

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load drafts")
      }

      setDraftProducts((data as ProductDraft[]) ?? [])
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Failed to load drafts")
    }
  }, [userId])

  useEffect(() => {
    if (authReady && userId) {
      fetchMyProducts()
      fetchMyDraftProducts()
    }
  }, [authReady, userId, fetchMyProducts, fetchMyDraftProducts])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return campaigns.filter((c) => {
      const matchesStatus =
        statusFilter === "all" || (c.status ?? "").toLowerCase() === statusFilter
      const matchesSearch =
        !q ||
        c.title?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.platform?.toLowerCase().includes(q)
      return matchesStatus && matchesSearch
    })
  }, [campaigns, search, statusFilter])

  const closeDialog = () => {
    setDialogOpen(false)
    setEditing(null)
    setForm(emptyCampaignForm)
  }

  const openCreate = () => {
    setEditing(null)
    setForm({
      ...emptyCampaignForm,
      contact_email: userEmail,
    })
    setDialogOpen(true)
  }

  const openEdit = (campaign: Campaign) => {
    setEditing(campaign)
    setForm(campaignToForm(campaign))
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!userId) return
    if (!form.title.trim()) {
      toast.error("Title is required")
      return
    }

    setSaving(true)
    try {
      const payload = formToCampaignPayload(form)

      if (editing) {
        const { data, error } = await supabase
          .from("campaigns")
          .update(payload)
          .eq("id", editing.id)
          .eq("seller_id", userId)
          .select()
          .single()

        if (error) throw new Error(error.message)
        if (!data) throw new Error("Update failed — product not found or access denied")

        setCampaigns((prev) =>
          prev.map((c) => (c.id === editing.id ? (data as Campaign) : c))
        )
        toast.success("Product updated")
      } else {
        const { data, error } = await supabase
          .from("campaigns")
          .insert([
            {
              ...payload,
              seller_id: userId,
            },
          ])
          .select()
          .single()

        if (error) throw new Error(error.message)
        if (!data) throw new Error("Create failed")

        setCampaigns((prev) => [data as Campaign, ...prev])
        toast.success("Product created")
      }

      closeDialog()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget || !userId || deleteInFlight.current) return

    deleteInFlight.current = true
    setIsDeleting(true)
    const targetId = deleteTarget.id

    try {
      const { data, error } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", targetId)
        .eq("seller_id", userId)
        .select("id")

      if (error) throw new Error(error.message)
      if (!data || data.length === 0) {
        throw new Error("Delete failed — product not found or access denied")
      }

      setCampaigns((prev) => prev.filter((c) => c.id !== targetId))
      toast.success("Product deleted")
      setDeleteTarget(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed")
    } finally {
      setIsDeleting(false)
      deleteInFlight.current = false
    }
  }

  const updateField = (field: keyof CampaignForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  if (!authReady) {
    return (
      <div className="container py-12">
        <p className="text-muted-foreground">Loading product manager...</p>
      </div>
    )
  }

  return (
    <div className="container py-8 md:py-12 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Product Manager</h1>
          </div>
          <p className="text-muted-foreground">
            Create and manage your marketplace product listings.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={fetchMyProducts} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add product
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search your products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline">{filtered.length} products</Badge>
      </div>

      {draftProducts.length > 0 ? (
        <div className="rounded-md border bg-background p-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-sm font-semibold">AI-generated drafts</p>
              <p className="text-xs text-muted-foreground">
                These product drafts were generated from your seller prompt. Review and publish them from the product manager.
              </p>
            </div>
            <Badge variant="secondary">{draftProducts.length} drafts</Badge>
          </div>

          <div className="grid gap-4">
            {draftProducts.map((draft) => (
              <div key={draft.id} className="grid grid-cols-[96px_1fr] gap-4 p-3 rounded-lg border bg-muted/50">
                <div className="relative h-24 w-full overflow-hidden rounded-md bg-muted">
                  <Image
                    src={draft.image}
                    alt={draft.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold">{draft.title}</p>
                    <Badge variant="secondary">{draft.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{draft.shortDescription}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{draft.category}</span>
                    <span>•</span>
                    <span>₹{draft.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Loading your products...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <p className="text-muted-foreground mb-3">No products yet.</p>
                  <Button size="sm" onClick={openCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add your first product
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((campaign) => {
                const price = Number(campaign.payout ?? campaign.budget ?? 0)
                return (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <div className="relative h-10 w-10 shrink-0 rounded-md overflow-hidden border bg-muted">
                          <Image
                            src={
                              campaign.thumbnail ||
                              "/placeholder.svg?height=40&width=40"
                            }
                            alt={campaign.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{campaign.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1 max-w-[240px]">
                            {campaign.description || "—"}
                          </p>
                          <Link
                            href={`/products/${campaign.id}`}
                            className="text-xs text-primary hover:underline"
                          >
                            View listing
                          </Link>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{campaign.platform || "—"}</TableCell>
                    <TableCell>₹{price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{campaign.status ?? "—"}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(campaign)}
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(campaign)}
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog()
          else setDialogOpen(true)
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit product" : "Add product"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update your listing. Changes appear on the marketplace immediately."
                : "Create a new product listing for the marketplace."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="platform">Category</Label>
                <Input
                  id="platform"
                  value={form.platform}
                  onChange={(e) => updateField("platform", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => updateField("status", v)}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="payout">Price</Label>
                <Input
                  id="payout"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.payout}
                  onChange={(e) => updateField("payout", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="budget">Budget</Label>
                <Input
                  id="budget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.budget}
                  onChange={(e) => updateField("budget", e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="thumbnail">Thumbnail URL</Label>
              <Input
                id="thumbnail"
                value={form.thumbnail}
                onChange={(e) => updateField("thumbnail", e.target.value)}
                placeholder="/placeholder.svg?height=300&width=300"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact_email">Contact email</Label>
              <Input
                id="contact_email"
                type="email"
                value={form.contact_email}
                onChange={(e) => updateField("contact_email", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={form.website}
                onChange={(e) => updateField("website", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="social_links">Social links (one per line)</Label>
              <Textarea
                id="social_links"
                rows={3}
                value={form.social_links}
                onChange={(e) => updateField("social_links", e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editing ? "Save changes" : "Create product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes &quot;{deleteTarget?.title}&quot; from the marketplace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={() => void handleDelete()}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
