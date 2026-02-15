import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search } from "lucide-react";
import { Expense, ExpenseCategory, expenseCategoryLabels } from "@/data/payments";
import { format } from "date-fns";

interface Props {
  expenses: Expense[];
  onAddExpense?: (payload: { title: string; category: ExpenseCategory; amount: number; date: string; note?: string }) => void;
}

const catColors: Record<ExpenseCategory, string> = {
  rent: "bg-destructive/15 text-destructive border-destructive/30",
  utilities: "bg-info/15 text-info border-info/30",
  equipment: "bg-primary/15 text-primary border-primary/30",
  maintenance: "bg-accent text-accent-foreground border-accent-foreground/30",
  marketing: "bg-success/15 text-success border-success/30",
  supplies: "bg-muted text-muted-foreground border-border",
  other: "bg-muted text-muted-foreground border-border",
};

const ExpenseRecords = ({ expenses, setExpenses }: Props) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", category: "other" as ExpenseCategory, amount: "", note: "" });

  const filtered = expenses.filter(e => e.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAdd = () => {
    if (!form.title || !form.amount) return;
    setExpenses(prev => [{
      id: Date.now(), title: form.title, category: form.category,
      amount: Number(form.amount), date: new Date().toISOString().split("T")[0],
      note: form.note || undefined,
    }, ...prev]);
    setForm({ title: "", category: "other", amount: "", note: "" });
    setOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <CardTitle className="text-base">Expense Records</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search expense..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-48" />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" disabled={!onAddExpense}><Plus className="w-4 h-4 mr-1" /> Add Expense</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Record New Expense</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Electricity Bill" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as ExpenseCategory }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{Object.entries(expenseCategoryLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Amount (EGP)</Label><Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" /></div>
                </div>
                <div><Label>Note (optional)</Label><Input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} /></div>
                <Button className="w-full" onClick={handleAdd}>Save Expense</Button>
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
              {filtered.map(e => (
                <motion.tr key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b transition-colors hover:bg-muted/50">
                  <TableCell className="font-medium">{e.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={catColors[e.category]}>{expenseCategoryLabels[e.category]}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-destructive">{e.amount.toLocaleString()} EGP</TableCell>
                  <TableCell className="text-muted-foreground">{format(new Date(e.date), "dd MMM yyyy")}</TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No expenses found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ExpenseRecords;
