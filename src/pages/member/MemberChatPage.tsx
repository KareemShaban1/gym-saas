import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { memberApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface Conversation {
  trainer: { id: number; name: string };
  last_message: { body: string; sender_type: string; created_at: string } | null;
}

export default function MemberChatPage() {
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["member", "conversations"],
    queryFn: () => memberApi.get<Conversation[]>("/conversations"),
  });

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto">
      <h1 className="text-xl font-display font-bold">Chat</h1>
      <p className="text-sm text-muted-foreground">Message your trainer.</p>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : conversations.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">No conversations yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Start by asking your trainer a question at the gym.</p>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {conversations.map((c) => (
            <li key={c.trainer.id}>
              <Link to={`/member/chat/${c.trainer.id}`}>
                <Card className="transition-colors hover:bg-muted/50 active:scale-[0.99]">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-medium text-primary">
                        {c.trainer.name.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{c.trainer.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {c.last_message
                          ? `${c.last_message.sender_type === "member" ? "You" : "Trainer"}: ${c.last_message.body}`
                          : "No messages yet"}
                      </p>
                    </div>
                    {c.last_message && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {format(new Date(c.last_message.created_at), "MMM d")}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
