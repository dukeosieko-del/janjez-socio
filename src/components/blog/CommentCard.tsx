"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDown, ChevronRight, Reply } from "./icons";
import type { BlogComment } from "@/lib/blog/types";

interface CommentCardProps {
  comment: BlogComment;
  depth?: number;
  currentUserId: string | null;
  onReply: (parent_id: string) => void;
  onReport: (id: string) => void;
}

const DEFAULT_AVATAR = "/avatar-placeholder.png";

function getAuthorInfo(comment: BlogComment) {
  if (comment.author) {
    return {
      name: comment.author.full_name || comment.author.email || "Anonymous",
      avatar: comment.author.avatar_url || DEFAULT_AVATAR,
    };
  }
  if (comment.author_name) {
    return {
      name: comment.author_name,
      avatar: DEFAULT_AVATAR,
    };
  }
  return {
    name: "Anonymous",
    avatar: DEFAULT_AVATAR,
  };
}

export default function CommentCard({
  comment,
  depth = 0,
  currentUserId,
  onReply,
  onReport,
}: CommentCardProps) {
  const [showReplies, setShowReplies] = useState(depth < 2 ? true : false);

  const authorInfo = getAuthorInfo(comment);
  const hasReplies = comment.replies && comment.replies.length > 0;
  const isOwnComment = currentUserId && comment.user_id === currentUserId;

  return (
    <div className="border-l-2 border-kenya-white/5 pl-4 ml-2">
      <div className="bg-kenya-white/3 border border-kenya-white/5 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-kenya-white/10">
            <Image
              src={authorInfo.avatar}
              alt={authorInfo.name}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-kenya-white text-sm">
                {authorInfo.name}
              </span>
              <span className="text-xs text-kenya-white/40">
                {new Date(comment.created_at).toLocaleDateString("en-KE", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            <p className="text-kenya-white/80 text-sm leading-relaxed break-words">
              {comment.content}
            </p>

            <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {!isOwnComment && (
                <button
                  onClick={() => onReply(comment.id)}
                  className="flex items-center gap-1 text-xs text-kenya-white/50 hover:text-kenya-green transition-colors"
                >
                  <Reply className="w-3 h-3" />
                  Reply
                </button>
              )}
              {!isOwnComment && (
                <button
                  onClick={() => onReport(comment.id)}
                  className="text-xs text-kenya-white/50 hover:text-kenya-red transition-colors"
                >
                  Report
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {hasReplies && (
        <button
          onClick={() => setShowReplies(!showReplies)}
          className="flex items-center gap-1 text-xs text-kenya-white/40 hover:text-kenya-white/70 transition-colors mt-2"
        >
          {showReplies ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
          {showReplies
            ? `Hide ${comment.replies!.length} repl${comment.replies!.length === 1 ? 'y' : 'ies'}`
            : `Show ${comment.replies!.length} repl${comment.replies!.length === 1 ? 'y' : 'ies'}`}
        </button>
      )}

      {showReplies && hasReplies && (
        <div className="mt-2">
          {comment.replies!.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              currentUserId={currentUserId}
              onReply={onReply}
              onReport={onReport}
            />
          ))}
        </div>
      )}
    </div>
  );
}
