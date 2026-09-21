import type { Flow, Node, Option, PlanStep } from '../engine/types';
import { sources } from './sources';

// All Flow 1 (new, anonymous visitor) text lives here. Edit freely: the UI
// reads this file and nothing in src/components needs to change.
//
// Rules this content must follow (see README):
// - General information only. Anything using the visitor's own figures goes
//   to a 'personalAdvice' node that explains the line and offers a human.
// - Every factual answer carries at least one source.
// - No hardcoded dollar caps, rates or thresholds. Say "there's an annual
//   cap" and link to the ATO.
// - Every factual claim is marked with a `// VERIFY` comment for fact-checking.
//
// Pain point codes (from the brief): P1 lumpy income, P2 no employer super,
// P3 can't ask her own network, P4 ten-minute pieces of time, P5 no patience
// for waffle / unsure AI is reliable.

const BACK: Option = { label: 'Back to topics', next: 'topics' };
const TALK: Option = { label: 'Talk to an adviser', next: 'to-adviser', action: 'handover' };

// ---------------------------------------------------------------------------
// Landing page copy
// ---------------------------------------------------------------------------

export const landing = {
  eyebrow: 'Future You by $RUs',
  headline: 'No employer paying your super? Ask anonymously.', // P2, P3
  body: [
    'Straight answers on super, lumpy income and investing basics for self-employed Australians. No account, no sales pitch.', // P5
    'Our AI digital advisor gives general information with a source for every answer. When you want advice on your own numbers, a licensed $RUs adviser takes over.', // P3, P5
  ],
  startLabel: 'Start a conversation',
  existingLabel: "I'm an existing $RUs client",
  proofPoints: [
    'Anonymous. No sign-up needed.', // P3
    'Answers in a few taps. Pick up later where you left off.', // P4
    'Every answer links to the ATO, Moneysmart or ASIC.', // P5
  ],
  welcomeBack: {
    title: 'Welcome back: pick up where you left off', // P4
    body: 'Your plan is saved on this device.',
    openPlan: 'Open my plan',
    continueChat: 'Continue the conversation',
  },
};

// ---------------------------------------------------------------------------
// Conversation tree
// ---------------------------------------------------------------------------

