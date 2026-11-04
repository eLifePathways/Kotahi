/**
 * @typedef {Object} SystemMessage
 * @property {string} role - Role of the assistant.
 * @property {string} task - Task to be performed.
 * @property {?string} context - Additional context for the task.
 * @property {{type: ('json'|'text'), shape: (string|{[key: string]: any})}} response - Expected response format.
 *   - When type is 'json', shape must be a stringified JSON object representing the structure of the expected response.
 *   - When type is 'text', shape should be a plain text string.
 * @property {Array<string>} notes - Additional notes or instructions.
 * @property {?string} text - Custom text to override the default prompt generation.
 *
 * Generates a formatted prompt for a given task, including details about the role, context, expected response format, and additional notes.
 * Utilizes a helper function {@linkcode responseTypes} to define the structure of the expected response.
 *
 * @param {SystemMessage} options - Options for generating the prompt.
 * @returns {string} Formatted prompt string.
 */

const systemPrompt = ({ task, role, context, response, notes, text }) =>
  text ??
  `
ROLE: ${role}
TASK: ${task}
${
  context ? `\nBEGIN CONTEXT BLOCK:\n${context}\nEND CONTEXT BLOCK\n\n` : '\n'
}${responseTypes(response.shape)[response.type]}

${notes?.length > 0 ? `**Note:**\n\n${notes.map(note => `\t- ${note}`)}` : ''}
`

const responseTypes = shape => ({
  json: `RESPONSE: Your responses should be formatted as a stringified JSON object with the following structure:

\`\`\`json
${shape}
\`\`\``,
  text: shape,
})

module.exports = {
  systemPrompt,
}
