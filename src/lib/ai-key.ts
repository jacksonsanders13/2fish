// The Claude API key. Vercel has it as CLAUDE_AI_KEY; ANTHROPIC_API_KEY also works.
export function claudeKey() {
  return process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_AI_KEY || "";
}
