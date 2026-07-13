"use client";

import { useState, useTransition } from "react";
import { Check, X, MessageSquare, Trash2, Loader2, Send } from "lucide-react";
import { toggleReviewApproval, deleteReviewAction, submitAdminReply } from "@/actions/admin-review";

type ReviewActionsProps = {
  review: {
    id: string;
    isApproved: boolean;
    adminReply: string | null;
  };
};

export function ReviewActions({ review }: ReviewActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState(review.adminReply || "");

  const handleToggleApprove = () => {
    startTransition(async () => {
      await toggleReviewApproval(review.id, !review.isApproved);
    });
  };

  const handleDelete = () => {
    if (confirm("آیا از حذف این نظر اطمینان دارید؟")) {
      startTransition(async () => {
        await deleteReviewAction(review.id);
      });
    }
  };

  const handleReplySubmit = () => {
    startTransition(async () => {
      await submitAdminReply(review.id, replyText);
      setIsReplying(false);
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* دکمه‌های عملیات اصلی */}
      <div className="flex items-center gap-2">
        {/* دکمه تایید / رد */}
        <button 
          onClick={handleToggleApprove} 
          disabled={isPending}
          title={review.isApproved ? "رد کردن نظر" : "تایید نظر"}
          className={`p-2 rounded-xl border transition-colors flex items-center justify-center ${
            review.isApproved 
              ? "bg-green-500/10 border-green-500/30 text-green-500 hover:bg-green-500/20" 
              : "bg-secondary/40 border-border text-muted-foreground hover:bg-secondary/60"
          }`}
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : (review.isApproved ? <Check className="size-4" /> : <X className="size-4" />)}
        </button>

        {/* دکمه پاسخ دادن */}
        <button 
          onClick={() => setIsReplying(!isReplying)}
          className={`p-2 rounded-xl border transition-colors flex items-center justify-center ${
            review.adminReply 
              ? "bg-gold/10 border-gold/30 text-gold" 
              : "bg-secondary/40 border-border text-muted-foreground hover:text-gold hover:border-gold/30"
          }`}
          title="پاسخ به نظر"
        >
          <MessageSquare className="size-4" />
        </button>

        {/* دکمه حذف */}
        <button 
          onClick={handleDelete}
          disabled={isPending}
          className="p-2 rounded-xl border border-border bg-secondary/40 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-colors flex items-center justify-center"
          title="حذف نظر"
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
        </button>
      </div>

      {/* باکس ثبت پاسخ (فقط وقتی باز شود نمایش داده می‌شود) */}
      {isReplying && (
        <div className="flex flex-col gap-2 mt-2 bg-background p-3 rounded-xl border border-border">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="پاسخ مدیریت..."
            rows={3}
            className="w-full text-sm bg-secondary/20 border border-border rounded-lg p-2 focus:outline-none focus:border-gold resize-none"
          />
          <div className="flex justify-end gap-2 mt-1">
            <button 
              onClick={() => setIsReplying(false)}
              className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              انصراف
            </button>
            <button 
              onClick={handleReplySubmit}
              disabled={isPending || !replyText.trim()}
              className="flex items-center gap-1.5 bg-gold text-[#0a0f1c] px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-yellow-500 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="size-3 animate-spin" /> : <Send className="size-3" />}
              ثبت پاسخ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}