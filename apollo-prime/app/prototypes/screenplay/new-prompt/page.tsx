"use client";

import { useState, useCallback } from "react";
import { SidePanel } from "@/components/custom/side-panel";
import type { SidePanelItem } from "@/components/custom/side-panel";
import {
  useAutopilotPanel,
  type Message,
} from "@/components/custom/autopilot-panel";
import { Sparkles } from "lucide-react";

import { ScreenplayHeader } from "../components/screenplay-header";
import { PromptEditor } from "../components/prompt-editor";
import { ASSISTANT_MESSAGES } from "../data/mock-data";

/* Map simple assistant messages to AutopilotPanel message format */
const initialMessages: Message[] = ASSISTANT_MESSAGES.map((msg, i) => {
  if (msg.role === "user") {
    return { id: `msg-${i}`, type: "user" as const, text: msg.text };
  }
  return {
    id: `msg-${i}`,
    type: "ai-reply" as const,
    content: msg.text,
    status: "complete" as const,
  };
});

export default function NewPromptPage() {
  const promptCollapsed = false;
  const [autopilotPanelId, setAutopilotPanelId] = useState<string | undefined>(
    "autopilot"
  );

  const toggleAutopilot = useCallback(
    () =>
      setAutopilotPanelId((prev) =>
        prev === "autopilot" ? undefined : "autopilot"
      ),
    []
  );

  /* Autopilot panel */
  const autopilot = useAutopilotPanel({
    suggestions: [
      "What can you do?",
      "Fix the failing step",
      "Improve the prompt",
      "Explain the error",
    ],
    emptyHeading: "How can I help you today?",
    placeholder: "What would you like me to do?",
  });

  /* Seed initial messages on first render */
  if (autopilot.messages.length === 0 && initialMessages.length > 0) {
    autopilot.setMessages(initialMessages);
  }

  const rightPanelItems: SidePanelItem[] = [
    {
      id: "autopilot",
      icon: Sparkles,
      label: "Autopilot",
      panelTitle: "Autopilot",
      panel: autopilot.panel,
    },
  ];

  return (
    <div className="flex h-screen items-center justify-center bg-muted/50">
      <div className="flex h-[640px] w-[960px] flex-col overflow-hidden rounded-xl border border-(--border-subtle) bg-background shadow-xl">
        <ScreenplayHeader logoHref="/prototypes/screenplay/home" showUploadTrace={false} />

        <div className="flex flex-1 overflow-hidden">
          {/* Left column: prompt */}
          <div className="flex flex-1 flex-col overflow-hidden" style={{ minWidth: 0 }}>
            <PromptEditor
              collapsed={promptCollapsed}
              onToggle={() => {}}
              onToggleAutopilot={toggleAutopilot}
              autopilotActive={autopilotPanelId === "autopilot"}
              collapsible={false}
            />
          </div>

          {/* Right: autopilot panel below header */}
          <SidePanel
            items={rightPanelItems}
            side="right"
            activeId={autopilotPanelId}
            onActiveIdChange={setAutopilotPanelId}
            defaultWidth={380}
            resizable
          />
        </div>
      </div>
    </div>
  );
}
