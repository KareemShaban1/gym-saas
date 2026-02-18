import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Shield,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface ApiPermission {
  id: number;
  name: string;
  slug: string;
  group: string | null;
}

interface ApiRole {
  id: number;
  gym_id: number;
  name: string;
  slug: string;
  permissions?: ApiPermission[];
}

const RolesPage = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<ApiRole | null>(null);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: rolesList = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await api.get<ApiRole[]>("/roles");
      return Array.isArray(res) ? res : [];
    },
  });

  const { data: permissionsList = [] } = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const res = await api.get<ApiPermission[]>("/permissions");
      return Array.isArray(res) ? res : [];
    },
  });

  const createRole = useMutation({
    mutationFn: (payload: { name: string; slug?: string; permission_ids: number[] }) =>
      api.post<ApiRole>("/roles", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setFormOpen(false);
      resetForm();
    },
  });
  const updateRole = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: { name?: string; slug?: string; permission_ids: number[] };
    }) => api.put<ApiRole>(`/roles/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setFormOpen(false);
      setEditingRole(null);
      resetForm();
    },
  });
  const deleteRole = useMutation({
    mutationFn: (id: number) => api.delete(`/roles/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles"] }),
  });

  const resetForm = () => {
    setFormName("");
    setFormSlug("");
    setSelectedPermissionIds([]);
  };

  const openAdd = () => {
    setEditingRole(null);
    resetForm();
    setFormOpen(true);
  };
  const openEdit = (role: ApiRole) => {
    setEditingRole(role);
    setFormName(role.name);
    setFormSlug(role.slug);
    setSelectedPermissionIds(role.permissions?.map((p) => p.id) ?? []);
    setFormOpen(true);
  };

  const togglePermission = (id: number) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    if (!formName.trim()) {
      toast({ title: "Validation", description: "Role name is required.", variant: "destructive" });
      return;
    }
    const payload = {
      name: formName.trim(),
      slug: formSlug.trim() || formName.trim().toLowerCase().replace(/\s+/g, "-"),
      permission_ids: selectedPermissionIds,
    };
    if (editingRole) {
      updateRole.mutate(
        { id: editingRole.id, payload },
        {
          onSuccess: () => toast({ title: t("save"), description: formName }),
          onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
        }
      );
    } else {
      createRole.mutate(payload, {
        onSuccess: () => toast({ title: t("addRole"), description: formName }),
        onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
      });
    }
  };

  const handleDelete = (role: ApiRole) => {
    if (!confirm(t("remove") + " " + role.name + "?")) return;
    deleteRole.mutate(role.id, {
      onSuccess: () => toast({ title: t("remove"), description: role.name, variant: "destructive" }),
      onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  };

  const byGroup = permissionsList.reduce<Record<string, ApiPermission[]>>((acc, p) => {
    const g = p.group || "Other";
    if (!acc[g]) acc[g] = [];
    acc[g].push(p);
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold mb-1">{t("rolesTitle")}</h1>
          <p className="text-muted-foreground">{t("rolesDescription")}</p>
        </div>
        <Button variant="hero" className="gap-2" onClick={openAdd}>
          <Plus className="w-4 h-4" /> {t("addRole")}
        </Button>
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
                <th className="text-start font-medium text-muted-foreground px-6 py-3">{t("roleSlug")}</th>
                <th className="text-start font-medium text-muted-foreground px-6 py-3">{t("permissions")}</th>
                <th className="text-end font-medium text-muted-foreground px-6 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {rolesLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              ) : rolesList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    {t("noRolesFound")}
                  </td>
                </tr>
              ) : (
                rolesList.map((role) => (
                  <tr
                    key={role.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium">{role.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{role.slug}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {role.permissions?.length
                        ? `${role.permissions.length} ${t("permissions").toLowerCase()}`
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(role)}>
                            <Pencil className="w-4 h-4 me-2" /> {t("edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(role)}
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
      </motion.div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRole ? t("edit") : t("addRole")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t("name")}</Label>
              <Input
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                  if (!editingRole && !formSlug) setFormSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                }}
                placeholder="e.g. Receptionist"
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("roleSlug")}</Label>
              <Input
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                placeholder="receptionist"
                className="font-mono text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("permissions")}</Label>
              <div className="border border-border rounded-lg p-3 max-h-64 overflow-y-auto space-y-2">
                {Object.entries(byGroup).map(([group, perms]) => (
                  <Collapsible key={group} defaultOpen>
                    <CollapsibleTrigger className="flex items-center gap-2 w-full py-1.5 text-left font-medium text-sm">
                      <ChevronRight className="w-4 h-4 shrink-0 data-[state=open]:rotate-90" />
                      {group}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-6 pt-1 space-y-2">
                      {perms.map((p) => (
                        <label
                          key={p.id}
                          className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                        >
                          <Checkbox
                            checked={selectedPermissionIds.includes(p.id)}
                            onCheckedChange={() => togglePermission(p.id)}
                          />
                          <span>{p.name}</span>
                          <span className="font-mono text-xs opacity-70">{p.slug}</span>
                        </label>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleSave}>
              {editingRole ? t("save") : t("add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default RolesPage;
