"use client"

import * as React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Edit, Eye, ImageIcon, MoreVertical, Plus, RefreshCw, Share2, Trash2, Upload, X, ToggleLeft, ToggleRight } from "lucide-react"
import { toast } from "sonner"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  CreateCelebritySchema,
  UpdateCelebritySchema,
  CelebrityQuerySchema,
  type CelebrityQuery,
  BookingTypeInputSchema
} from "@/utils/schemas/schemas"
import type { z } from "zod"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { cn } from "@/lib/utils"
import { AdminCelebritiesApi, Celebrity } from "@/api/celebrities.api"
import { AdminBookingsApi, Booking } from "@/api/bookings.api"
import { uploadToCloudinary } from "@/utils/upload-to-cloudinary"

type UploadResult = { url: string; publicId?: string }

const fmtMoney = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n)
const fmtDate = (s: string | Date) => new Date(s).toLocaleString()

function useDebounced<T>(value: T, delay = 400) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return v
}

function PaginationControls({
  page, limit, total, onPage, onLimit
}: { page: number; limit: number; total: number; onPage: (p: number) => void; onLimit: (l: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)))
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="text-sm text-zinc-600">
        Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages}</span> • {total.toLocaleString()} items
      </div>
      <div className="flex items-center gap-2">
        <Select value={String(limit)} onValueChange={(v) => onLimit(Number(v))}>
          <SelectTrigger className="h-9 w-[110px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {[10, 20, 30, 50, 100].map(n => <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onPage(Math.max(1, page - 1))} disabled={page <= 1}>Prev</Button>
          <Button variant="outline" size="sm" onClick={() => onPage(page + 1)} disabled={page >= totalPages}>Next</Button>
        </div>
      </div>
    </div>
  )
}

function ShareButton({ url, title }: { url: string; title: string }) {
  const [copying, setCopying] = useState(false)
  const onShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ url, title, text: title })
        return
      }
    } catch { /* fall back to copy */ }
    try {
      setCopying(true)
      await navigator.clipboard.writeText(url)
      toast.success("Link copied to clipboard")
    } catch (e: any) {
      toast.error(e?.message || "Failed to copy")
    } finally {
      setCopying(false)
    }
  }
  return (
    <Button variant="ghost" size="sm" onClick={onShare} isLoading={copying}>
      <Share2 className="w-4 h-4 mr-2" /> Share
    </Button>
  )
}

function TagEditor({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [text, setText] = useState("")
  const add = () => {
    const t = text.trim()
    if (!t) return
    onChange([...(value || []), t])
    setText("")
  }
  const remove = (i: number) => onChange((value || []).filter((_, idx) => idx !== i))
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-white border-zinc-200 focus:border-emerald-500"
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add() } }}
        />
        <Button type="button" onClick={add} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {(value || []).map((t, i) => (
          <div key={`${t}-${i}`} className="flex items-center justify-between bg-zinc-50 p-2 rounded-md">
            <span className="text-sm text-zinc-700 flex-1">{t}</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)} className="h-6 w-6 p-0 text-red-600 hover:bg-red-50">
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}
        {(!value || value.length === 0) && <p className="text-sm text-zinc-500 italic">None yet</p>}
      </div>
    </div>
  )
}

