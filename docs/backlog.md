# Backlog and build status

The ranked feature list from deck slide 18. Story codes: G Gladstone, A Aryan, C Cordelia. Update the **In app** column whenever a feature changes.

| # | Feature | Stories | MoSCoW | Stage | In app |
| --- | --- | --- | --- | --- | --- |
| 1 | Told upfront it's an AI, what it covers, and what happens to my data | G3 | Must | Sprint 1 | Yes: `start` and `data` nodes |
| 2 | Ask anything without judgement, at any hour, with nothing to fill in first | G1, C3, C1 | Must | Sprint 1 | Yes: anonymous chip chat (no free text in v0) |
| 3 | Short, direct answers with the reasoning and a verified source | G2, A3 | Must | Sprint 1–2 | Yes: `why` and `sources` on every answer |
| 4 | Monitored like a human adviser; told if an answer was wrong | A6, A4 | Must / Should | Sprint 1–2 | Yes: monitoring log at `/staff`; correction notice with "What $RUs is doing" |
| 5 | Pick up where I left off, with check-ins that follow my income | G4, A1 | Must / Should | Sprint 2 | Yes: saved plan, Welcome back card, check-in preference, "A payment just landed" |
| 6 | Spot financial distress and route to a human or free support | C2 | Should | Sprint 2 | Yes: `distress` node and support card (chip-triggered, not detected) |
| 7 | Reach a real adviser or specialist when I choose, with a summary | G5, C6 | Must | Sprint 3 | Adviser: yes. Specialist routing: not yet |
| 8 | Told honestly when the advisor is slow or unavailable | A2, A5 | Could | Sprint 3 | Yes: service banner, chat status, unavailable tray (set in the dev panel) |
| 9 | Murray sees the four engagement measures against targets | New | Must | Sprint 3 | Yes: `/staff` (this device only) |
| 10 | Release hardening: pen test, compliance review, pilot set-up | New | Must | Sprint 3 | Not applicable to the prototype |
| 11 | Guidance and savings recommendations from my own figures | A1, C1 | Phase 2 | Phase 2 | Out of scope |
| 12 | AI-modelled projections passed to a $RUs specialist | C6 | Phase 2 | Phase 2 | Out of scope |
| 13 | Invite my family; subsidised adviser pathway for hardship | A4, C2 | Phase 2 | Phase 2 | Out of scope |
| 14 | Aged-selfie Future You with a human-like presence | C4, C3 | Phase 3 | Phase 3 | Out of scope |
| 15 | ESG and values filters on projections | C5 | Phase 3 | Phase 3 | Out of scope |

## Known gaps in Phase 1

- **Feature 7:** no separate specialist handover (for example first-home, C6). Every handover goes to the generic adviser.
- **Feature 6:** distress is a topic chip. A real build would detect distress language in free text.
- **Features 4 and 9:** the log and the measures read this device's localStorage only. There is no backend.
- **Journey map:** a private return link is generated, but it doesn't restore a plan on another device (v0 mock).
