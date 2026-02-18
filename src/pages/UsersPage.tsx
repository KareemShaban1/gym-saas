import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserCog,
} from "lucide-react";

interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: string;
  gym_id: number;
  role_id: number | null;
  role_definition?: { id: number; name: string; slug: string };
}

interface ApiRole {
  id: number;
  name: string;
  slug: string;
}

const UsersPage = () => {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "gym_staff" as "gym_admin" | "gym_staff",
    role_id: "" as string | number,
  });
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: usersList = [], isLoading } = useQuery({
    queryKey: ["dashboard-users", search],
    queryFn: async () => {
      const params = new URLSearchParams({ per_page: "100" });
      if (search) params.set("search", search);
      const res = await api.get<ApiUser[] | { data: ApiUser[] }>(`/users?${params}`);
      return Array.isArray(res) ? res : (res as { data: ApiUser[] }).data ?? [];
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["roles"],
    queryFn: () => api.get<ApiRole[]>("/roles"),
  });

  const createUser = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post<ApiUser>("/users", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-users"] });
      setFormOpen(false);
      resetForm();
    },
  });
  const updateUser = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Record<string, unknown> }) =>
      api.put<ApiUser>(`/users/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-users"] });
      setFormOpen(false);
      setEditingUser(null);
      resetForm();
    },
  });
  const deleteUser = useMutation({
    mutationFn: (id: number) => api.delete(`/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard-users"] }),
  });

  const resetForm = () =>
    setForm({
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      role: "gym_staff",
      role_id: "",
    });

  const openAdd = () => {
    setEditingUser(null);
    resetForm();
    setFormOpen(true);
  };
  const openEdit = (u: ApiUser) => {
    setEditingUser(u);
    setForm({
      name: u.name,
      email: u.email,
      password: "",
      password_confirmation: "",
      role: u.role as "gym_admin" | "gym_staff",
      role_id: u.role_id ?? "",
    });
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: "Validation", description: "Name and email are required.", variant: "destructive" });
      return;
    }
    if (!editingUser && (!form.password || form.password.length < 8)) {
      toast({ title: "Validation", description: "Password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    if (form.role === "gym_staff" && !form.role_id) {
      toast({ title: "Validation", description: "Please select a role for staff.", variant: "destructive" });
      return;
    }
    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      role_id: form.role_id ? Number(form.role_id) : null,
    };
    if (form.password) {
      payload.password = form.password;
      payload.password_confirmation = form.password_confirmation;
    }
    if (editingUser) {
      updateUser.mutate(
        { id: editingUser.id, payload },
        {
          onSuccess: () => toast({ title: t("save"), description: form.name }),
          onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
        }
      );
    } else {
      createUser.mutate(payload, {
        onSuccess: () => toast({ title: t("addUser"), description: form.name }),
        onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
      });
    }
  };

  const handleDelete = (u: ApiUser) => {
    if (!confirm(t("remove") + " " + u.name + "?")) return;
    deleteUser.mutate(u.id, {
      onSuccess: () => toast({ title: t("remove"), description: u.name, variant: "destructive" }),
      onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  };

  const filtered = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold mb-1">{t("usersTitle")}</h1>
          <p className="text-muted-foreground">{t("usersDescription")}</p>
        </div>
        <Button variant="hero" className="gap-2" onClick={openAdd}>
          <Plus className="w-4 h-4" /> {t("addUser")}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rtl:left-auto rtl:right-3" />
          <Input
            placeholder={t("searchUsers")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9"
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl border border-border bg-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-start font-medium text-muted-foreground px-6 py-3">{t("name")}</th>
                <th className="text-start font-medium text-muted-foreground px-6 py-3">{t("email")}</th>
                <th className="text-start font-medium text-muted-foreground px-6 py-3">{t("role")}</th>
                <th className="text-end font-medium text-muted-foreground px-6 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    {t("noUsersFound")}
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <UserCog className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          u.role === "gym_admin"
                            ? "inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                            : "inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground"
                        }
                      >
                        {u.role === "gym_admin" ? t("gymAdmin") : u.role_definition?.name ?? t("gymStaff")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(u)}>
                            <Pencil className="w-4 h-4 me-2" /> {t("edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(u)}
                          >
                            <Trash2 className="w-4 h-4 me-2" /> {t("remove")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-border bg-muted/30 text-xs text-muted-foreground">
          {t("showing")} {filtered.length} {t("of")} {usersList.length}
        </div>
      </motion.div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? t("edit") : t("addUser")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="user-name">{t("name")}</Label>
              <Input
                id="user-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="John Doe"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user-email">{t("email")}</Label>
              <Input
                id="user-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="user@gym.com"
                disabled={!!editingUser}
              />
            </div>
            {!editingUser && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="user-password">{t("password")}</Label>
                  <Input
                    id="user-password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="user-password-confirm">{t("confirmPassword")}</Label>
                  <Input
                    id="user-password-confirm"
                    type="password"
                    value={form.password_confirmation}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, password_confirmation: e.target.value }))
                    }
                    placeholder="••••••••"
                  />
                </div>
              </>
            )}
            {editingUser && (
              <>
                <div className="grid gap-2">
                  <Label>{t("password")}</Label>
                  <Input
                    type="password"
                    placeholder="Leave blank to keep current"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t("confirmPassword")}</Label>
                  <Input
                    type="password"
                    placeholder="Leave blank to keep current"
                    value={form.password_confirmation}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, password_confirmation: e.target.value }))
                    }
                  />
                </div>
              </>
            )}
            <div className="grid gap-2">
              <Label>{t("role")}</Label>
              <Select
                value={form.role}
                onValueChange={(v: "gym_admin" | "gym_staff") =>
                  setForm((f) => ({ ...f, role: v, role_id: v === "gym_admin" ? "" : f.role_id }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gym_admin">{t("gymAdmin")}</SelectItem>
                  <SelectItem value="gym_staff">{t("gymStaff")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.role === "gym_staff" && (
              <div className="grid gap-2">
                <Label>{t("role")}</Label>
                <Select
                  value={String(form.role_id)}
                  onValueChange={(v) => setForm((f) => ({ ...f, role_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(roles)
                      ? roles.map((r) => (
                          <SelectItem key={r.id} value={String(r.id)}>
                            {r.name}
                          </SelectItem>
                        ))
                      : null}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleSave}>
              {editingUser ? t("save") : t("add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default UsersPage;
