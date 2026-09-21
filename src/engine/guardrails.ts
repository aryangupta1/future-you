// Deterministic guardrails for AI mode. Shared by the browser and the
// /api/chat server so the model is never the only line of defence:
//
// - Distress language skips the model entirely and shows the vetted support
//   card (rule 5).
// - Anything that looks like a request for personal advice is forced into the
//   personal-advice shape: general rules only, plus a human hand-off (rule 1).
// - Specific dollar figures or percentages in a reply get a "check the source"
//   note, because caps and rates change (rule 7).
//
// Keyword lists are deliberately broad: a false positive costs one extra
// "talk to a person" chip, a false negative can cost much more.

const DISTRESS = [
  /suicid/i,
  /kill (myself|me)/i,
  /end (it|my life)/i,
  /self[- ]harm/i,
  /hopeless/i,
  /can'?t cope/i,
  /can'?t (pay|afford) (my )?(rent|bills|mortgage|debts?)/i,
  /overwhelm/i,
  /(money|financial|debt) (stress|anxiety|worries)/i,
  /\bstress(ed|ing)?\b.*\b(money|debt|bills|finances?)\b/i,
  /\b(money|debt|bills|finances?)\b.*\bstress(ed|ing)?\b/i,
  /\bpanic/i,
  /desperate/i,
  /debt collectors?/i,
  /bankrupt/i,
  /(losing|lose) (my|the) (home|house)/i,
  /evict/i,
  /hardship/i,
];

const PERSONAL = [
  /\bshould i\b/i,
  /\bhow much (should|do) i\b/i,
  /\bwhat should i (do|buy|invest)/i,
  /\b(is|would) it (be )?(better|worth it|smart) (for me|if i)\b/i,
  /\bwhich (fund|super fund|shares?|stocks?|etfs?|property|account) (should|is best|would you)/i,
  /\b(recommend|tell me what to do)\b/i,
  /\$\s?\d/,
  /\b\d+(\.\d+)?\s?(k|grand|thousand)\b/i,
  /\bmy (income|salary|balance|super balance|savings|debts?|mortgage|turnover|profit)\b[^.?!]*\d/i,
];

const FIGURE = /(\$\s?\d[\d,]*(\.\d+)?\s?(k|m|million|billion)?)|(\b\d+(\.\d+)?\s?(%|per ?cent\b))/i;

export const detectDistress = (text: string) => DISTRESS.some((r) => r.test(text));
export const detectPersonalAdvice = (text: string) => PERSONAL.some((r) => r.test(text));
export const containsFigures = (text: string) => FIGURE.test(text);

/** Hard limits on what the browser may send. The server enforces the same. */
export const AI_LIMITS = {
  questionChars: 600,
  historyTurns: 10,
  historyChars: 1500,
};