const nodes: Node[] = [
  // Disclosure: the advisor says it is an AI before the first question (rule 2).
  {
    id: 'start',
    messages: [
      "Hi, I'm the Future You digital advisor. I'm an AI, not a person.",
      "I give general information only. I don't see your figures and can't tell you what to do with your money. When a question needs that, I'll say so and you can talk to a licensed $RUs adviser.",
      'No account needed. Nothing here is shared with anyone unless you choose to talk to an adviser.', // P3
    ],
    options: [{ label: 'Got it, show me topics', next: 'topics' }],
  },
  {
    id: 'topics',
    messages: ["What's on your mind?"],
    options: [
      { label: 'Super for the self-employed', next: 'super' },
      { label: 'Budgeting with lumpy income', next: 'budget' },
      { label: 'Shares and property basics', next: 'invest' },
      { label: 'General vs personal advice', next: 'advice' },
      { label: 'Honestly, money stress is getting on top of me', next: 'distress' },
    ],
  },

  // ---- Super for the self-employed (P2) ----------------------------------
  {
    id: 'super',
    topic: 'Super for the self-employed',
    messages: ['Super without an employer. Pick a question.'],
    options: [
      { label: "Do I have to pay my own super if I'm self-employed?", next: 'super-must' },
      { label: 'Can I claim a tax deduction for super I put in?', next: 'super-deduct' },
      { label: 'Can super help me save for my first home?', next: 'super-fhss' },
      { label: 'Could I have old super accounts lying around?', next: 'super-lost' },
      { label: 'How do I know if my super fund is any good?', next: 'super-compare' },
      { label: "I've got $40k saved. Should I put $20k into super?", next: 'super-40k' },
      BACK,
    ],
  },
  {
    id: 'super-must',
    topic: 'Super for the self-employed',
    messages: [
      // VERIFY: sole traders are generally not required to pay super guarantee for themselves.
      "Generally, no. If you're a sole trader, no one is required to pay super for you, including you.",
      "That's the catch: with no employer, your super can stall for years without you noticing.",
      // VERIFY: self-employed people can make voluntary personal contributions at any time (subject to age rules and caps).
      'You can make voluntary contributions whenever you like, for example when a big payment lands.',
      // VERIFY: you can usually claim a tax deduction for personal contributions if you meet the eligibility rules.
      'You can usually claim a tax deduction for those contributions, which lowers your taxable income.',
      // VERIFY: contractors paid mainly for their labour may be entitled to super guarantee from the business paying them.
      "One exception worth checking: if you're a contractor paid mainly for your labour, the business paying you might have to pay super for you.",
    ],
    why: "Employees get super paid for them under the super guarantee. Self-employed people don't, so voluntary contributions are the main way to keep your super growing. Small, regular amounts matter because of compounding over decades.",
    sources: [sources.msSuperSelfEmployed, sources.atoPersonalContributions],
    options: [
      { label: 'How does claiming a deduction work?', next: 'super-deduct' },
      { label: 'Is there a limit on how much I can put in?', next: 'super-cap' },
      { label: "I've got $40k saved. Should I put $20k into super?", next: 'super-40k' },
      BACK,
    ],
  },
  {
    id: 'super-deduct',
    topic: 'Super for the self-employed',
    messages: [
      // VERIFY: personal contributions from after-tax money can usually be claimed as a deduction.
      'Usually, yes. Money you put into super from your bank account can often be claimed as a tax deduction.',
      // VERIFY: steps and order for claiming a deduction (notice of intent, acknowledgement, then tax return).
      "The steps, in order:\n1. Pay the money into your fund.\n2. Send your fund a 'notice of intent to claim a deduction'.\n3. Wait for the fund's written acknowledgement.\n4. Claim the deduction in your tax return.",
      // VERIFY: lodging the return, withdrawing or rolling over before acknowledgement can cost you the deduction.
      'Order matters. If you lodge your tax return, withdraw or roll the money over before you get the acknowledgement, you may lose the deduction.',
      // VERIFY: deducted contributions are taxed in the fund and count towards the concessional cap.
      'Deducted contributions are taxed inside your fund and count towards an annual cap.',
      // VERIFY: age-based work test applies to claiming a deduction for people aged 67 to 74.
      "If you're aged 67 to 74, you also need to meet a work test before you can claim.",
    ],
    why: "The deduction reduces the income you pay tax on, and the fund then pays contributions tax instead. For many people that works out lower overall, but whether it suits you depends on your income and other contributions. That part is personal advice.",
    sources: [sources.atoPersonalContributions, sources.atoNoticeOfIntent],
    options: [
      { label: 'Is there a limit on how much I can put in?', next: 'super-cap' },
      { label: 'What if my income is low some years?', next: 'super-cocontrib' },
      BACK,
    ],
  },
  {
    id: 'super-cap',
    topic: 'Super for the self-employed',
    messages: [
      // VERIFY: separate annual caps apply to concessional and non-concessional contributions.
      "Yes. There's an annual cap on contributions you claim a deduction for (concessional), and a separate cap on contributions you don't (non-concessional).",
      'The caps change from time to time, so check the current figures on the ATO site rather than a number you heard somewhere.',
      // VERIFY: carry-forward of unused concessional cap amounts if total super balance is below a threshold.
      'If your super balance is under a set threshold, you may be able to use unused cap amounts from earlier years. That can suit lumpy income: a big year can catch up on quiet ones.', // P1
      // VERIFY: exceeding a cap can mean extra tax.
      'Going over a cap can mean extra tax, so check before a large contribution.',
    ],
    why: 'Caps limit how much can go into super at the lower tax rates each year. Knowing they exist stops a well-meant large contribution turning into a tax bill.',
    sources: [sources.atoConcessionalCap, sources.atoContributionTypes],
    options: [
      { label: "I've got $40k saved. Should I put $20k into super?", next: 'super-40k' },
      { label: 'What if my income is low some years?', next: 'super-cocontrib' },
      BACK,
    ],
  },
  {
    id: 'super-cocontrib',
    topic: 'Super for the self-employed',
    messages: [
      // VERIFY: government co-contribution on personal after-tax contributions for eligible low and middle income earners.
      'In lower-income years, the government may add money to your after-tax contributions. This is the super co-contribution.',
      // VERIFY: self-employed people can qualify; eligibility depends on income, age and income tests; ATO calculates it from the tax return.
      "Self-employed people can qualify. It depends on your income and age, among other tests, and the ATO works it out from your tax return. You don't apply.",
      // VERIFY: contributions you claim a deduction for don't count towards the co-contribution.
      "One catch: contributions you claim a tax deduction for don't count for the co-contribution.",
    ],
    sources: [sources.atoCoContribution],
    options: [BACK],
  },
  {
    // Rule 1: her own figures -> explain the line, give general rules, offer a human.
    id: 'super-40k',
    topic: 'Super for the self-employed',
    kind: 'personalAdvice',
    messages: [
      "This is where I draw the line. How much of your $40k should go into super depends on your income, tax, cash needs and goals. That's personal advice, and only a licensed adviser can give it.",
      // VERIFY: super is generally preserved until preservation age and retirement or another condition of release.
      // VERIFY: deductible contributions count towards the annual concessional cap.
      'What I can tell you in general:\n• Money in super is generally locked away until you retire after reaching your preservation age, or meet another condition of release.\n• Contributions you claim a deduction for count towards an annual cap.\n• Self-employed people often keep a cash buffer for tax and quiet months before locking money away.', // P1
      "An $RUs adviser can work through your real numbers with you. You choose if and when.",
    ],
    why: 'General information explains how the rules work for everyone. Personal advice takes your situation into account, and the law requires the person giving it to be licensed and to act in your best interests.',
    sources: [sources.msGeneralVsPersonal, sources.msGetYourSuper],
    options: [TALK, { label: 'Explain general vs personal advice', next: 'advice-diff' }, BACK],
  },

  // ---- Budgeting with lumpy income (P1) ----------------------------------
  {
    id: 'budget',
    topic: 'Budgeting with lumpy income',
    messages: ['Income that arrives in lumps. Pick a question.'],
    options: [
      { label: 'How do I budget when income arrives in lumps?', next: 'budget-lumps' },
      { label: 'How much should I set aside for tax?', next: 'budget-tax' },
      { label: 'How big should my buffer be?', next: 'budget-buffer' },
      { label: "What if I get sick and can't work?", next: 'budget-sick' },
      BACK,
    ],
  },
  {
    id: 'budget-lumps',
    topic: 'Budgeting with lumpy income',
    messages: [
      'The usual approach is to stop living off the lumps directly.',
      // VERIFY: Moneysmart recommends separating business and personal money and paying yourself a wage.
      "1. Every payment lands in a separate buffer account.\n2. Pay yourself a regular 'wage' from it each week or fortnight, sized to a quiet month.\n3. Move money for tax into its own account before you treat anything as spendable.",
      'Build the buffer until it covers a few months of costs. Then a slow month is boring, not scary.',
    ],
    why: 'A fixed pay amount turns unpredictable income into a predictable one you can budget around. The buffer absorbs the swings, and a separate tax account stops a big bill landing when the money is already spent.',
    sources: [sources.msSelfEmployment, sources.msHowToBudget],
    options: [
      {
        label: "Add 'pay myself a regular wage' to my plan",
        next: 'plan-step-added',
        action: 'addPlanStep',
        planStep: {
          id: 'regular-wage',
          text: "Pay yourself a regular 'wage' sized to a quiet month",
          detail: 'Set up an automatic weekly or fortnightly transfer from your buffer account.',
        },
      },
      { label: 'How big should my buffer be?', next: 'budget-buffer' },
      { label: 'How much should I set aside for tax?', next: 'budget-tax' },
      BACK,
    ],
  },
  {
    id: 'budget-tax',
    topic: 'Budgeting with lumpy income',
    messages: [
      "It depends on your income and deductions, so I can't give you a number.",
      // VERIFY: sole traders pay tax on business income at individual rates; may be placed in PAYG instalments.
      // VERIFY: GST registration is required once turnover reaches the registration threshold; GST collected is owed to the ATO.
      "In general:\n• Sole traders pay income tax on business profit at personal rates. The ATO may put you on PAYG instalments so you pay during the year instead of in one hit.\n• If your turnover reaches the GST threshold you must register, and GST you collect isn't yours to spend.",
      'Many self-employed people move a set share of every payment into a tax account, and ask an accountant to check the amount once a year.',
    ],
    sources: [sources.msSelfEmployment, sources.atoGstRegistration],
    options: [{ label: 'Talk to someone about my numbers', next: 'to-adviser', action: 'handover' }, BACK],
  },

  // ---- Shares and property basics ----------------------------------------
  {
    id: 'invest',
    topic: 'Shares and property basics',
    messages: ['Investing basics. Pick a question.'],
    options: [
      { label: 'How do shares and ETFs work?', next: 'invest-shares' },
      { label: 'Shares or property: what are the trade-offs?', next: 'invest-property' },
      { label: 'Is micro-investing worth it?', next: 'invest-micro' },
      { label: 'How do I spot an investment scam?', next: 'invest-scams' },
      BACK,
    ],
  },
  {
    id: 'invest-shares',
    topic: 'Shares and property basics',
    messages: [
      'A share is a small piece of a company. An ETF (exchange traded fund) holds many shares in one product, so one purchase gives you some diversification.',
      // VERIFY: shares are volatile and generally suit longer timeframes.
      "Share prices go up and down, sometimes sharply. They generally suit money you won't need for several years.",
      'Watch the fees: brokerage on each trade, plus the ongoing fees inside a fund.',
      // VERIFY: capital gains tax applies to profits on sale; a CGT discount may apply to assets held more than 12 months.
      "Profits when you sell may be taxed as a capital gain. A discount may apply if you've held the investment for more than a year.",
    ],
    sources: [sources.msShares, sources.msDiversification, sources.msInvestingTax],
    options: [{ label: 'Shares or property: what are the trade-offs?', next: 'invest-property' }, BACK],
  },
  {
    id: 'invest-property',
    topic: 'Shares and property basics',
    messages: [
      "You'll know the lending side better than most.",
      // VERIFY: property costs include stamp duty, rates, insurance, maintenance and vacancies.
      // VERIFY: rent/dividends are taxable income and capital gains tax applies to both.
      "The general trade-offs:\n• Property: one large asset, usually bought with borrowed money, which magnifies gains and losses. Costs include stamp duty, rates, insurance, maintenance and empty weeks. You can't sell part of it.\n• Shares: you can start small, spread your money widely and sell quickly, but prices move more visibly day to day.\n• Both: income (rent or dividends) is taxable, and so are capital gains when you sell.",
      'Which suits you depends on your goals, timeframe and cash flow. That part is personal.',
    ],
    sources: [sources.msInvestmentProperty, sources.msChooseInvestments],
    options: [TALK, BACK],
  },

  // ---- General vs personal advice (P3, P5) --------------------------------
  {
    id: 'advice',
    topic: 'General vs personal advice',
    messages: ['How advice works, and where I fit in.'],
    options: [
      { label: "What's the difference between general and personal advice?", next: 'advice-diff' },
      { label: 'How do I check an adviser is licensed?', next: 'advice-register' },
      { label: 'How much does a financial adviser cost?', next: 'advice-cost' },
      { label: 'Can you just tell me what to do with my money?', next: 'advice-ai' },
      BACK,
    ],
  },
  {
    id: 'advice-diff',
    topic: 'General vs personal advice',
    messages: [
      // VERIFY: general advice doesn't consider your objectives, financial situation or needs.
      "General advice explains products and rules without looking at your situation. That's what I give.",
      // VERIFY: personal advice considers objectives, financial situation or needs; best interests duty; Statement of Advice.
      'Personal advice takes your goals and finances into account. The adviser must act in your best interests and give you a Statement of Advice explaining their recommendation.',
      "If you're not sure which one you're getting, ask. It's a normal question.",
    ],
    why: "It's the line I work within. Anything that depends on your figures is personal advice, so I hand you to a licensed human instead of guessing.", // P5
    sources: [sources.msGeneralVsPersonal, sources.asicAdvice],
    options: [{ label: 'How do I check an adviser is licensed?', next: 'advice-register' }, BACK],
  },
  {
    id: 'advice-register',
    topic: 'General vs personal advice',
    messages: [
      // VERIFY: personal advisers must be listed on the Financial Advisers Register, searchable free on Moneysmart.
      'Anyone giving personal financial advice must be on the Financial Advisers Register. You can search it free on Moneysmart.',
      // VERIFY: the register shows qualifications, licensee and bans.
      'It shows their qualifications, who licenses them, and any bans.',
    ],
    sources: [sources.msAdvisersRegister],
    options: [{ label: 'How much does a financial adviser cost?', next: 'advice-cost' }, BACK],
  },
  {
    id: 'advice-ai',
    topic: 'General vs personal advice',
    kind: 'personalAdvice',
    messages: [
      "No. I'm an AI that gives general information. I don't see your figures and I'm not licensed to give personal advice.", // P5
      'I can explain how things work, point you to official sources, and connect you with an $RUs adviser when you want specifics.',
    ],
    sources: [sources.msGeneralVsPersonal],
    options: [TALK, BACK],
  },

  // ---- Added demo questions ----------------------------------------------
  {
    id: 'super-fhss',
    topic: 'Super for the self-employed',
    messages: [
      // VERIFY: the First Home Super Saver (FHSS) scheme lets eligible first home buyers save a deposit inside super via voluntary contributions.
      "Possibly. The First Home Super Saver scheme lets first home buyers save part of a deposit inside super, using voluntary contributions.",
      // VERIFY: FHSS releases are capped per year and in total; eligibility rules apply (e.g. never owned property in Australia).
      "There are limits on how much you can put in each year and in total, plus eligibility rules. You need to apply to the ATO for a release before you sign a contract.",
      // VERIFY: released amounts are taxed at marginal rate less an offset; associated earnings are deemed, not actual.
      'Money released is taxed, usually at a lower effective rate than your normal income. The ATO works out the amount you get back.',
      "You'll know the lending side well. Whether it beats saving in a normal account depends on your income and timing, which is personal.", // P3
    ],
    why: 'Voluntary contributions get the lower tax rate inside super. The scheme lets first home buyers take some of that benefit back out for a deposit, instead of it being locked away until retirement.',
    sources: [sources.atoFhss, sources.msHomeSooner],
    options: [
      { label: 'Is there a limit on how much I can put in?', next: 'super-cap' },
      TALK,
      BACK,
    ],
  },
  {
    id: 'super-lost',
    topic: 'Super for the self-employed',
    messages: [
      "Quite possibly, if you've had a few jobs. Many people have more than one account, each charging fees.", // P2
      // VERIFY: you can find lost and unclaimed super through myGov linked to the ATO.
      'You can see all your super accounts, including lost ones, by logging into myGov and linking the ATO.',
      // VERIFY: consolidating can cancel insurance held in the old fund.
      'Combining accounts can save on fees. Before you do, check whether any old account holds insurance you want to keep, because closing it can cancel that cover.',
    ],
    sources: [sources.msFindLostSuper],
    options: [
      { label: 'How do I know if my super fund is any good?', next: 'super-compare' },
      BACK,
    ],
  },
  {
    id: 'super-compare',
    topic: 'Super for the self-employed',
    messages: [
      // VERIFY: the ATO YourSuper comparison tool compares MySuper products on fees and returns and shows performance test results.
      'The ATO has a free YourSuper comparison tool. It compares many funds on fees and past returns.',
      // VERIFY: MySuper products are subject to an annual performance test; funds that fail must notify members.
      "Funds are tested each year on performance. If yours fails, it has to write and tell you.",
      'Look at fees, long-term returns (not just last year) and any insurance included. Which fund suits you best is personal advice.',
    ],
    sources: [sources.atoYourSuper, sources.msCheckSuper],
    options: [
      { label: 'Could I have old super accounts lying around?', next: 'super-lost' },
      TALK,
      BACK,
    ],
  },
  {
    id: 'budget-buffer',
    topic: 'Budgeting with lumpy income',
    messages: [
      // VERIFY: Moneysmart suggests a good emergency fund target is three months of expenses.
      'A common target is enough to cover about three months of expenses. With lumpy income, many people aim higher.', // P1
      'Work out your monthly costs, then multiply by the number of months you want covered. That\'s your goal.',
      // VERIFY: high-interest savings accounts are a common place for an emergency fund; bonus-rate conditions vary.
      'Keep it somewhere separate and easy to reach, like a savings account. Check any bonus-rate conditions, because some need regular deposits that lumpy income might miss.',
    ],
    why: "A buffer means a quiet month doesn't force you onto a credit card. It's also what lets you pay yourself a steady 'wage' from uneven income.",
    sources: [sources.msEmergencyFund, sources.msSavingsAccounts],
    options: [
      {
        label: "Add 'build a three-month buffer' to my plan",
        next: 'plan-step-added',
        action: 'addPlanStep',
        planStep: {
          id: 'three-month-buffer',
          text: 'Build your buffer to cover about three months of costs',
          detail: 'Top it up from big payments first, before spending.',
        },
      },
      { label: 'How do I budget when income arrives in lumps?', next: 'budget-lumps' },
      BACK,
    ],
  },
  {
    id: 'budget-sick',
    topic: 'Budgeting with lumpy income',
    messages: [
      "It's a real gap. When you're self-employed there's no sick leave, so if you can't work, the income stops.", // P2
      // VERIFY: income protection insurance pays a portion of your income if you can't work due to illness or injury, after a waiting period, for a benefit period.
      'Income protection insurance pays part of your income if illness or injury stops you working. You choose a waiting period before payments start and how long they can last.',
      // VERIFY: premiums for income protection held outside super may be tax deductible.
      'Premiums for cover held outside super may be tax deductible. Some super funds also offer cover, but check what applies to you.',
      "Your buffer is the first line of defence. Insurance covers the longer stretches. Which cover and how much is personal advice.",
    ],
    sources: [sources.msIncomeProtection, sources.msInsuranceInSuper],
    options: [
      { label: 'How big should my buffer be?', next: 'budget-buffer' },
      TALK,
      BACK,
    ],
  },
  {
    id: 'invest-micro',
    topic: 'Shares and property basics',
    messages: [
      'Micro-investing apps let you invest small amounts, sometimes by rounding up your everyday purchases.',
      // VERIFY: flat fees have a bigger impact on small balances.
      'The catch is fees. A flat monthly fee can eat a big share of a small balance, so check the fee against what you plan to put in.',
      "It's still investing: the value goes up and down, and it generally suits money you won't need soon.",
    ],
    sources: [sources.msMicroInvesting],
    options: [
      { label: 'How do shares and ETFs work?', next: 'invest-shares' },
      BACK,
    ],
  },
  {
    id: 'invest-scams',
    topic: 'Shares and property basics',
    messages: [
      // VERIFY: common investment scam signs per Moneysmart.
      "Warning signs:\n• Guaranteed high returns with little or no risk\n• Pressure to decide quickly\n• Contact out of the blue, including on social media or messaging apps\n• Celebrity or 'AI trading' endorsements, often faked", // P5
      // VERIFY: ASIC maintains an investor alert list; businesses offering financial services should hold an AFS licence.
      'Before you invest, check the business on ASIC’s professional registers and the Moneysmart investor alert list.',
      "If you think you've been scammed, contact your bank straight away.",
    ],
    why: "Scams increasingly use fake AI-generated videos and 'AI trading bots'. A real adviser or fund will never guarantee returns.",
    sources: [sources.msInvestmentScams],
    options: [BACK],
  },
  {
    id: 'advice-cost',
    topic: 'General vs personal advice',
    messages: [
      // VERIFY: common advice fee types: SOA fee, ongoing advice fee, hourly rate.
      'Costs vary. Common fees are a one-off fee for your Statement of Advice, an ongoing fee for regular reviews, or an hourly rate for one-off questions.',
      // VERIFY: advisers must disclose fees before providing advice.
      'An adviser has to tell you their fees before they give you advice. Ask for an estimate up front.',
      'An $RUs adviser can walk you through their fees before you commit to anything.',
    ],
    sources: [sources.msAdviceCosts],
    options: [TALK, BACK],
  },

  // ---- Distress (rule 5): calm support card, never positioned as crisis help
  {
    id: 'distress',
    kind: 'distress',
    messages: [
      "Thanks for telling me. Money stress is really common, and you don't have to sort it out alone.",
      "I'm an AI, not a support service. These people can properly help:",
    ],
    sources: [sources.ndh, sources.lifeline],
    options: [{ label: 'Talk to an $RUs adviser', next: 'to-adviser', action: 'handover' }, BACK],
  },

  // ---- Utility nodes -------------------------------------------------------
  {
    id: 'to-adviser',
    kind: 'adviser',
    messages: ["Opening the adviser page. You'll see exactly what gets shared before anything is sent."],
    options: [BACK],
  },
  {
    id: 'plan-step-added',
    messages: ["Added to your plan. You'll see it on My Plan."],
    options: [BACK],
  },
  {
    id: 'plan-made',
    messages: ['Done. Your plan is on the My Plan page. Save it there and come back any time.'], // P4
    options: [BACK],
  },
];

