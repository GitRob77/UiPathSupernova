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
import { StepProgressBar } from "../components/step-progress-bar";
import { StepsSidebar } from "../components/steps-sidebar";
import { ContextBar } from "../components/context-bar";
import { PreviewArea } from "../components/preview-area";
import { BottomDrawer } from "../components/bottom-drawer";
import { STEPS, ASSISTANT_MESSAGES } from "../data/mock-data";
import type { DrawerTabId } from "../data/types";

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

export default function ScreenplayHomePage() {
  const [selectedStep, setSelectedStep] = useState(2);
  const [promptCollapsed, setPromptCollapsed] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState<DrawerTabId | null>(null);
  const [autopilotPanelId, setAutopilotPanelId] = useState<string | undefined>(undefined);
  const [previewMode, setPreviewMode] = useState("original");
  const [highlightsOn, setHighlightsOn] = useState(false);
  const [drawerHeight, setDrawerHeight] = useState(360);

  const step = STEPS[selectedStep];

  const toggleDrawer = useCallback(
    (id: DrawerTabId) => setActiveDrawer((prev) => (prev === id ? null : id)),
    []
  );

  const toggleAutopilot = useCallback(
    () => setAutopilotPanelId((prev) => (prev === "autopilot" ? undefined : "autopilot")),
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
    <div className="flex h-screen flex-col bg-muted/30 text-foreground">
      <ScreenplayHeader logoHref="/prototypes/screenplay/new-prompt" />

      <div className="flex flex-1 overflow-hidden">
        {/* Main content column */}
        <div className="flex flex-1 flex-col overflow-hidden" style={{ minWidth: 0 }}>
          <PromptEditor
            collapsed={promptCollapsed}
            onToggle={() => setPromptCollapsed((p) => !p)}
            onToggleAutopilot={toggleAutopilot}
            autopilotActive={autopilotPanelId === "autopilot"}
          />

          <div className="flex flex-1 flex-col overflow-hidden">
            <StepProgressBar
              steps={STEPS}
              selectedIndex={selectedStep}
              onSelect={setSelectedStep}
            />

            <div className="flex flex-1 overflow-hidden">
              <StepsSidebar
                steps={STEPS}
                selectedIndex={selectedStep}
                onSelect={setSelectedStep}
              />

              <div className="relative flex flex-1 flex-col overflow-hidden">
                <ContextBar step={step} />
                <PreviewArea
                  step={step}
                  previewMode={previewMode}
                  onPreviewModeChange={setPreviewMode}
                  highlightsOn={highlightsOn}
                  onHighlightsChange={setHighlightsOn}
                />
                <BottomDrawer
                  step={step}
                  activeDrawer={activeDrawer}
                  onToggleDrawer={toggleDrawer}
                  drawerHeight={drawerHeight}
                  onDrawerHeightChange={setDrawerHeight}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right autopilot panel */}
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
  );
}
