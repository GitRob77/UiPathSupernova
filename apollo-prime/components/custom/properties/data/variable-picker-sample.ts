import type {
  ActivityNode,
  RecommendedItem,
} from "../variable-picker";

export const SAMPLE_ACTIVITIES: ActivityNode[] = [
  {
    id: "sendMessageToUser",
    name: "Send Message to User",
    properties: [
      { id: "sendMessageToUser.messageTimestamp", name: "Message timestamp" },
      { id: "sendMessageToUser.channel", name: "Channel" },
      { id: "sendMessageToUser.ts", name: "Ts" },
      { id: "sendMessageToUser.username", name: "Username" },
      { id: "sendMessageToUser.text", name: "Text" },
      {
        id: "sendMessageToUser.channelObj",
        name: "Channel",
        children: [
          {
            id: "sendMessageToUser.channelObj.channel",
            name: "channel",
            children: [
              {
                id: "sendMessageToUser.channelObj.channel.length",
                name: "Length",
              },
            ],
          },
        ],
      },
      { id: "sendMessageToUser.tsRaw", name: "ts" },
      { id: "sendMessageToUser.usernameRaw", name: "username" },
      { id: "sendMessageToUser.blocks", name: "blocks", children: [] },
      { id: "sendMessageToUser.icons", name: "icons", children: [] },
    ],
  },
  {
    id: "sendMessageToChannel",
    name: "Send Message to Channel",
    properties: [
      {
        id: "sendMessageToChannel.messageTimestamp",
        name: "Message timestamp",
      },
      { id: "sendMessageToChannel.channel", name: "Channel" },
      { id: "sendMessageToChannel.ts", name: "Ts" },
      { id: "sendMessageToChannel.text", name: "Text" },
      { id: "sendMessageToChannel.threadTs", name: "Thread ts" },
      {
        id: "sendMessageToChannel.channelObj",
        name: "Channel",
        children: [
          { id: "sendMessageToChannel.channelObj.name", name: "name" },
          { id: "sendMessageToChannel.channelObj.isPrivate", name: "isPrivate" },
        ],
      },
      { id: "sendMessageToChannel.blocks", name: "blocks", children: [] },
    ],
  },
  {
    id: "manualTrigger",
    name: "Manual Trigger",
    properties: [
      { id: "manualTrigger.triggeredBy", name: "Triggered by" },
      { id: "manualTrigger.triggeredAt", name: "Triggered at" },
    ],
  },
];

export const SAMPLE_RECOMMENDED: RecommendedItem = {
  id: "sendMessageToUser.channel",
  name: "Channel",
};
