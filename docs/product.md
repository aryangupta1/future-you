# Product brief

Condensed from the team's two source files, which live on SharePoint (University of Sydney, owner cpra0350):

- **Personas & User Stories.xlsx**: the 17 team stories, tagged G (Gladstone), A (Aryan) and C (Cordelia)
- **A3 - Group Presentation Structure.pptx**: the pitch deck, with speaker notes

Excel and PowerPoint Online render to canvas, so reading them through the page is unreliable. What worked was fetching each file with `/_layouts/15/download.aspx?UniqueId=<GUID>` from inside a signed-in SharePoint tab, unzipping it in page JavaScript (`DecompressionStream('deflate-raw')`), and reading the XML. When you edit this file, re-check it against those sources.

## The opportunity

Most $RUs clients are retirees, and growth depends on their referrals. Murray (the sponsor) wants an interactive AI advisor that brings in younger clients. The goal is engagement, not direct profit.

**The customer problem.** People who work for themselves have no employer paying their super and no steady pay to plan around. The usual first step, booking a planner, feels too big, so they keep putting it off.

**Proposal.** Future You: a responsive web app with an AI digital advisor. Ask anonymously, build a plan in ten-minute sessions, and meet a human adviser when you choose.

## Primary persona: Robyn Banks, 28

Self-employed mortgage broker in Western Sydney, formerly a lending manager. "I don't need a lecture. I need a plan."

| Code | Pain point |
| --- | --- |
| P1 | Income arrives in lumps, weeks after the work |
| P2 | No employer super since she left the bank |
| P3 | The planners she knows are her referral partners, so she can't ask them |
| P4 | Her free time comes in ten-minute pieces |
| P5 | No patience for waffle; unsure an AI is reliable |

The P codes appear in code comments throughout `src/content/`.

**Secondary personas** (from the workbook): a 32-year-old sole-trader remedial massage therapist (A1–A3), a long-standing client in their mid-50s (A4, A5), the $RUs responsible manager (A6), Priya Patel, a vulnerable non-adopter (C1, C2), Liam Kowalski, a sceptical low-engagement planner (C3, C4), and Chloe Lin, an active fin-tech user (C5, C6).

## Engagement, defined (the four measures)

1. She finishes a first conversation
2. She returns within 30 days
3. Her plan moves forward
4. She asks for a handover

Thresholds are agreed with Murray before Sprint 1. A fixed review date decides whether to continue, change course or stop. `/staff` shows all four measures.

## The boundary

Future You gives **general information only**. Personal advice stays with licensed $RUs advisers (ASIC 2019). The handover is the point where engagement becomes a client.

## Scope by phase

- **Phase 1 (the MVP):** ask, trust, return, hand over. This is what the app implements.
- **Phase 2:** make it personal. Guidance from her own figures, projections passed to a specialist, family invitations and a subsidised adviser pathway, all under licensed oversight.
- **Phase 3:** give it a face and values. The aged-selfie digital human and ESG filters.
- **Never planned:** product recommendations, executing transactions, crisis support and bank feeds.

## Risks (from the premortem)

Privacy, security, bias, trust ("almost human, not quite useful"), adoption, feasibility (the general/personal advice line) and responsible AI (distress routing). The deck lists a mitigation for each.