function BookingTypesEditor({
  value,
  onChange,
  errors
}: {
  value: Array<z.input<typeof BookingTypeInputSchema>>;
  onChange: (v: any[]) => void;
  errors?: any[]
}) {
  const add = () => onChange([...(value || []), { name: "", duration: "", price: 0, description: "", features: [], availability: 0, popular: false }])
  const updateAt = (i: number, patch: any) => {
    const clone = [...(value || [])]
    clone[i] = { ...clone[i], ...patch }
    onChange(clone)
  }
  const removeAt = (i: number) => onChange((value || []).filter((_, idx) => idx !== i))
  const errMsg = (i: number, key: string) => errors?.[i]?.[key]?.message as string | undefined
  const errClass = (has: boolean) => cn(has && "border-red-500 focus-visible:ring-red-500")

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-emerald-900">Booking Types</Label>
        <Button type="button" onClick={add} size="sm"><Plus className="w-4 h-4 mr-1" /> Add Type</Button>
      </div>
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {(value || []).map((bt, i) => (
          <Card key={i} className="border-2">
            <CardContent className="pt-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div data-field={`bookingTypes.${i}.name`}>
                  <Label>Name *</Label>
                  <Input value={bt?.name ?? ""} onChange={(e) => updateAt(i, { name: e.target.value })} className={errClass(!!errMsg(i, "name"))} aria-invalid={!!errMsg(i, "name")} />
                  {errMsg(i, "name") && <p className="text-xs text-red-600 mt-1">{errMsg(i, "name")}</p>}
                </div>
                <div data-field={`bookingTypes.${i}.duration`}>
                  <Label>Duration *</Label>
                  <Input value={bt?.duration ?? ""} onChange={(e) => updateAt(i, { duration: e.target.value })} placeholder="e.g. 30 minutes" className={errClass(!!errMsg(i, "duration"))} aria-invalid={!!errMsg(i, "duration")} />
                  {errMsg(i, "duration") && <p className="text-xs text-red-600 mt-1">{errMsg(i, "duration")}</p>}
                </div>
                <div data-field={`bookingTypes.${i}.price`}>
                  <Label>Price *</Label>
                  <Input type="number" value={bt?.price?.toString() ?? "0"} onChange={(e) => updateAt(i, { price: Number(e.target.value) })} className={errClass(!!errMsg(i, "price"))} aria-invalid={!!errMsg(i, "price")} />
                  {errMsg(i, "price") && <p className="text-xs text-red-600 mt-1">{errMsg(i, "price")}</p>}
                </div>
              </div>
              <div data-field={`bookingTypes.${i}.description`}>
                <Label>Description</Label>
                <Textarea value={bt?.description ?? ""} onChange={(e) => updateAt(i, { description: e.target.value })} className={errClass(!!errMsg(i, "description"))} aria-invalid={!!errMsg(i, "description")} />
                {errMsg(i, "description") && <p className="text-xs text-red-600 mt-1">{errMsg(i, "description")}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div data-field={`bookingTypes.${i}.availability`}>
                  <Label>Availability</Label>
                  <Input type="number" value={bt?.availability?.toString() ?? "0"} onChange={(e) => updateAt(i, { availability: Number(e.target.value) })} className={errClass(!!errMsg(i, "availability"))} aria-invalid={!!errMsg(i, "availability")} />
                  {errMsg(i, "availability") && <p className="text-xs text-red-600 mt-1">{errMsg(i, "availability")}</p>}
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input id={`popular-${i}`} type="checkbox" checked={!!bt?.popular} onChange={(e) => updateAt(i, { popular: e.target.checked })} className="h-4 w-4" />
                  <Label htmlFor={`popular-${i}`}>Popular</Label>
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="button" variant="ghost" onClick={() => removeAt(i)} className="text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4 mr-1" /> Remove
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!value || value.length === 0) && <div className="text-sm italic text-zinc-500">No booking types yet. Click “Add Type”.</div>}
      </div>
    </div>
  )
}

function ImageUploader({ value, onChange, label, hint }: { value?: string; onChange: (v: string) => void; label: string; hint?: string }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = async (file?: File | null) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image too large. Max 8MB")
      return
    }
    setUploading(true)
    setProgress(0)
    try {
      const res: UploadResult = await uploadToCloudinary(file, { onProgress: (p) => setProgress(p) })
      onChange(res.url)
      toast.success("Image uploaded")
    } catch (e: any) {
      toast.error(e?.message || "Upload failed")
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    await handleFile(f)
  }

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">{label}</Label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-4 grid place-items-center text-center transition",
          dragOver ? "border-emerald-500 bg-emerald-50/40" : "border-zinc-200 bg-zinc-50/40"
        )}
      >
        {value ? (
          <div className="relative w-full">
            <img src={value} className="w-full max-h-64 object-cover rounded-lg border" alt="upload" />
            <div className="absolute top-2 right-2 flex gap-2">
              <Button type="button" size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                <Upload className="w-4 h-4 mr-1" /> Replace
              </Button>
              <Button type="button" size="sm" variant="destructive" onClick={() => onChange("")} disabled={uploading}>
                <X className="w-4 h-4 mr-1" /> Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="h-14 w-14 rounded-full bg-white shadow grid place-items-center mb-3"><ImageIcon className="w-7 h-7 text-zinc-500" /></div>
            <p className="text-sm text-zinc-700">Drag & drop image here, or</p>
            <Button type="button" onClick={() => fileInputRef.current?.click()} className="mt-2">
              <Upload className="w-4 h-4 mr-2" /> Choose Image
            </Button>
            {hint && <p className="text-xs text-zinc-500 mt-2">{hint}</p>}
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] || null)} />
        {uploading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm grid place-items-center rounded-xl">
            <div className="w-64">
              <div className="text-xs text-zinc-700 mb-2 text-center">Uploading… {progress}%</div>
              <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ManageCelebritiesPage() {
  const [items, setItems] = useState<Celebrity[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const dSearch = useDebounced(search, 400)
  const [filters, setFilters] = useState<{ category?: string; isActive?: string; trending?: string; hot?: string; verified?: string }>({})
  const parsedFilters = useMemo(() => {
    const out: Partial<CelebrityQuery> = {}
    if (filters.category) out.category = filters.category
    if (filters.isActive) out.isActive = filters.isActive === "true"
    if (filters.trending) out.trending = filters.trending === "true"
    if (filters.hot) out.hot = filters.hot === "true"
    if (filters.verified) out.verified = filters.verified === "true"
    if (dSearch) out.search = dSearch
    out.page = page; out.limit = limit
    return CelebrityQuerySchema.partial().parse(out)
  }, [filters, dSearch, page, limit])

  const load = async () => {
    setLoading(true)
    try {
      const res = await AdminCelebritiesApi.list(parsedFilters)
      setItems(res.items || [])
      setTotal(res.total || 0)
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to load celebrities")
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [parsedFilters.page, parsedFilters.limit, parsedFilters.search, parsedFilters.category, parsedFilters.isActive, parsedFilters.trending, parsedFilters.hot, parsedFilters.verified])

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const schema = useMemo(() => editingId ? UpdateCelebritySchema : CreateCelebritySchema, [editingId])

  type CelebrityFormValues = z.input<typeof CreateCelebritySchema>

  const form = useForm<CelebrityFormValues>({
    resolver: zodResolver(schema as any) as any,
    defaultValues: {
      name: "", category: "", basePrice: 0, description: "", responseTime: "", availability: "Available",
      tags: [], image: "", coverImage: "", achievements: [], bookingTypes: [], trending: false, hot: false, verified: false, isActive: true,
    } as any,
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: true
  })

  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false)

  // Ensure confirm dialog always closes when form closes
  useEffect(() => {
    if (!formOpen && saveConfirmOpen) setSaveConfirmOpen(false)
  }, [formOpen, saveConfirmOpen])

  const openCreate = () => {
    setEditingId(null)
    form.reset({
      name: "", category: "", basePrice: 0, description: "", responseTime: "", availability: "Available",
      tags: [], image: "", coverImage: "", achievements: [], bookingTypes: [], trending: false, hot: false, verified: false, isActive: true,
    } as any, { keepDefaultValues: false })
    setFormOpen(true)
  }
  const openEdit = (row: Celebrity) => {
    setEditingId(row._id)
    form.reset({
      name: row.name, category: row.category, basePrice: row.basePrice, description: row.description ?? "",
      responseTime: row.responseTime ?? "", availability: row.availability ?? "Available", tags: row.tags ?? [],
      image: row.image ?? "", coverImage: row.coverImage ?? "", achievements: row.achievements ?? [],
      bookingTypes: row.bookingTypes ?? [], trending: !!row.trending, hot: !!row.hot, verified: !!row.verified, isActive: !!row.isActive,
    } as any, { keepDefaultValues: false })
    setFormOpen(true)
  }

  const onSave = async (raw: any) => {
    try {
      if (editingId) {
        const payload = UpdateCelebritySchema.parse(raw)
        await AdminCelebritiesApi.update(editingId, payload)
        toast.success("Celebrity updated")
      } else {
        const payload = CreateCelebritySchema.parse(raw)
        await AdminCelebritiesApi.create(payload)
        toast.success("Celebrity created")
      }
      // Close confirm dialog and form cleanly after success
      setSaveConfirmOpen(false)
      setFormOpen(false)
      setEditingId(null)
      load()
    } catch (e: any) {
      const msg = e?.issues ? e.issues.map((i: any) => i.message).join("; ") : e?.response?.data?.message || e?.message || "Failed to save celebrity"
      toast.error(msg)
    }
  }

  // DETAILS MODAL state (separate from bookings)
  const [viewRow, setViewRow] = useState<Celebrity | null>(null)

  // ACTION CONFIRM modal
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const confirmMeta = useRef<{ kind: "delete" | "toggle"; id: string; next?: boolean } | null>(null)

  const askDelete = (id: string) => { confirmMeta.current = { kind: "delete", id }; setConfirmOpen(true) }
  const askToggle = (id: string, next: boolean) => { confirmMeta.current = { kind: "toggle", id, next }; setConfirmOpen(true) }

  const doConfirm = async () => {
    const meta = confirmMeta.current
    if (!meta) return
    setConfirming(true)
    try {
      if (meta.kind === "delete") {
        await AdminCelebritiesApi.remove(meta.id)
        toast.success("Celebrity deleted")
      } else if (meta.kind === "toggle") {
        await AdminCelebritiesApi.toggleActive(meta.id, !!meta.next)
        toast.success(`Celebrity ${meta.next ? "activated" : "deactivated"}`)
      }
      load()
      setConfirmOpen(false)
      confirmMeta.current = null
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Action failed")
    } finally { setConfirming(false) }
  }

  // BOOKINGS MODAL state — decoupled from Details modal
  const [bookingsOpen, setBookingsOpen] = useState(false)
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [bookingsPage, setBookingsPage] = useState(1)
  const [bookingsLimit, setBookingsLimit] = useState(10)
  const [bookingsTotal, setBookingsTotal] = useState(0)
  const [bookingsRow, setBookingsRow] = useState<Celebrity | null>(null)

  const openBookingsFor = async (row: Celebrity) => {
    // Ensure details dialog won't open
    setViewRow(null)
    setBookingsRow(row)
    setBookingsOpen(true)
    await loadBookings(row._id, bookingsPage, bookingsLimit)
  }

  const loadBookings = async (celebrityId: string, p = bookingsPage, l = bookingsLimit) => {
    setBookingsLoading(true)
    try {
      const res = await AdminBookingsApi.list({ celebrityId, page: p, limit: l })
      setBookings(res.items || [])
      setBookingsTotal(res.total || 0)
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to load bookings")
    } finally { setBookingsLoading(false) }
  }

  useEffect(() => {
    if (bookingsOpen && bookingsRow?._id) loadBookings(bookingsRow._id, bookingsPage, bookingsLimit)
  }, [bookingsOpen, bookingsRow?._id, bookingsPage, bookingsLimit])

  const clearFilters = () => setFilters({})

  const err = form.formState.errors as any
  const errClass = (has: boolean) => cn(has && "border-red-500 focus-visible:ring-red-500")

  const scrollToFirstError = () => {
    const keys = Object.keys(err || {})
    if (!keys.length) return
    const first = keys[0]
    const el =
      document.querySelector<HTMLElement>(`[data-field="${first}"]`) ||
      document.querySelector<HTMLElement>(`[data-field^="${first}."]`)
    el?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  const preSubmit = async () => {
    const valid = await form.trigger()
    if (valid) {
      setSaveConfirmOpen(true)
    } else {
      scrollToFirstError()
      toast.error("Please fix the highlighted fields.")
    }
  }

  return (
    <SidebarProvider>
      <AdminSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-zinc-100 px-2 sm:px-3">
          <div className="@container/main flex flex-1 flex-col gap-4 sm:gap-6 px-3 sm:px-6 py-4 sm:py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-emerald-900">Manage Celebrities</h1>
                <p className="text-sm text-zinc-600">Create, edit, and manage celebrities. View bookings and share profiles.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={clearFilters}>Reset Filters</Button>
                <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> New Celebrity</Button>
              </div>
            </div>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-emerald-900">Celebrities</CardTitle>
                <CardDescription>Search, filter, paginate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
                  <div className="md:col-span-2 relative">
                    <Input placeholder="Search name, tags, description…" value={search} onChange={(e) => setSearch(e.target.value)} />
                    <span className="absolute right-2 top-2 text-zinc-400 text-xs">Enter</span>
                  </div>

                  <Select
                    value={filters.category ?? undefined}
                    onValueChange={(v) => setFilters(s => v === "__CLEAR__" ? { ...s, category: undefined } : { ...s, category: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__CLEAR__">Clear</SelectItem>
                      <SelectItem value="Actor">Actor</SelectItem>
                      <SelectItem value="Musician">Musician</SelectItem>
                      <SelectItem value="Athlete">Athlete</SelectItem>
                      <SelectItem value="Comedian">Comedian</SelectItem>
                      <SelectItem value="Influencer">Influencer</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.isActive ?? undefined}
                    onValueChange={(v) => setFilters(s => v === "__CLEAR__" ? { ...s, isActive: undefined } : { ...s, isActive: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Active?" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__CLEAR__">Clear</SelectItem>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="grid grid-cols-3 gap-2">
                    <Select
                      value={filters.trending ?? undefined}
                      onValueChange={(v) => setFilters(s => v === "__CLEAR__" ? { ...s, trending: undefined } : { ...s, trending: v })}
                    >
                      <SelectTrigger><SelectValue placeholder="Trending?" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__CLEAR__">Clear</SelectItem>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filters.hot ?? undefined}
                      onValueChange={(v) => setFilters(s => v === "__CLEAR__" ? { ...s, hot: undefined } : { ...s, hot: v })}
                    >
                      <SelectTrigger><SelectValue placeholder="Hot?" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__CLEAR__">Clear</SelectItem>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={filters.verified ?? undefined}
                      onValueChange={(v) => setFilters(s => v === "__CLEAR__" ? { ...s, verified: undefined } : { ...s, verified: v })}
                    >
                      <SelectTrigger><SelectValue placeholder="Verified?" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__CLEAR__">Clear</SelectItem>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-zinc-50">
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Base Price</TableHead>
                        <TableHead>Flags</TableHead>
                        <TableHead>Stats</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-10 text-zinc-500">
                            <RefreshCw className="size-4 animate-spin inline mr-2" /> Loading…
                          </TableCell>
                        </TableRow>
                      ) : items.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-10 text-zinc-500">No celebrities found</TableCell>
                        </TableRow>
                      ) : (
                        items.map((row) => (
                          <TableRow key={row._id} className="hover:bg-zinc-50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <img src={row.image || "/placeholder.svg"} alt={row.name} className="w-10 h-10 rounded-md object-cover border" />
                                <div>
                                  <div className="font-semibold">{row.name}</div>
                                  <div className="text-xs text-zinc-500">{row.slug}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{row.category}</TableCell>
                            <TableCell>{fmtMoney(row.basePrice)}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {row.trending && <Badge className="bg-emerald-900 text-white">Trending</Badge>}
                                {row.hot && <Badge className="bg-orange-500 text-white">Hot</Badge>}
                                {row.verified && <Badge className="bg-blue-500 text-white">Verified</Badge>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs text-zinc-700">
                                <div>⭐ {row.rating?.toFixed?.(1) ?? row.rating} • {row.totalReviews ?? 0} reviews</div>
                                <div>🧾 {row.bookings ?? 0} bookings • 👁 {row.views ?? 0}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {row.isActive ? (
                                <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                              ) : (
                                <Badge className="bg-zinc-100 text-zinc-700 border-zinc-200">Inactive</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="outline"><MoreVertical className="w-4 h-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={() => setViewRow(row)}><Eye className="w-4 h-4 mr-2" /> View</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openEdit(row)}><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openBookingsFor(row)}><Check className="w-4 h-4 mr-2" /> View bookings</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => askToggle(row._id, !row.isActive)}>
                                    {row.isActive ? <ToggleLeft className="w-4 h-4 mr-2" /> : <ToggleRight className="w-4 h-4 mr-2" />}
                                    {row.isActive ? "Deactivate" : "Activate"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => askDelete(row._id)} className="text-red-600">
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                <PaginationControls page={page} limit={limit} total={total} onPage={setPage} onLimit={(l) => { setLimit(l); setPage(1) }} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CREATE / EDIT */}
        <Dialog
          open={formOpen}
          onOpenChange={(o) => {
            setFormOpen(o)
            if (!o) {
              setEditingId(null)
              form.reset()
              setSaveConfirmOpen(false) // close confirm on form close
            }
          }}
        >
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{editingId ? "Edit Celebrity" : "Create Celebrity"}</DialogTitle>
              <DialogDescription>Fill the form and confirm to save.</DialogDescription>
            </DialogHeader>

            <form onSubmit={(e) => { e.preventDefault(); preSubmit() }} className="space-y-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                  <TabsTrigger value="meta">Tags & Achievements</TabsTrigger>
                  <TabsTrigger value="booking">Booking Types</TabsTrigger>
                  <TabsTrigger value="flags">Flags & Status</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2" data-field="name">
                      <Label>Name *</Label>
                      <Controller
                        name="name"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <>
                            <Input {...field} className={errClass(!!fieldState.error)} aria-invalid={!!fieldState.error} />
                            {fieldState.error && <p className="text-xs text-red-600 mt-1">{fieldState.error.message}</p>}
                          </>
                        )}
                      />
                    </div>
                    <div className="space-y-2" data-field="category">
                      <Label>Category *</Label>
                      <Controller
                        name="category"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <>
                            <Input {...field} placeholder="e.g., Actor" className={errClass(!!fieldState.error)} aria-invalid={!!fieldState.error} />
                            {fieldState.error && <p className="text-xs text-red-600 mt-1">{fieldState.error.message}</p>}
                          </>
                        )}
                      />
                    </div>
                    <div className="space-y-2" data-field="basePrice">
                      <Label>Base Price *</Label>
                      <Controller
                        name="basePrice"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <>
                            <Input type="number" value={String(field.value ?? 0)} onChange={(e) => field.onChange(Number(e.target.value))} className={errClass(!!fieldState.error)} aria-invalid={!!fieldState.error} />
                            {fieldState.error && <p className="text-xs text-red-600 mt-1">{fieldState.error.message}</p>}
                          </>
                        )}
                      />
                    </div>
                    <div className="space-y-2" data-field="availability">
                      <Label>Availability</Label>
                      <Controller
                        name="availability"
                        control={form.control}
                        render={({ field }) => (
                          <Select value={(field.value as string | undefined) ?? undefined} onValueChange={field.onChange}>
                            <SelectTrigger><SelectValue placeholder="Availability" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Available">Available</SelectItem>
                              <SelectItem value="Limited">Limited</SelectItem>
                              <SelectItem value="Booked">Booked</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="space-y-2" data-field="responseTime">
                      <Label>Response Time</Label>
                      <Controller
                        name="responseTime"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <>
                            <Input {...field} placeholder="e.g., Within 24 hours" className={errClass(!!fieldState.error)} aria-invalid={!!fieldState.error} />
                            {fieldState.error && <p className="text-xs text-red-600 mt-1">{fieldState.error.message}</p>}
                          </>
                        )}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2" data-field="description">
                      <Label>Description</Label>
                      <Controller
                        name="description"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <>
                            <Textarea {...field} className={cn("min-h-[100px]", errClass(!!fieldState.error))} aria-invalid={!!fieldState.error} />
                            {fieldState.error && <p className="text-xs text-red-600 mt-1">{fieldState.error.message}</p>}
                          </>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="media" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div data-field="image">
                      <Controller
                        name="image"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <>
                            <ImageUploader value={field.value as string} onChange={field.onChange} label="Profile Image" hint="Square image recommended, ≥ 800×800" />
                            {fieldState.error && <p className="text-xs text-red-600 mt-2">{fieldState.error.message}</p>}
                          </>
                        )}
                      />
                    </div>
                    <div data-field="coverImage">
                      <Controller
                        name="coverImage"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <>
                            <ImageUploader value={field.value as string} onChange={field.onChange} label="Cover Image" hint="Landscape image recommended, ≥ 1600×900" />
                            {fieldState.error && <p className="text-xs text-red-600 mt-2">{fieldState.error.message}</p>}
                          </>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="meta" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div data-field="tags">
                      <Controller
                        name="tags"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <>
                            <div className="space-y-2">
                              <Label>Tags</Label>
                              <TagEditor value={(field.value as string[]) || []} onChange={field.onChange} placeholder="Add a tag…" />
                            </div>
                            {fieldState.error && <p className="text-xs text-red-600 mt-1">{fieldState.error.message}</p>}
                          </>
                        )}
                      />
                    </div>
                    <div data-field="achievements">
                      <Controller
                        name="achievements"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <>
                            <div className="space-y-2">
                              <Label>Achievements</Label>
                              <TagEditor value={(field.value as string[]) || []} onChange={field.onChange} placeholder="Add an achievement…" />
                            </div>
                            {fieldState.error && <p className="text-xs text-red-600 mt-1">{fieldState.error.message}</p>}
                          </>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="booking" className="mt-4" data-field="bookingTypes">
                  <Controller
                    name="bookingTypes"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <>
                        <BookingTypesEditor
                          value={(field.value as any[]) || []}
                          onChange={field.onChange}
                          errors={(form.formState.errors as any)?.bookingTypes as any[]}
                        />
                        {fieldState.error && typeof fieldState.error.message === "string" && (
                          <p className="text-xs text-red-600 mt-2">{fieldState.error.message}</p>
                        )}
                      </>
                    )}
                  />
                </TabsContent>

                <TabsContent value="flags" className="mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { name: "trending", label: "Trending" },
                      { name: "hot", label: "Hot" },
                      { name: "verified", label: "Verified" },
                      { name: "isActive", label: "Active" },
                    ].map(({ name, label }) => (
                      <div key={name} className="flex items-center gap-2" data-field={name}>
                        <Controller
                          name={name as any}
                          control={form.control}
                          render={({ field }) => (
                            <input type="checkbox" checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} className="h-4 w-4" />
                          )}
                        />
                        <Label>{label}</Label>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
                <Button type="submit">{editingId ? "Save Changes" : "Create Celebrity"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* VIEW DETAILS */}
        <Dialog open={!!viewRow} onOpenChange={(o) => { if (!o) setViewRow(null) }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Celebrity Details</DialogTitle>
              <DialogDescription>{viewRow?.name}</DialogDescription>
            </DialogHeader>
            {viewRow && (
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <img src={viewRow.image || "/placeholder.svg"} className="w-24 h-24 rounded-md object-cover border" alt="" />
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {viewRow.trending && <Badge className="bg-emerald-900 text-white">Trending</Badge>}
                      {viewRow.hot && <Badge className="bg-orange-500 text-white">Hot</Badge>}
                      {viewRow.verified && <Badge className="bg-blue-500 text-white">Verified</Badge>}
                      {viewRow.isActive ? <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge> : <Badge className="bg-zinc-100 text-zinc-700 border-zinc-200">Inactive</Badge>}
                    </div>
                    <p className="text-sm text-zinc-700">{viewRow.description}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <ShareButton title={`Book ${viewRow.name}`} url={`${typeof window !== "undefined" ? window.location.origin : ""}/celebrities/${viewRow.slug || viewRow._id}`} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card><CardContent className="pt-4"><div className="text-xs text-zinc-500">Category</div><div className="font-semibold">{viewRow.category}</div></CardContent></Card>
                  <Card><CardContent className="pt-4"><div className="text-xs text-zinc-500">Base Price</div><div className="font-semibold">{fmtMoney(viewRow.basePrice)}</div></CardContent></Card>
                  <Card><CardContent className="pt-4"><div className="text-xs text-zinc-500">Availability</div><div className="font-semibold">{viewRow.availability}</div></CardContent></Card>
                  <Card><CardContent className="pt-4"><div className="text-xs text-zinc-500">Response Time</div><div className="font-semibold">{viewRow.responseTime || "—"}</div></CardContent></Card>
                </div>

                <div>
                  <div className="text-sm font-semibold mb-2">Tags</div>
                  <div className="flex flex-wrap gap-2">{(viewRow.tags || []).map((t, i) => <Badge key={i} variant="outline">{t}</Badge>)}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold mb-2">Achievements</div>
                  <ul className="list-disc list-inside text-sm text-zinc-700 space-y-1">{(viewRow.achievements || []).map((a, i) => <li key={i}>{a}</li>)}</ul>
                </div>

                <div>
                  <div className="text-sm font-semibold mb-2">Booking Types</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(viewRow.bookingTypes || []).map((bt, i) => (
                      <Card key={i}><CardContent className="pt-4">
                        <div className="font-semibold">{bt.name} • {bt.duration}</div>
                        <div className="text-sm text-zinc-600 mb-1">{bt.description}</div>
                        <div className="text-sm">{fmtMoney(bt.price)}</div>
                      </CardContent></Card>
                    ))}
                    {(!viewRow.bookingTypes || viewRow.bookingTypes.length === 0) && <div className="text-sm italic text-zinc-500">No booking types</div>}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewRow(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* BOOKINGS HISTORY (decoupled from Details) */}
        <Dialog
          open={bookingsOpen}
          onOpenChange={(o) => {
            setBookingsOpen(o)
            if (!o) {
              setBookings([])
              setBookingsPage(1)
              setBookingsLimit(10)
              setBookingsRow(null)
            }
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Bookings — {bookingsRow?.name}</DialogTitle>
              <DialogDescription>History for this celebrity</DialogDescription>
            </DialogHeader>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-zinc-50">
                    <TableHead>Booking ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookingsLoading ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-zinc-500"><RefreshCw className="size-4 animate-spin inline mr-2" /> Loading…</TableCell></TableRow>
                  ) : bookings.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-zinc-500">No bookings</TableCell></TableRow>
                  ) : bookings.map((b) => (
                    <TableRow key={b._id}>
                      <TableCell className="font-mono text-xs">{b._id}</TableCell>
                      <TableCell className="text-sm">
                        {(typeof b.user === "object"
                          ? (b.user?.email || `${(b as any).user?.firstName ?? ""} ${(b as any).user?.lastName ?? ""}`.trim())
                          : String(b.user)) || "—"}
                      </TableCell>
                      <TableCell className="text-sm">{b.bookingTypeName}</TableCell>
                      <TableCell>{b.quantity}</TableCell>
                      <TableCell>{fmtMoney(b.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("uppercase", b.status === "PAID" ? "border-green-600 text-green-700" : "border-zinc-400")}>
                          {b.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{fmtDate(b.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <PaginationControls page={bookingsPage} limit={bookingsLimit} total={bookingsTotal} onPage={setBookingsPage} onLimit={(l) => { setBookingsLimit(l); setBookingsPage(1) }} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setBookingsOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* CONFIRMS */}
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Please confirm"
          description="Are you sure you want to proceed?"
          confirmText="Confirm"
          confirmVariant="destructive"
          confirming={confirming}
          onConfirm={doConfirm}
          tone="danger"
        />
        <ConfirmDialog
          open={saveConfirmOpen}
          onOpenChange={setSaveConfirmOpen}
          title={editingId ? "Save Changes" : "Create Celebrity"}
          description={editingId ? "Save these updates?" : "Create this celebrity?"}
          confirmText={editingId ? "Save" : "Create"}
          confirmVariant="default"
          confirming={form.formState.isSubmitting}
          onConfirm={form.handleSubmit(onSave)}
          icon={<Check className="size-4" />}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
