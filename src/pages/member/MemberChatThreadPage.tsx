import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { memberApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  body: string;
  sender_type: string;
  created_at: string;
}

export default function MemberChatThreadPage() {
  const { trainerId } = useParams<{ trainerId: string }>();
  const [message, setMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: trainer } = useQuery({
    queryKey: ["member", "conversations"],
    queryFn: () => memberApi.get<{ trainer: { id: number; name: string } }[]>("/conversations"),
    select: (list) => list.find((c) => c.trainer.id === Number(trainerId))?.trainer,
    enabled: !!trainerId,
  });

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["member", "conversations", trainerId, "messages"],
    queryFn: () => memberApi.get<Message[]>(`/conversations/${trainerId}/messages`),
    enabled: !!trainerId,
  });

  const sendMessage = useMutation({
    mutationFn: (body: string) => memberApi.post(`/conversations/${trainerId}/messages`, { body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member", "conversations", trainerId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["member", "conversations"] });
      setMessage("");
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || sendMessage.isPending) return;
    sendMessage.mutate(trimmed);
  };

  if (!trainerId) {
    return (
      <div className="p-4">
        <Link to="/member/chat" className="text-sm text-muted-foreground">Back</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-lg mx-auto">
      <header className="flex items-center gap-3 p-4 border-b border-border shrink-0">
        <Link to="/member/chat" className="p-1 -ml-1 rounded-lg hover:bg-muted">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold truncate">{trainer?.name ?? "Trainer"}</h1>
          <p className="text-xs text-muted-foreground">Personal trainer</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No messages yet. Say hi!</p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={m.sender_type === "member" ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2 text-sm",
                  m.sender_type === "member"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted rounded-bl-md"
                )}
              >
                <p className="break-words">{m.body}</p>
                <p className={cn("text-xs mt-1", m.sender_type === "member" ? "text-primary-foreground/80" : "text-muted-foreground")}>
                  {format(new Date(m.created_at), "h:mm a")}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-border flex gap-2 shrink-0">
        <Input
          placeholder="Type a message…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          className="flex-1 min-w-0"
        />
        <Button onClick={handleSend} disabled={!message.trim() || sendMessage.isPending}>
          Send
        </Button>
      </div>
    </div>
  );
}
