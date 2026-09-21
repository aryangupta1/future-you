import type { Source } from '../engine/types';

// Official sources cited by answers. Every URL returned HTTP 200 when checked
// on 21 Sep 2026. Government sites move pages around; re-check before release.

const ATO_SUPER =
  'https://www.ato.gov.au/individuals-and-families/super-for-individuals-and-families/super/growing-and-keeping-track-of-your-super';

export const sources = {
  atoPersonalContributions: {
    label: 'ATO: Personal super contributions',
    url: `${ATO_SUPER}/how-to-save-more-in-your-super/personal-super-contributions`,
  },
  atoNoticeOfIntent: {
    label: 'ATO: Notice of intent to claim a deduction',
    url: 'https://www.ato.gov.au/forms-and-instructions/superannuation-personal-contributions-notice-of-intent-to-claim-or-vary-a-deduction',
  },
  atoConcessionalCap: {
    label: 'ATO: Concessional contributions cap',
    url: `${ATO_SUPER}/caps-limits-and-tax-on-super-contributions/concessional-contributions-cap`,
  },
  atoContributionTypes: {
    label: 'ATO: Concessional and non-concessional contributions',
    url: `${ATO_SUPER}/caps-limits-and-tax-on-super-contributions/understanding-concessional-and-non-concessional-contributions`,
  },
  atoCoContribution: {
    label: 'ATO: Super co-contribution',
    url: `${ATO_SUPER}/how-to-save-more-in-your-super/government-super-contributions/super-co-contribution`,
  },
  atoGstRegistration: {
    label: 'ATO: Registering for GST',
    url: 'https://www.ato.gov.au/businesses-and-organisations/gst-excise-and-indirect-taxes/gst/registering-for-gst',
  },
  msSuperSelfEmployed: {
    label: 'Moneysmart: Super for self-employed people',
    url: 'https://moneysmart.gov.au/grow-your-super/super-for-self-employed-people',
  },
  msSelfEmployment: {
    label: 'Moneysmart: Self-employment',
    url: 'https://moneysmart.gov.au/work-and-tax/self-employment',
  },
  msHowToBudget: {
    label: 'Moneysmart: How to do a budget',
    url: 'https://moneysmart.gov.au/budgeting/how-to-do-a-budget',
  },
  msGetYourSuper: {
    label: 'Moneysmart: Getting your super',
    url: 'https://moneysmart.gov.au/how-super-works/getting-your-super',
  },
  msGeneralVsPersonal: {
    label: 'Moneysmart: General and personal financial advice',
    url: 'https://moneysmart.gov.au/financial-advice/general-and-personal-financial-advice',
  },
  msAdvisersRegister: {
    label: 'Moneysmart: Financial Advisers Register',
    url: 'https://moneysmart.gov.au/financial-advice/financial-advisers-register',
  },
  asicAdvice: {
    label: 'ASIC: Giving financial product advice',
    url: 'https://asic.gov.au/regulatory-resources/financial-services/giving-financial-product-advice/',
  },
  msShares: {
    label: 'Moneysmart: Shares',
    url: 'https://moneysmart.gov.au/shares',
  },
  msDiversification: {
    label: 'Moneysmart: Diversification',
    url: 'https://moneysmart.gov.au/how-to-invest/diversification',
  },
  msInvestingTax: {
    label: 'Moneysmart: Investing and tax',
    url: 'https://moneysmart.gov.au/how-to-invest/investing-and-tax',
  },
  msInvestmentProperty: {
    label: 'Moneysmart: Buying an investment property',
    url: 'https://moneysmart.gov.au/property-investment/buying-an-investment-property',
  },
  msChooseInvestments: {
    label: 'Moneysmart: Choose your investments',
    url: 'https://moneysmart.gov.au/how-to-invest/choose-your-investments',
  },
  atoFhss: {
    label: 'ATO: First home super saver scheme',
    url: 'https://www.ato.gov.au/individuals-and-families/super-for-individuals-and-families/super/withdrawing-and-using-your-super/early-access-to-super/first-home-super-saver-scheme',
  },
  atoYourSuper: {
    label: 'ATO: YourSuper comparison tool',
    url: 'https://www.ato.gov.au/calculators-and-tools/super-yoursuper-comparison-tool',
  },
  msHomeSooner: {
    label: 'Moneysmart: Ways to buy a home sooner',
    url: 'https://moneysmart.gov.au/saving/ways-to-buy-a-home-sooner',
  },
  msFindLostSuper: {
    label: 'Moneysmart: Find lost super',
    url: 'https://moneysmart.gov.au/how-super-works/find-lost-super',
  },
  msCheckSuper: {
    label: 'Moneysmart: How to check your super',
    url: 'https://moneysmart.gov.au/grow-your-super/how-to-check-your-super',
  },
  msPaydaySuper: {
    label: 'Moneysmart: What is Payday Super?',
    url: 'https://moneysmart.gov.au/how-super-works/what-is-payday-super',
  },
  msEmergencyFund: {
    label: 'Moneysmart: Save for an emergency fund',
    url: 'https://moneysmart.gov.au/saving/save-for-an-emergency-fund',
  },
  msSavingsAccounts: {
    label: 'Moneysmart: Savings accounts',
    url: 'https://moneysmart.gov.au/banking/savings-accounts',
  },
  msIncomeProtection: {
    label: 'Moneysmart: Income protection insurance',
    url: 'https://moneysmart.gov.au/how-life-insurance-works/income-protection-insurance',
  },
  msInsuranceInSuper: {
    label: 'Moneysmart: Insurance through super',
    url: 'https://moneysmart.gov.au/how-life-insurance-works/insurance-through-super',
  },
  msMicroInvesting: {
    label: 'Moneysmart: Micro-investing',
    url: 'https://moneysmart.gov.au/how-to-invest/micro-investing',
  },
  msInvestmentScams: {
    label: 'Moneysmart: Investment scams',
    url: 'https://moneysmart.gov.au/financial-scams/investment-scams',
  },
  msAdviceCosts: {
    label: 'Moneysmart: Financial advice costs',
    url: 'https://moneysmart.gov.au/financial-advice/financial-advice-costs',
  },
  // Landing page "why now" figures. Both checked against the primary source on 21 Sep 2026.
  asfaSelfEmployed: {
    label: 'ASFA: Superannuation balances of the self-employed (2018)',
    url: 'https://www.superannuation.asn.au/wp-content/uploads/2023/09/1803-Superannuation_balances_of_the_self-employed.pdf',
  },
  asicGenZ: {
    label: 'ASIC: Gen Z Financial Behaviours Report (2026)',
    url: 'https://www.asic.gov.au/about-asic/news-centre/find-a-media-release/2026-releases/26-049mr-asic-urges-gen-z-to-sense-check-money-advice-as-social-media-fuels-riskier-financial-decisions',
  },
  ndh: { label: 'National Debt Helpline', url: 'https://ndh.org.au' },
  lifeline: { label: 'Lifeline', url: 'https://www.lifeline.org.au' },
} satisfies Record<string, Source>;
