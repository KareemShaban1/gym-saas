import { useState, useMemo, useEffect } from "react";
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
import { Plus, Search } from "lucide-react";
import { Payment, PaymentCategory, PaymentMethod, paymentCategoryLabels, paymentMethodLabels } from "@/data/payments";
import { format } from "date-fns";

export interface MemberWithPlan {
  id: number;
  name: string;
  gym_plan?: { id: number; name: string; price: number } | null;
  gymPlan?: { id: number; name: string; price: number } | null;
}

interface Props {
  payments: Payment[];
  setPayments?: React.Dispatch<React.SetStateAction<Payment[]>>;
  members?: MemberWithPlan[];
  onAddPayment?: (payload: { member_id: number; category: string; amount: number; method: string; date: string; note?: string }) => void;
}

const methodColors: Record<PaymentMethod, string> = {
  cash: "bg-success/15 text-success border-success/30",
  card: "bg-info/15 text-info border-info/30",
  bank_transfer: "bg-primary/15 text-primary border-primary/30",
  mobile_wallet: "bg-accent text-accent-foreground border-accent-foreground/30",
};

const PaymentRecords = ({ payments, setPayments, members = [], onAddPayment }: Props) => {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [form, setForm] = useState({
    memberId: "",
    memberName: "",
    category: "subscription" as PaymentCategory,
    planAmount: 0,
    additionalFees: "",
    additionalFeeNotes: "",
    amount: "",
    method: "cash" as PaymentMethod,
    date: new Date().toISOString().split("T")[0],
    note: "",
  });
  const useApi = Boolean(onAddPayment && members.length > 0);

  const additionalFeesNum = Number(form.additionalFees) || 0;
  const totalAmount = useApi ? form.planAmount + additionalFeesNum : Number(form.amount) || 0;

  const handleMemberChange = (memberId: string) => {
    const m = members.find((mem) => String(mem.id) === memberId);
    const planPrice = m ? Number((m.gym_plan ?? (m as MemberWithPlan).gymPlan)?.price ?? 0) : 0;
    setForm((f) => ({ ...f, memberId, planAmount: planPrice }));
  };

  const filtered = useMemo(() => 
    payments.filter(p => {
      const matchSearch = p.memberName.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCategory === "all" || p.category === filterCategory;
      return matchSearch && matchCat;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [payments, search, filterCategory]
  );

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterCategory]);

  const handleAdd = () => {
    if (useApi && onAddPayment) {
      const memberId = form.memberId ? Number(form.memberId) : 0;
      if (!memberId || totalAmount < 0) return;
      const noteParts: string[] = [];
      if (form.note) noteParts.push(form.note);
      if (additionalFeesNum > 0) {
        const feeNote = form.additionalFeeNotes ? ` - ${form.additionalFeeNotes}` : "";
        noteParts.push(`Additional: ${additionalFeesNum} EGP${feeNote}`);
      }
      onAddPayment({
        member_id: memberId,
        category: form.category,
        amount: totalAmount,
        method: form.method,
        date: form.date,
        note: noteParts.length ? noteParts.join(" | ") : undefined,
      });
      setForm({
        memberId: "",
        memberName: "",
        category: "subscription",
        planAmount: 0,
        additionalFees: "",
        additionalFeeNotes: "",
        amount: "",
        method: "cash",
        date: new Date().toISOString().split("T")[0],
        note: "",
      });
      setOpen(false);
      return;
    }

    const amount = Number(form.amount);
    if (!form.memberName || !form.amount || amount < 0) return;
    const newPayment: Payment = {
      id: Date.now(),
      memberName: form.memberName,
      category: form.category,
      amount,
      method: form.method,
      date: form.date,
      note: form.note || undefined,
    };
    setPayments?.(prev => [newPayment, ...prev]);
    setForm({
      memberId: "",
      memberName: "",
      category: "subscription",
      planAmount: 0,
      additionalFees: "",
      additionalFeeNotes: "",
      amount: "",
      method: "cash",
      date: new Date().toISOString().split("T")[0],
      note: "",
    });
    setOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <CardTitle className="text-base">Payment Records</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search member..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-48" />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(paymentCategoryLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Record Payment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Record New Payment</DialogTitle></DialogHeader>
              <div className="space-y-4">
                {useApi ? (
                  <div>
                    <Label>Member</Label>
                    <Select value={form.memberId} onValueChange={handleMemberChange}>
                      <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                      <SelectContent>
                        {members.map(m => (<SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div><Label>Member Name</Label><Input value={form.memberName} onChange={e => setForm(f => ({ ...f, memberName: e.target.value }))} placeholder="e.g. Ahmed Hassan" /></div>
                )}
                {useApi && (
                  <>
                    <div>
                      <Label>Plan amount (EGP)</Label>
                      <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm">{form.planAmount.toLocaleString()} EGP</div>
                    </div>
                    <div>
                      <Label>Additional fees (EGP)</Label>
                      <Input type="number" min={0} step={0.01} value={form.additionalFees} onChange={e => setForm(f => ({ ...f, additionalFees: e.target.value }))} placeholder="0" />
                    </div>
                    <div>
                      <Label>Additional fee notes</Label>
                      <Input value={form.additionalFeeNotes} onChange={e => setForm(f => ({ ...f, additionalFeeNotes: e.target.value }))} placeholder="e.g. Late fee, locker" />
                    </div>
                    <div>
                      <Label>Total (EGP)</Label>
                      <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 font-semibold">{totalAmount.toLocaleString()} EGP</div>
                    </div>
                  </>
                )}
                {!useApi && <div><Label>Amount (EGP)</Label><Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" /></div>}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as PaymentCategory }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{Object.entries(paymentCategoryLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Method</Label>
                    <Select value={form.method} onValueChange={v => setForm(f => ({ ...f, method: v as PaymentMethod }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{Object.entries(paymentMethodLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
                <div><Label>Note (optional)</Label><Input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="General note" /></div>
                <Button className="w-full" onClick={handleAdd} disabled={(useApi && !form.memberId) || (useApi ? totalAmount < 0 : !form.amount)}>Save Payment</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {paginatedData.map(p => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{p.memberName}</TableCell>
                  <TableCell>{paymentCategoryLabels[p.category]}</TableCell>
                  <TableCell className="font-semibold">{p.amount.toLocaleString()} EGP</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={methodColors[p.method]}>
                      {paymentMethodLabels[p.method]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{format(new Date(p.date), "dd MMM yyyy")}</TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
            {paginatedData.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No payments found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} payments
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
  );
};

export default PaymentRecords;