export const newClientFlow: Flow = {
  id: 'newClient',
  start: 'start',
  topicsNode: 'topics',
  nodes: Object.fromEntries(nodes.map((n) => [n.id, n])),
  planOffer: {
    afterAnswers: 2,
    message: 'Want me to turn this into a plan? A few small steps, sized for lumpy income.', // P1, P4
    option: { label: 'Yes, turn this into a plan', next: 'plan-made', action: 'savePlan' },
  },
};

// ---------------------------------------------------------------------------
// Distress support card (rule 5)
// ---------------------------------------------------------------------------

export const supportCard = {
  title: 'People who can help',
  contacts: [
    {
      name: 'An $RUs adviser',
      detail: 'Talk through your situation with a person. No judgement.',
      adviser: true,
    },
    {
      name: 'National Debt Helpline',
      // VERIFY: National Debt Helpline number 1800 007 007; free, confidential financial counselling.
      phone: '1800 007 007',
      detail: 'Free, confidential financial counselling.',
      url: sources.ndh.url,
    },
    {
      name: 'Lifeline',
      // VERIFY: Lifeline 13 11 14, 24/7 crisis support.
      phone: '13 11 14',
      detail: 'Crisis support, any time, day or night.',
      url: sources.lifeline.url,
    },
  ],
  // VERIFY: 000 is the Australian emergency number.
  emergency: 'If you or someone else is in danger right now, call 000.',
};

