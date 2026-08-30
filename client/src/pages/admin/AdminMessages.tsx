import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import * as contactService from "../../services/contactService";

export default function AdminMessages() {
  const queryClient = useQueryClient();
  const { data: messages, isLoading } = useQuery({
    queryKey: ["contact", "admin"],
    queryFn: contactService.getMessages,
  });

  const readMutation = useMutation({
    mutationFn: contactService.markMessageRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contact"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: contactService.deleteMessage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contact"] }),
  });

  const unreadCount = (messages ?? []).filter((m) => !m.isRead).length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900">Messages</h1>
      <p className="mt-1 text-navy-500">
        Messages sent through the Contact Us page{unreadCount > 0 ? ` · ${unreadCount} unread` : ""}.
      </p>

      <div className="mt-6 space-y-3">
        {isLoading && <p className="text-navy-500">Loading…</p>}
        {messages?.map((m) => (
          <div
            key={m.id}
            className={`card p-4 ${!m.isRead ? "border-amber-200 bg-amber-50/40" : ""}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {m.isRead ? (
                    <MailOpen className="h-4 w-4 shrink-0 text-navy-300" />
                  ) : (
                    <Mail className="h-4 w-4 shrink-0 text-amber-500" />
                  )}
                  <p className="font-medium text-navy-900">{m.name}</p>
                  <span className="text-sm text-navy-400">{m.email}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-navy-600">{m.message}</p>
                <p className="mt-2 text-xs text-navy-400">{new Date(m.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {!m.isRead && (
                  <button
                    className="btn-secondary"
                    disabled={readMutation.isPending}
                    onClick={() => readMutation.mutate(m.id)}
                  >
                    Mark read
                  </button>
                )}
                <button
                  className="flex items-center gap-1.5 text-sm font-medium text-rose-600 hover:underline"
                  disabled={deleteMutation.isPending}
                  onClick={() => {
                    if (confirm("Delete this message? This can't be undone.")) deleteMutation.mutate(m.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {messages?.length === 0 && <p className="text-navy-500">No messages yet.</p>}
      </div>
    </div>
  );
}