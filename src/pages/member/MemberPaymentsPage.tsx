import { useQuery } from "@tanstack/react-query";
import { memberApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { format } from "date-fns";

interface Payment {
  id: number;
  category: string;
  amount: number;
  method: string;
  date: string;
  note?: string;
}

function safeFormat(dateInput: string | null | undefined, fmt: string): string {
  if (dateInput == null) return "—";
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return "—";
  return format(d, fmt);
}

export default function MemberPaymentsPage() {
  const { data: paymentsRaw, isLoading } = useQuery({
    queryKey: ["member", "payments"],
    queryFn: () => memberApi.get<Payment[] | { data: Payment[] }>("/payments?per_page=50"),
  });
  const payments = Array.isArray(paymentsRaw) ? paymentsRaw : (paymentsRaw as { data?: Payment[] } | undefined)?.data ?? [];

  const categoryLabel: Record<string, string> = {
    subscription: "Subscription",
    coin_purchase: "Coins",
    personal_training: "Personal training",
    supplement: "Supplement",
    merchandise: "Merchandise",
    other: "Other",
  };

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto">
      <h1 className="text-xl font-display font-bold">Payments</h1>
      <p className="text-sm text-muted-foreground">Your payment history.</p>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : payments.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">No payments yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">History</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {payments.map((p) => (
                <li
                  key={p.id}
                  className="flex justify-between items-start py-3 border-b border-border last:border-0"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {categoryLabel[p.category] ?? p.category}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {safeFormat(p.date, "MMM d, yyyy")} · {p.method.replace("_", " ")}
                    </p>
                  </div>
                  <span className="font-semibold text-sm">{Number(p.amount).toLocaleString()} EGP</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