// ---------------------------------------------------------------------------
// My Plan
// ---------------------------------------------------------------------------

export const planTemplate: PlanStep[] = [
  {
    id: 'buffer-account',
    text: 'Open a separate tax and super buffer account', // P1
    detail: 'Move a set share of every payment into it the day it lands.',
  },
  {
    id: 'check-contributions',
    text: "Check what you've contributed to super this financial year", // P2
    detail: "Your fund's app or statement shows it. The annual cap is on the ATO site.",
  },
  {
    id: 'book-chat',
    text: "Book a 15-minute chat when you're ready", // P4
    detail: 'An $RUs adviser can look at your real numbers.',
    cta: { label: 'Book a chat', to: '/talk' },
  },
];

export const planPage = {
  title: 'My Plan',
  intro: 'Small steps, sized for income that arrives in lumps. Tick them off as you go.',
  empty: 'No plan yet. Read a couple of answers in the chat and I can put one together.',
  saveLabel: 'Save my plan',
  savedNote: 'Saved on this device. No account needed. Come back any time.', // P4, rule 6
  email: {
    title: 'Email me a copy (optional)',
    body: "Only if you want it. We'll use your email for this plan and nothing else.",
    placeholder: 'you@example.com',
    send: 'Send me a copy',
    skip: 'Skip',
    sent: 'v0 mock: no email was sent. In the real app a copy would go to',
  },
};

// ---------------------------------------------------------------------------
// Talk to a person (rule 4). Teal throughout.
// ---------------------------------------------------------------------------

export const handover = {
  title: 'Talk to a person',
  intro: 'A licensed $RUs adviser can look at your own numbers. Before anything is shared, here is exactly what they would see.',
  summaryTitle: 'What we would share',
  emptySummary: "You haven't chatted yet, so the adviser would only get the contact details you enter next.",
  stressConsent: 'Also tell the adviser I mentioned money stress',
  consentLabel: 'Share this and continue',
  declineLabel: 'Not now',
  formTitle: 'How should we reach you?',
  slotsLabel: 'Pick a time for a 15-minute call',
  // Hardcoded v0 slots.
  slots: ['Tomorrow, 9:30 am', 'Tomorrow, 12:15 pm', 'Thursday, 5:30 pm', 'Saturday, 10:00 am'],
  submitLabel: 'Book my call',
  confirmedTitle: "You're booked in",
  adviserName: 'Sam Whitlock', // placeholder adviser
  adviserRole: 'Financial Adviser, $RUs',
  confirmedBody: 'Your adviser will read this summary before calling.',
  mockNote: 'v0 mock: no booking is made and no one will call.',
};
