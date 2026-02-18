import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trainerApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { Plus, Search, User, Key, TrendingUp } from "lucide-react";
import { useTrainerAuth } from "@/contexts/TrainerAuthContext";

interface MemberRow {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status?: string;
  plan_type?: string;
}

export default function TrainerMembersPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { trainer } = useTrainerAuth();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const gyms = trainer?.gyms?.length ? trainer.gyms : (trainer?.gym ? [trainer.gym] : []);
  const [portalPasswordMember, setPortalPasswordMember] = useState<MemberRow | null>(null);
  const [portalPassword, setPortalPassword] = useState("");
  const [portalPasswordConfirm, setPortalPasswordConfirm] = useState("");

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["trainer", "members", search],
    queryFn: async () => {
      const res = await trainerApi.get<MemberRow[] | { data: MemberRow[] }>("/members?per_page=100");
      const list = Array.isArray(res) ? res : (res as { data?: MemberRow[] }).data ?? [];
      return list;
    },
  });

  const filtered = search.trim()
    ? members.filter(
        (m) =>
          m.name?.toLowerCase().includes(search.toLowerCase()) ||
          m.email?.toLowerCase().includes(search.toLowerCase()) ||
          m.phone?.includes(search)
      )
    : members;

  const createMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => trainerApi.post<MemberRow>("/members", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainer", "members"] });
      setAddOpen(false);
      toast({ title: "Member added" });
    },
    onError: (e: Error) => toast({ title: "Failed to add member", description: e.message, variant: "destructive" }),
  });

  const portalPasswordMutation = useMutation({
    mutationFn: async ({ memberId, password }: { memberId: number; password: string }) =>
      trainerApi.put(`/members/${memberId}/portal-password`, { password, password_confirmation: password }),
    onSuccess: () => {
      setPortalPasswordMember(null);
      setPortalPassword("");
      setPortalPasswordConfirm("");
      toast({ title: "Portal password set. Member can sign in at the member app." });
    },
    onError: (e: Error) => toast({ title: "Failed to set password", description: e.message, variant: "destructive" }),
  });

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.querySelector('[name="name"]') as HTMLInputElement)?.value;
    const email = (form.querySelector('[name="email"]') as HTMLInputElement)?.value;
    const phone = (form.querySelector('[name="phone"]') as HTMLInputElement)?.value;
    const gender = (form.querySelector('[name="gender"]') as HTMLSelectElement)?.value;
    const gymIdEl = form.querySelector('[name="gym_id"]') as HTMLSelectElement | null;
    const gymId = gymIdEl?.value ? parseInt(gymIdEl.value, 10) : undefined;
    if (!name || !email || !phone || !gender) return;
    createMutation.mutate({ name, email, phone, gender, ...(gymId ? { gym_id: gymId } : {}) });
  };

  const handleSetPortalPassword = () => {
    if (!portalPasswordMember || portalPassword.length < 6 || portalPassword !== portalPasswordConfirm) {
      toast({ title: "Password must match and be at least 6 characters", variant: "destructive" });
      return;
    }
    portalPasswordMutation.mutate({ memberId: portalPasswordMember.id, password: portalPassword });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-display font-bold">Members</h1>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" className="gap-2">
              <Plus className="w-4 h-4" />
              Add member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add member</DialogTitle>
              <DialogDescription>Add a client. They can use the member app if you set a portal password.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input name="name" required placeholder="Full name" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input name="email" type="email" required placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input name="phone" required placeholder="Phone" />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <select name="gender" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              {gyms.length > 1 && (
                <div className="space-y-2">
                  <Label>Gym (optional)</Label>
                  <select name="gym_id" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">— Default —</option>
                    {gyms.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Adding…" : "Add"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" />
            Your members ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members yet. Add one to get started.</p>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((m) => (
                <li key={m.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{m.name}</p>
                    <p className="text-sm text-muted-foreground">{m.email}</p>
                    {m.phone && <p className="text-xs text-muted-foreground">{m.phone}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded bg-muted">{m.status ?? "Active"}</span>
                    <Link to={"/trainer/members/" + m.id + "/progress"}>
                      <Button variant="outline" size="sm" className="gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Progress
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => setPortalPasswordMember(m)}
                    >
                      <Key className="w-3 h-3" />
                      Portal password
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!portalPasswordMember} onOpenChange={(open) => !open && setPortalPasswordMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set member portal password</DialogTitle>
            <DialogDescription>
              {portalPasswordMember?.name} will be able to sign in to the member app with their email and this password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New password</Label>
              <Input
                type="password"
                value={portalPassword}
                onChange={(e) => setPortalPassword(e.target.value)}
                placeholder="Min 6 characters"
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm password</Label>
              <Input
                type="password"
                value={portalPasswordConfirm}
                onChange={(e) => setPortalPasswordConfirm(e.target.value)}
                placeholder="Same as above"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPortalPasswordMember(null)}>Cancel</Button>
            <Button onClick={handleSetPortalPassword} disabled={portalPassword.length < 6 || portalPassword !== portalPasswordConfirm || portalPasswordMutation.isPending}>
              {portalPasswordMutation.isPending ? "Saving…" : "Set password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
