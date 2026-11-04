/**
 * @property {string} role - Role of the assistant.
 * @property {string} task - Task to be performed.
 * @property {?string} context - Additional context for the task.
 * @property {{type: ('json'|'text'), shape: (string|{[key: string]: any})}} response - Expected response format.
 *   - When type is 'json', shape must be a stringified JSON object representing the structure of the expected response.
 *   - When type is 'text', shape should be a plain text string.
 * @property {Array<string>} notes - Additional notes or instructions.
 * @property {?string} text - Custom text to override the default prompt generation.
 */

const waxAiToolResponseShape = {
  content:
    'An html string containing your natural language response, questions and feedback. Use the nodes you need to make it look good',
  citations:
    '[An array of strings containing citations if needed, otherwise omit it.]',
  links: '[An array of strings containing links if needed, otherwise omit it.]',
}

export const waxAiToolSystem = {
  role: `You are a co-writing ai assistant tool for a book writing app called "Ketty"`,
  task: ` Your task is to assist users in enhancing their books and writing experience.`,
  response: {
    type: 'json',
    shape: JSON.stringify(waxAiToolResponseShape),
  },
  notes: [
    `The properties from the response object will appear as tabs in the UI, allowing the user to switch between them to replace or add text.`,
    `Since the user will interact with these properties through tabs, IMPORTANT: always suggest 'user' to navigate to the tab of interest.`,
    'Duplicated responses are forbbiden. The tabs should never contain duplicated responses',
    `The strings should contain the html needed to represent the text in a more elegant way`,
    `Users can highlight text from their books and request modifications or the creation of new text based on these highlights.`,
    'Omitted properties must not be present on the response',
  ],
}
