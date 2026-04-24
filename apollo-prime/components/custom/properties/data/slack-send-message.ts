import type { PropertiesPanelSchema } from "../types";

export const slackSendMessageSchema: PropertiesPanelSchema = {
  title: "Send Slack Message",
  subtitle: "Slack",
  activityHeader: {
    displayName: "Send Slack Message",
    typeLabel: "Slack",
    icon: "MessageSquare",
    iconColor: "#611f69",
  },
  sections: [
    {
      id: "target",
      title: null,
      fields: [
        {
          id: "connection",
          widget: "select",
          label: "Slack connection",
          required: true,
          supportsVariables: false,
          widgetProps: {
            options: [
              { value: "slack-prod", label: "Production workspace" },
              { value: "slack-dev", label: "Dev workspace" },
              { value: "slack-qa", label: "QA workspace" },
            ],
            searchable: true,
            placeholder: "Select connection",
          },
        },
        {
          id: "channel",
          widget: "select",
          label: "Channel name/ID",
          required: true,
          supportsVariables: true,
          widgetProps: {
            options: [
              { value: "general", label: "#general" },
              { value: "engineering", label: "#engineering" },
              { value: "design", label: "#design" },
              { value: "product", label: "#product" },
              { value: "random", label: "#random" },
              { value: "alerts", label: "#alerts" },
            ],
            searchable: true,
            placeholder: "Select channel",
          },
        },
        {
          id: "message",
          widget: "text-input",
          label: "Message",
          required: true,
          supportsVariables: true,
          widgetProps: {
            multiline: true,
            placeholder:
              "This is the main text that people will see in the message…",
          },
        },
        {
          id: "sendAs",
          widget: "select",
          label: "Send as",
          required: false,
          widgetProps: {
            options: [
              { value: "bot", label: "Bot" },
              { value: "user", label: "User" },
            ],
            placeholder: "Select…",
          },
        },
      ],
    },
    {
      id: "recipients",
      title: "Recipients",
      defaultOpen: true,
      fields: [
        {
          id: "to",
          widget: "tag-input",
          label: "To",
          required: false,
          supportsVariables: true,
          widgetProps: {
            placeholder: "Type a name or email and press Enter…",
            suggestions: [
              "john.doe@company.com",
              "jane.smith@company.com",
              "team-leads@company.com",
            ],
          },
        },
        {
          id: "mentionUsers",
          widget: "toggle",
          label: "Mention users",
          widgetProps: {
            onLabel: "Enabled",
            offLabel: "Disabled",
          },
        },
      ],
    },
    {
      id: "options",
      title: "Options",
      defaultOpen: false,
      fields: [
        {
          id: "formatting",
          widget: "select",
          label: "Formatting options (parse)",
          widgetProps: {
            options: [
              { value: "none", label: "None" },
              { value: "full", label: "Full" },
              { value: "markdown", label: "Markdown" },
            ],
            placeholder: "Change how messages are treated…",
          },
        },
        {
          id: "linkNames",
          widget: "radio-group",
          label: "Link names",
          widgetProps: {
            options: [
              { value: "true", label: "Yes" },
              { value: "false", label: "No" },
              { value: "default", label: "Default" },
            ],
            nullable: true,
          },
        },
        {
          id: "unfurlLinks",
          widget: "radio-group",
          label: "Unfurl links",
          widgetProps: {
            options: [
              { value: "true", label: "Yes" },
              { value: "false", label: "No" },
            ],
          },
        },
        {
          id: "unfurlMedia",
          widget: "radio-group",
          label: "Unfurl media",
          widgetProps: {
            options: [
              { value: "true", label: "Yes" },
              { value: "false", label: "No" },
            ],
          },
        },
      ],
      helpBlock: {
        variant: "tip",
        message:
          "Unfurl options control whether Slack expands links and media previews in the message.",
      },
    },
    {
      id: "advanced",
      title: "Advanced",
      defaultOpen: false,
      fields: [
        {
          id: "botUsername",
          widget: "text-input",
          label: "Bot username",
          helpText: "Override the default bot name for this message.",
          widgetProps: {
            placeholder: "e.g. Deploy Bot",
          },
        },
        {
          id: "iconEmoji",
          widget: "text-input",
          label: "Icon emoji",
          defaultHint: "Default is :robot_face:",
          widgetProps: {
            placeholder: ":emoji_name:",
          },
        },
        {
          id: "threadTs",
          widget: "text-input",
          label: "Thread timestamp",
          supportsVariables: true,
          helpText: "Reply to a specific thread by providing its timestamp.",
          widgetProps: {
            placeholder: "e.g. 1234567890.123456",
          },
        },
        {
          id: "replyBroadcast",
          widget: "toggle",
          label: "Reply broadcast",
          helpText: "Also post the reply to the channel when replying in a thread.",
          widgetProps: {
            onLabel: "Yes",
            offLabel: "No",
          },
        },
      ],
    },
    {
      id: "output",
      title: "Output",
      defaultOpen: true,
      fields: [
        {
          id: "output_channel",
          widget: "output-field",
          label: "Channel",
          isOutput: true,
          direction: "output",
          widgetProps: {
            name: "Channel",
            type: "String",
          },
        },
        {
          id: "output_ts",
          widget: "output-field",
          label: "Message timestamp",
          isOutput: true,
          direction: "output",
          widgetProps: {
            name: "MessageTimestamp",
            type: "String",
          },
        },
      ],
    },
  ],
};
