import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Pencil, Trash2, Plus } from "lucide-react";
import { ApiExpenseCategory } from "@/types/api";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

interface ExpenseCategoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExpenseCategoriesDialog = ({ open, onOpenChange }: ExpenseCategoriesDialogProps) => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ApiExpenseCategory | null>(null);
  const [form, setForm] = useState({
    name: "",
    color: "#6b7280",
    description: "",
    sort_order: 0,
  });
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: categoriesList = [], isLoading } = useQuery({
    queryKey: ["expense-categories"],
    queryFn: async () => {
      const res = await api.get<ApiExpenseCategory[]>("/expense-categories");
      return Array.isArray(res) ? res : [];
    },
  });

  const createCategory = useMutation({
    mutationFn: (payload: { name: string; color?: string; description?: string; sort_order?: number }) =>
      api.post<ApiExpenseCategory>("/expense-categories", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
      setFormOpen(false);
      resetForm();
    },
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<ApiExpenseCategory> }) =>
      api.put<ApiExpenseCategory>(`/expense-categories/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
      setFormOpen(false);
      setEditingCategory(null);
      resetForm();
    },
  });

  const deleteCategory = useMutation({
    mutationFn: (id: number) => api.delete(`/expense-categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });

  const resetForm = () => {
    setForm({ name: "", color: "#6b7280", description: "", sort_order: 0 });
  };

  const openAdd = () => {
    setEditingCategory(null);
    resetForm();
    setFormOpen(true);
  };

  const openEdit = (cat: ApiExpenseCategory) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      color: cat.color || "#6b7280",
      description: cat.description || "",
      sort_order: cat.sort_order,
    });
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast({ title: "Validation", description: "Category name is required.", variant: "destructive" });
      return;
    }

    const payload = {
      name: form.name.trim(),
      color: form.color || null,
      description: form.description.trim() || null,
      sort_order: form.sort_order,
    };

    if (editingCategory) {
      updateCategory.mutate(
        { id: editingCategory.id, payload },
        {
          onSuccess: () => toast({ title: t("save"), description: form.name }),
          onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
        }
      );
    } else {
      createCategory.mutate(payload, {
        onSuccess: () => toast({ title: "Category created", description: form.name }),
        onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
      });
    }
  };

  const handleDelete = (cat: ApiExpenseCategory) => {
    if (!confirm(`Delete "${cat.name}"? Expenses using this category will need to be reassigned.`)) return;
    deleteCategory.mutate(cat.id, {
      onSuccess: () => toast({ title: t("remove"), description: cat.name, variant: "destructive" }),
      onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Expense Categories</DialogTitle>
              <Button size="sm" variant="outline" onClick={openAdd}>
                <Plus className="w-4 h-4 mr-1" /> Add Category
              </Button>
            </div>
          </DialogHeader>
          <div className="mt-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : categoriesList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No categories yet. Create your first category to start tracking expenses.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoriesList.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          style={cat.color ? { borderColor: cat.color, color: cat.color } : undefined}
                        >
                          {cat.color || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{cat.description || "—"}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(cat)}>
                              <Pencil className="w-4 h-4 me-2" /> {t("edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(cat)}
                            >
                              <Trash2 className="w-4 h-4 me-2" /> {t("remove")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? t("edit") : "Add Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Rent, Utilities"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Color (hex)</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                    className="w-16 h-10"
                  />
                  <Input
                    value={form.color}
                    onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                    placeholder="#6b7280"
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setFormOpen(false)}>
                {t("cancel")}
              </Button>
              <Button className="flex-1" onClick={handleSave}>
                {editingCategory ? t("save") : t("add")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExpenseCategoriesDialog;
