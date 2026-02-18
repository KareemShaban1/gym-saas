import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Plus, Search, Settings } from "lucide-react";
import { Expense } from "@/data/payments";
import { ApiExpenseCategory } from "@/types/api";
import { api } from "@/lib/api";
import { format } from "date-fns";
import ExpenseCategoriesDialog from "./ExpenseCategoriesDialog";

interface Props {
  expenses: Expense[];
  onAddExpense?: (payload: { title: string; category_id: number; amount: number; date: string; note?: string }) => void;
}

const ExpenseRecords = ({ expenses, onAddExpense }: Props) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category_id: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    note: "",
  });
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: categoriesList = [] } = useQuery({
    queryKey: ["expense-categories"],
    queryFn: async () => {
      const res = await api.get<ApiExpenseCategory[]>("/expense-categories");
      return Array.isArray(res) ? res : [];
    },
  });

  // Set default category when categories load
  useEffect(() => {
    if (categoriesList.length > 0 && !form.category_id) {
      setForm((f) => ({ ...f, category_id: String(categoriesList[0].id) }));
    }
  }, [categoriesList.length]);

  const filtered = useMemo(
    () =>
      expenses
        .filter((e) =>
          e.title.toLowerCase().includes(search.toLowerCase()) ||
          e.note?.toLowerCase().includes(search.toLowerCase())
        )
        .filter((e) => (categoryFilter === "all" ? true : e.categoryId === categoryFilter))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [expenses, search, categoryFilter]
  );

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter]);

  const handleAdd = () => {
    if (!onAddExpense) return;
    if (!form.title || !form.amount || !form.category_id) return;

    onAddExpense({
      title: form.title.trim(),
      category_id: Number(form.category_id),
      amount: Number(form.amount),
      date: form.date,
      note: form.note.trim() || undefined,
    });

    setForm({
      title: "",
      category_id: categoriesList.length > 0 ? String(categoriesList[0].id) : "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      note: "",
    });
    setOpen(false);
  };

  const getCategoryColor = (category: Expense["categoryObj"] | null) => {
    if (!category) return "bg-muted text-muted-foreground border-border";
    if (category.color) {
      return `border-[${category.color}]`;
    }
    // Default colors based on slug
    const slugColors: Record<string, string> = {
      rent: "bg-destructive/15 text-destructive border-destructive/30",
      utilities: "bg-info/15 text-info border-info/30",
      equipment: "bg-primary/15 text-primary border-primary/30",
      maintenance: "bg-accent text-accent-foreground border-accent-foreground/30",
      marketing: "bg-success/15 text-success border-success/30",
      supplies: "bg-muted text-muted-foreground border-border",
      other: "bg-muted text-muted-foreground border-border",
    };
    return slugColors[category.slug] || "bg-muted text-muted-foreground border-border";
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base">Expense Records</CardTitle>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search expense..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 w-48"
                />
              </div>
              <Select
                value={categoryFilter === "all" ? "all" : String(categoryFilter)}
                onValueChange={(v) => setCategoryFilter(v === "all" ? "all" : Number(v))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categoriesList.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCategoriesOpen(true)}
                title="Manage categories"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" disabled={!onAddExpense || categoriesList.length === 0}>
                  <Plus className="w-4 h-4 mr-1" /> Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Record New Expense</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Electricity Bill" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Category</Label>
                      <Select value={form.category_id} onValueChange={v => setForm(f => ({ ...f, category_id: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          {categoriesList.map((cat) => (
                            <SelectItem key={cat.id} value={String(cat.id)}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Amount (EGP)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={form.amount}
                        onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={form.date}
                        onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                      />
                    </div>
                    <div className="hidden sm:block" />
                  </div>
                  <div><Label>Note (optional)</Label><Input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} /></div>
                  <Button className="w-full" onClick={handleAdd} disabled={!form.title || !form.amount || !form.category_id}>Save Expense</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {paginatedData.map(e => {
                  const category = e.categoryObj || (e.categoryId ? categoriesList.find(c => c.id === e.categoryId) : null);
                  return (
                    <motion.tr key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b transition-colors hover:bg-muted/50">
                      <TableCell className="font-medium">{e.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getCategoryColor(category)}>
                          {category?.name || e.category || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-destructive">{e.amount.toLocaleString()} EGP</TableCell>
                      <TableCell className="text-muted-foreground">{format(new Date(e.date), "dd MMM yyyy")}</TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
              {paginatedData.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No expenses found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} expenses
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
      <ExpenseCategoriesDialog open={categoriesOpen} onOpenChange={setCategoriesOpen} />
    </div>
  );
};

export default ExpenseRecords;
