import type { ServiceStatus } from '../state/store';

// Feature 8 (stories A2, A5): told honestly when the advisor is slow or
// unavailable, so nobody waits for an answer that never arrives. Shown on
// every page as soon as the status changes. Set from the dev panel in v0.

export const serviceStatus: Record<Exclude<ServiceStatus, 'ok'>, {
  banner: string;
  detail: string;
  chatSubtitle: string;
  trayNote: string;
}> = {
  slow: {
    banner: 'The AI advisor is busy right now',
    detail: "Replies are taking about 2 minutes instead of a few seconds. If that's longer than you have, your plan is saved: try again later, or talk to a person.",
    chatSubtitle: 'Busy · replies take about 2 minutes',
    trayNote: 'replies take about 2 minutes right now',
  },
  down: {
    banner: 'The AI advisor is unavailable',
    detail: "We're working on it and expect it back within a few hours. Your plan and chat are saved. For anything time-sensitive, talk to a person.",
    chatSubtitle: 'Unavailable right now',
    trayNote: 'no replies right now',
  },
};

export const chatUnavailable = {
  title: "I can't answer right now",
  body: "The AI advisor is unavailable, so you won't get a reply here. Nothing you've done is lost.",
  cta: 'Talk to a person',
  back: 'Back home',
};

// ---------------------------------------------------------------------------
// $RUs staff view: engagement measures (feature 9) and monitoring log (A6)
// ---------------------------------------------------------------------------

export const staff = {
  title: '$RUs staff view',
  intro:
    "What Murray and the responsible manager see. Engagement is measured four ways, agreed before Sprint 1, and every conversation is logged for the same review human advisers get.",
  mockNote: 'v0: this view reads this device only. In the pilot it would cover every visitor, with no names attached.',
  measuresTitle: 'The four engagement measures',
  measuresTarget: 'Threshold agreed with Murray before Sprint 1',
  measures: {
    firstConversation: {
      label: 'Finishes a first conversation',
      definition: 'Reads at least two sourced answers.',
    },
    returned: {
      label: 'Returns within 30 days',
      definition: 'A second visit on a later day, within 30 days of the first.',
    },
    planMoved: {
      label: 'Plan moves forward',
      definition: 'Ticks off at least one plan step.',
    },
    handover: {
      label: 'Asks for a handover',
      definition: 'Books a call or messages an adviser.',
    },
  },
  logTitle: 'Monitoring log',
  logIntro: 'Every AI exchange, with what the advisor did. Rows that need a human look are flagged.',
  logEmpty: 'Nothing logged yet. Start a conversation, then come back.',
  flaggedOnly: 'Flagged only',
};
