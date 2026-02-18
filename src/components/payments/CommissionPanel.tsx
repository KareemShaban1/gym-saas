import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { CommissionRecord } from "@/data/trainers";
import { format } from "date-fns";

interface Props {
  commissions: CommissionRecord[];
}

const typeColors: Record<string, string> = {
  session: "bg-info/15 text-info border-info/30",
  subscription: "bg-primary/15 text-primary border-primary/30",
  bonus: "bg-success/15 text-success border-success/30",
};

const CommissionPanel = ({ commissions }: Props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sorted = useMemo(() => [...commissions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [commissions]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sorted.slice(startIndex, startIndex + itemsPerPage);
  }, [sorted, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sorted.length / itemsPerPage);

  const totalPaid = useMemo(() => commissions.filter(c => c.status === "paid").reduce((s, c) => s + c.amount, 0), [commissions]);
  const totalPending = useMemo(() => commissions.filter(c => c.status === "pending").reduce((s, c) => s + c.amount, 0), [commissions]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Paid</p>
            <p className="text-2xl font-display font-bold text-success">{totalPaid.toLocaleString()} EGP</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Pending</p>
            <p className="text-2xl font-display font-bold text-destructive">{totalPending.toLocaleString()} EGP</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Commission History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trainer</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.trainerName ?? `Trainer #${c.trainerId}`}</TableCell>
                  <TableCell>{c.memberName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={typeColors[c.type]}>{c.type}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{c.amount.toLocaleString()} EGP</TableCell>
                  <TableCell>
                    <Badge variant={c.status === "paid" ? "default" : "destructive"}>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{format(new Date(c.date), "dd MMM yyyy")}</TableCell>
                </TableRow>
              ))}
              {paginatedData.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No commissions found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sorted.length)} of {sorted.length} commissions
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
    </div>
  );
};

export default CommissionPanel;
