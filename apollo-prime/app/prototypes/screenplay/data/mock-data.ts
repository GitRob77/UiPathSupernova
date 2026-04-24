import type { Step, AssistantMessage } from "./types";

export const STEPS: Step[] = [
  {
    id: 1,
    label: "Click 'User Data Upload' tab",
    status: "success",
    action: "Click",
    observation:
      'The table window "Date pentru completarea formularului" is currently active showing the rows (row 2 labels are in Element Id 6), and the target "User Data Upload" tab/window (Tab Id 298376802) is inactive in the DOM.',
    reasoning:
      'Task is not finished \u2014 first activate the "User Data Upload" tab/window so we can paste the extracted row data and click the Upload button; next step is to activate that inactive tab.',
    summary: "Activated User Data Upload tab successfully.",
    actionJson: {
      ActionType: "Click",
      IsSuccessful: true,
      TokenUsage: null,
      ExecutionException: null,
      InputAction: {
        Action: {
          description:
            "Click the inactive 'User Data Upload' tab to activate that tab/window",
          method_type: "click",
          parameters: {
            element_id: 298376802,
            button: "left",
            clickType: "single",
          },
        },
        id: null,
        execution_error_message: null,
      },
      ActionId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    },
    time: "11.86s",
    tokensIn: "6,749",
    tokensOut: "959",
    cost: "$0.003605",
  },
  {
    id: 2,
    label: "Click 'Date pentru completarea' tab",
    status: "success",
    action: "Click",
    observation:
      'The "User Data Upload" tab is now active. Need to switch back to the data table to extract row 2.',
    reasoning:
      "We need to read the data from row 2 in the table. Switch to the data table tab first.",
    summary: "Switched to data table tab.",
    actionJson: {
      ActionType: "Click",
      IsSuccessful: true,
      TokenUsage: null,
      ExecutionException: null,
      InputAction: {
        Action: {
          description:
            "Click the inactive tab 'Date pentru completarea formularului' to activate it",
          method_type: "click",
          parameters: {
            element_id: 298376815,
            button: "left",
            clickType: "single",
          },
        },
        id: null,
        execution_error_message: null,
      },
      ActionId: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    },
    time: "8.21s",
    tokensIn: "6,294",
    tokensOut: "639",
    cost: "$0.002891",
  },
  {
    id: 3,
    label: "Click 'User Data Upload' tab",
    status: "error",
    action: "Click",
    observation:
      'The table window "Date pentru completarea formularului" is currently active showing the rows (row 2 labels are in Element Id 6), and the target "User Data Upload" tab/window (Tab Id 298376802) is inactive in the DOM.',
    reasoning:
      'Task is not finished \u2014 first activate the "User Data Upload" tab/window so we can paste the extracted row data and click the Upload button; next step is to activate that inactive tab.',
    summary: "",
    actionJson: {
      ActionType: "Click",
      IsSuccessful: false,
      TokenUsage: null,
      ExecutionException: {
        ApplicationName: null,
        Type: "UiPath.UIAutomationNext.Exceptions.UIAutomationException",
        Message:
          "The requested action couldn't be performed because the window was not active.\r\nThe window has been activated automatically. Please retry the action..",
        StackTrace: "...",
      },
      InputAction: {
        Action: {
          description:
            "Click the inactive 'User Data Upload' tab to activate its window and tab",
          method_type: "click",
          parameters: {
            element_id: 298376802,
            button: "left",
            clickType: "single",
          },
        },
        id: null,
        execution_error_message:
          "The requested action couldn't be performed because the window was not active.\r\nThe window has been activated automatically. Please retry the action..",
      },
      ActionId: "dce4ed93-a004-4866-8ac0-ec37b90624de",
    },
    time: "8.217s",
    tokensIn: "6,294",
    tokensOut: "639",
    cost: "$0.003102",
  },
  {
    id: 4,
    label: "Extract row 2 data",
    status: "pending",
    action: "Extract",
    observation: "\u2014",
    reasoning: "\u2014",
    summary: "",
    actionJson: null,
    time: "\u2014",
    tokensIn: "\u2014",
    tokensOut: "\u2014",
    cost: "\u2014",
  },
  {
    id: 5,
    label: "Paste data in upload form",
    status: "pending",
    action: "Type",
    observation: "\u2014",
    reasoning: "\u2014",
    summary: "",
    actionJson: null,
    time: "\u2014",
    tokensIn: "\u2014",
    tokensOut: "\u2014",
    cost: "\u2014",
  },
  {
    id: 6,
    label: "Click 'Upload Data' button",
    status: "pending",
    action: "Click",
    observation: "\u2014",
    reasoning: "\u2014",
    summary: "",
    actionJson: null,
    time: "\u2014",
    tokensIn: "\u2014",
    tokensOut: "\u2014",
    cost: "\u2014",
  },
  {
    id: 7,
    label: "Verify upload success",
    status: "pending",
    action: "Verify",
    observation: "\u2014",
    reasoning: "\u2014",
    summary: "",
    actionJson: null,
    time: "\u2014",
    tokensIn: "\u2014",
    tokensOut: "\u2014",
    cost: "\u2014",
  },
];

export const SYSTEM_PROMPT = `You are an UI automation expert that performs actions on computer (application or web browser) to complete a task in as many steps as necessary.
At each step you will be provided with:
- Application or web page information including:
    - the screen image
    - the DOM structure of the application or web page containing elements like <Window>, <Tab>, <Container>, <Button>, <Text>, <InputBox> ...
- The task to complete
- The history of actions you have already taken

You must analyze the current state and decide on the next action to take.`;

export const USER_PROMPT = `# Your task:\nExtract the data from row no 2 and paste in the 'User Data Upload' tab. Then, click the 'Upload Data' buton\n\n# Current state:\nThe table window "Date pentru completarea formularului" is currently active.\n\n## DOM Structure:\n<Window id="298376790" title="Date pentru completarea formularului">\n  <Tab id="298376802" title="User Data Upload" isActive="false"/>\n  <Tab id="298376815" title="Date pentru completarea formularului" isActive="true"/>\n  <Table id="6">...</Table>\n</Window>`;

export const PROMPT_TEXT =
  "Extract the data from row no 2 and paste in the 'User Data Upload' tab. Then, click the 'Upload Data' buton";

export const ASSISTANT_MESSAGES: AssistantMessage[] = [
  {
    role: "user",
    text: "Step 3 keeps failing with a window activation error. The action is trying to click the User Data Upload tab but the window isn't active.",
  },
  {
    role: "assistant",
    text: "The error indicates the target window wasn't focused when the click was attempted. The system auto-activated it, so a simple retry should work. Consider rewording the prompt to explicitly include a window focus/activation step before interacting with inactive tabs.",
  },
  {
    role: "user",
    text: "Please fix the prompt to handle this.",
  },
  {
    role: "assistant",
    text: 'I\'ve updated the prompt to include: "First, ensure the target window is active by clicking on its title bar or using Alt+Tab. Then extract the data from row no 2..." This should prevent the UIAutomation window activation error.',
  },
];

export const CONFIG_DATA = {
  maxSteps: 15,
  timeout: 30000,
  retryOnFailure: true,
  maxRetries: 3,
  screenshotOnEachStep: true,
  highlightElements: true,
  windowActivationStrategy: "auto",
  elementWaitTimeout: 5000,
};
