import { ErrorState, PageLoader } from "@/components/store/States";
import { formatDate } from "@/lib/store";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function MessagesPanel() {
  const messages = trpc.admin.messages.useQuery();
  const utils = trpc.useUtils();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const refresh = () => {
    utils.admin.messages.invalidate();
    utils.admin.stats.invalidate();
  };
  const setRead = trpc.admin.setMessageRead.useMutation({ onSuccess: refresh });
  const remove = trpc.admin.deleteMessage.useMutation({
    onSuccess: () => {
      toast.success("حُذفت الرسالة");
      setSelectedId(null);
      refresh();
    },
  });

  if (messages.isLoading) return <PageLoader />;
  if (messages.error) return <ErrorState onRetry={() => messages.refetch()} />;
  const list = messages.data ?? [];
  if (list.length === 0) return <p className="py-20 text-center text-muted-foreground">لا توجد رسائل حتى الآن.</p>;

  const selected = list.find(m => m.id === selectedId) ?? null;

  const open = (id: number, isRead: boolean) => {
    setSelectedId(id);
    if (!isRead) setRead.mutate({ id, isRead: true });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <ul className="max-h-[70vh] divide-y overflow-y-auto border bg-card lg:col-span-2">
        {list.map(m => (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => open(m.id, m.isRead)}
              className={cn("block w-full p-5 text-right transition hover:bg-accent/50", selectedId === m.id && "bg-accent")}
            >
              <div className="flex items-center justify-between gap-3">
                <span className={cn("flex items-center gap-2", !m.isRead && "font-bold")}>
                  {!m.isRead && <span className="size-2 rounded-full bg-primary" />}
                  {m.name}
                </span>
                <span className="text-xs text-muted-foreground">{formatDate(m.createdAt)}</span>
              </div>
              <p className="mt-1 text-sm text-primary">{m.subject}</p>
              <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{m.message}</p>
            </button>
          </li>
        ))}
      </ul>
      <div className="border bg-card p-8 lg:col-span-3">
        {selected ? (
          <article>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-light">{selected.subject}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {selected.name} · <a href={`mailto:${selected.email}`} className="text-primary link-underline">{selected.email}</a>
                  {selected.phone && <> · <span dir="ltr">{selected.phone}</span></>}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(selected.createdAt)}</p>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label={selected.isRead ? "تعليم كغير مقروءة" : "تعليم كمقروءة"}
                  onClick={() => setRead.mutate({ id: selected.id, isRead: !selected.isRead })}
                  className="grid size-9 place-items-center hover:bg-accent"
                >
                  {selected.isRead ? <Mail className="size-4" /> : <MailOpen className="size-4" />}
                </button>
                <button type="button" aria-label="حذف" onClick={() => remove.mutate({ id: selected.id })} className="grid size-9 place-items-center hover:bg-accent hover:text-destructive">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
            <div className="hairline my-6" />
            <p className="leading-loose whitespace-pre-wrap">{selected.message}</p>
            <a href={`mailto:${selected.email}?subject=${encodeURIComponent(`رد: ${selected.subject}`)}`} className="btn-sea mt-8">
              الرد بالبريد
            </a>
          </article>
        ) : (
          <p className="grid h-full min-h-40 place-items-center text-muted-foreground">اختاري رسالة لعرضها.</p>
        )}
      </div>
    </div>
  );
}
