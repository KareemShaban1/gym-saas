import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  const sorted = useMemo(() => [...commissions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [commissions]);

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
              {sorted.map(c => (
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommissionPanel;
