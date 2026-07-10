"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteTagAction } from "@/actions/tag";

export default function DeleteTagButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`آیا از حذف برچسب "${name}" مطمئن هستید؟ محصولات متصل به این برچسب، آن را از دست می‌دهند.`)) {
      startTransition(async () => {
        await deleteTagAction(id);
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 text-muted-foreground transition-colors hover:text-red-500 hover:bg-red-500/10 rounded-lg"
      title="حذف برچسب"
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
    </button>
  );
}