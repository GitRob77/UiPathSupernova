"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@uipath/apollo-wind";
import { ScrollArea } from "@uipath/apollo-wind/components/ui/scroll-area";
import {
  ChevronRight,
  Plus,
  ArrowUp,
  Square,
  ArrowRight,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type UserMessage = {
  id: string;
  type: "user";
  text: string;
};

export type ReasoningMessage = {
  id: string;
  type: "reasoning";
  content: string;
  durationSeconds?: number;
  status: "streaming" | "complete";
};

export type AiReplyMessage = {
  id: string;
  type: "ai-reply";
  content: string;
  status: "streaming" | "complete";
};

export type ToolCallMessage = {
  id: string;
  type: "tool-call";
  label: string;
  status: "running" | "complete";
  children?: ToolCallMessage[];
  detail?: string;
  rationaleTitle?: string;
  rationale?: string;
};

export type AiBackgroundActivity = {
  id: string;
  type: "activity";
  text: string;
};

export type Message =
  | UserMessage
  | ReasoningMessage
  | AiReplyMessage
  | ToolCallMessage
  | AiBackgroundActivity;

export type ContextTag = {
  id: string;
  label: string;
};

/* ------------------------------------------------------------------ */
/*  User message                                                       */
/* ------------------------------------------------------------------ */

function UserMessageBlock({ message }: { message: UserMessage }) {
  return (
    <div className="ml-auto w-[80%] rounded-lg bg-[var(--color-background-secondary)] px-3 py-2 text-right">
      <p className="text-sm text-foreground">{message.text}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AI reply                                                           */
/* ------------------------------------------------------------------ */

function AiReply({ message }: { message: AiReplyMessage }) {
  return (
    <div className="text-sm text-foreground">
      <span className="whitespace-pre-wrap">{message.content}</span>
      {message.status === "streaming" && (
        <span className="ap-blink-cursor ml-0.5 inline-block h-4 w-[2px] translate-y-[2px] bg-foreground" />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reasoning block                                                    */
/* ------------------------------------------------------------------ */

function ReasoningBlock({ message }: { message: ReasoningMessage }) {
  const [isOpen, setIsOpen] = useState(message.status === "streaming");

  useEffect(() => {
    if (message.status === "complete") {
      const timer = setTimeout(() => setIsOpen(false), 300);
      return () => clearTimeout(timer);
    }
  }, [message.status]);

  const label =
    message.status === "streaming"
      ? "Reasoning\u2026"
      : `Reasoned${message.durationSeconds ? ` for ${message.durationSeconds}s` : ""}`;

  return (
    <div className="text-sm">
      <button
        type="button"
        className="flex w-full cursor-pointer items-center gap-1.5 text-muted-foreground hover:text-foreground"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <ChevronRight
          className={cn(
            "size-3.5 shrink-0 transition-transform duration-200",
            isOpen && "rotate-90"
          )}
        />
        <span>{label}</span>
      </button>

      <div
        className="overflow-hidden transition-[max-height] duration-200"
        style={{ maxHeight: isOpen ? "200px" : "0px" }}
      >
        <div
          className={cn(
            "overflow-y-auto pt-1.5 pl-5 text-muted-foreground",
            message.status === "streaming" && "ap-fade-sweep-text"
          )}
          style={{ maxHeight: "200px" }}
        >
          <p className="whitespace-pre-wrap text-sm">{message.content}</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tool call block (recursive for nested children)                    */
/* ------------------------------------------------------------------ */

function ToolCallBlockView({ message }: { message: ToolCallMessage }) {
  const hasExpandable =
    message.rationale ||
    message.detail ||
    (message.children && message.children.length > 0);

  const [isOpen, setIsOpen] = useState(
    message.status === "running" && !!hasExpandable
  );
  const [manualOverride, setManualOverride] = useState(false);

  const prevStatusRef = useRef(message.status);
  useEffect(() => {
    if (prevStatusRef.current === "running" && message.status === "complete") {
      const timer = setTimeout(() => {
        setIsOpen(false);
        setManualOverride(false);
      }, 300);
      return () => clearTimeout(timer);
    }
    prevStatusRef.current = message.status;
  }, [message.status]);

  // Auto-expand when content appears while running (derived, not in effect)
  const shouldBeOpen =
    !manualOverride && message.status === "running" && !!hasExpandable
      ? true
      : isOpen;

  return (
    <div className="text-sm">
      <button
        type="button"
        className={cn(
          "flex w-full cursor-pointer items-center gap-1.5 text-muted-foreground",
          hasExpandable && "hover:text-foreground"
        )}
        onClick={() => {
            if (!hasExpandable) return;
            setManualOverride(true);
            setIsOpen((prev) => !prev);
          }}
      >
        <ChevronRight
          className={cn(
            "size-3.5 shrink-0 transition-transform duration-200",
            shouldBeOpen && "rotate-90"
          )}
        />
        <span className="text-left">{message.label}</span>
      </button>

      {hasExpandable && (
        <div
          className="overflow-hidden transition-[max-height] duration-200"
          style={{ maxHeight: shouldBeOpen ? "1000px" : "0px" }}
        >
          <div className="flex flex-col gap-1.5 pt-1 pl-5 text-muted-foreground">
            {message.detail && <p className="text-sm">{message.detail}</p>}

            {message.children?.map((child) => (
              <ToolCallBlockView key={child.id} message={child} />
            ))}

            {message.rationale && (
              <div className="flex flex-col gap-0.5 pt-0.5">
                {message.rationaleTitle && (
                  <p className="text-sm font-medium text-muted-foreground">
                    {message.rationaleTitle}
                  </p>
                )}
                <p className="text-sm text-muted-foreground/70">
                  {message.rationale}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Background activity (shimmer text)                                 */
/* ------------------------------------------------------------------ */

function BackgroundActivity({
  message,
}: {
  message: AiBackgroundActivity;
}) {
  return (
    <p className="ap-shimmer-text text-sm text-muted-foreground">
      {message.text}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/*  Message dispatcher                                                 */
/* ------------------------------------------------------------------ */

function MessageBlockView({
  message,
  animate,
}: {
  message: Message;
  animate?: boolean;
}) {
  if (message.type === "activity") return null;

  const content = (() => {
    switch (message.type) {
      case "user":
        return <UserMessageBlock message={message} />;
      case "ai-reply":
        return <AiReply message={message} />;
      case "reasoning":
        return <ReasoningBlock message={message} />;
      case "tool-call":
        return <ToolCallBlockView message={message} />;
    }
  })();

  return (
    <div className={animate ? "ap-message-enter" : undefined}>{content}</div>
  );
}

/* ------------------------------------------------------------------ */
/*  Conversation view                                                  */
/* ------------------------------------------------------------------ */

function ConversationView({ messages }: { messages: Message[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <ScrollArea className="flex-1">
      <div className="flex flex-col gap-3 p-4">
        {messages.map((message, index) => (
          <MessageBlockView
            key={message.id}
            message={message}
            animate={index > 0}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}

/* ------------------------------------------------------------------ */
/*  Prompt box                                                         */
/* ------------------------------------------------------------------ */

function PromptBox({
  onSend,
  isStreaming,
  placeholder = "How can I assist?",
  contextTags,
  onRemoveTag,
}: {
  onSend: (text: string) => void;
  isStreaming?: boolean;
  placeholder?: string;
  contextTags?: ContextTag[];
  onRemoveTag?: (id: string) => void;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasContent = value.trim().length > 0;

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  const handleSend = useCallback(() => {
    if (!hasContent || isStreaming) return;
    onSend(value.trim());
    setValue("");
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    });
  }, [hasContent, isStreaming, onSend, value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="shrink-0 px-4 pb-2 pt-4">
      <div className="rounded-xl border border-(--border-subtle) bg-background transition-colors focus-within:border-[var(--color-border-active)]">
        {/* Context tags */}
        {contextTags && contextTags.length > 0 && (
          <div className="flex flex-wrap gap-1 px-3 pt-2.5">
            {contextTags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 rounded bg-[var(--color-background-secondary)] px-1.5 py-0.5 text-xs text-muted-foreground"
              >
                <ArrowRight className="size-2.5" />
                <span className="max-w-[120px] truncate">{tag.label}</span>
                {onRemoveTag && (
                  <button
                    type="button"
                    className="cursor-pointer hover:text-foreground"
                    onClick={() => onRemoveTag(tag.id)}
                  >
                    <X className="size-2.5" />
                  </button>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Textarea */}
        <div className="px-3.5 pb-1 pt-2.5">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            style={{ minHeight: "20px", maxHeight: "120px" }}
          />
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between px-2 pb-2">
          <button className="flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <Plus className="size-4" />
          </button>

          {isStreaming ? (
            <button className="flex size-7 cursor-pointer items-center justify-center rounded-md border border-(--border-subtle) text-muted-foreground transition-colors hover:bg-accent">
              <Square className="size-3" />
            </button>
          ) : (
            <button
              className={cn(
                "flex size-7 cursor-pointer items-center justify-center rounded-md border transition-colors",
                hasContent
                  ? "border-foreground bg-foreground text-[var(--color-foreground-inverse)] hover:bg-foreground/90"
                  : "border-(--border-subtle) text-muted-foreground/40"
              )}
              onClick={handleSend}
              disabled={!hasContent}
            >
              <ArrowUp className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <p className="mt-2 text-center text-[10px] text-muted-foreground">
        Autopilot can make mistakes. Double check the responses.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty / welcome state                                              */
/* ------------------------------------------------------------------ */

function WelcomeState({
  heading,
  suggestions,
  onSuggestionClick,
}: {
  heading: string;
  suggestions: string[];
  onSuggestionClick?: (suggestion: string) => void;
}) {
  return (
    <div className="flex flex-1 flex-col justify-end p-4">
      <p className="mb-4 text-sm font-medium text-foreground">{heading}</p>
      {suggestions.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => onSuggestionClick?.(s)}
              className="cursor-pointer rounded-sm border border-(--border-subtle) bg-background px-2 py-1 text-sm text-foreground transition-colors hover:bg-accent/50"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main AutopilotPanel component                                      */
/* ------------------------------------------------------------------ */

export interface AutopilotPanelProps {
  messages: Message[];
  onSend: (text: string) => void;
  isStreaming?: boolean;
  suggestions?: string[];
  emptyHeading?: string;
  placeholder?: string;
  contextTags?: ContextTag[];
  onRemoveTag?: (id: string) => void;
  className?: string;
}

/**
 * Hook for SidePanel integration — returns panel content ready to use
 * as a SidePanelItem's `panel` prop.
 */
export function useAutopilotPanel(
  props?: Omit<AutopilotPanelProps, "messages" | "onSend">
) {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSend = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type: "user", text },
    ]);
  }, []);

  const panel = (
    <AutopilotPanel messages={messages} onSend={handleSend} {...props} />
  );

  return { panel, messages, setMessages };
}

export function AutopilotPanel({
  messages,
  onSend,
  isStreaming = false,
  suggestions = [
    "Invoice processing pipeline",
    "Claim analyser",
    "Leads processing",
  ],
  emptyHeading = "What would you like to automate today?",
  placeholder = "How can I assist?",
  contextTags,
  onRemoveTag,
  className,
}: AutopilotPanelProps) {
  const conversationMessages = messages.filter((m) => m.type !== "activity");
  const activity = messages.find(
    (m) => m.type === "activity"
  ) as AiBackgroundActivity | undefined;
  const hasMessages = conversationMessages.length > 0;

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {hasMessages ? (
        <ConversationView messages={conversationMessages} />
      ) : (
        <WelcomeState
          heading={emptyHeading}
          suggestions={suggestions}
          onSuggestionClick={onSend}
        />
      )}

      {/* Activity indicator pinned above prompt box */}
      {activity && (
        <div className="ap-message-enter px-4 pb-1">
          <BackgroundActivity message={activity} />
        </div>
      )}

      <PromptBox
        onSend={onSend}
        isStreaming={isStreaming}
        placeholder={placeholder}
        contextTags={contextTags}
        onRemoveTag={onRemoveTag}
      />
    </div>
  );
}
