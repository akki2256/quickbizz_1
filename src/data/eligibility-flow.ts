/** Parse "(Message - …)" helper text from question copy */
export function parseTitleAndHelper(raw: string): { title: string; helper?: string } {
	const marker = '(Message -';
	const i = raw.indexOf(marker);
	if (i === -1) return { title: raw.trim() };
	const title = raw.slice(0, i).trim();
	let helper = raw.slice(i + marker.length).trim();
	if (helper.endsWith(')')) helper = helper.slice(0, -1).trim();
	return { title, helper };
}

/** Split slash-separated options; handles "Yes/No", "a / b / c" */
export function parseOptions(optionStr: string): string[] {
	return optionStr
		.split('/')
		.map((s) => s.trim())
		.filter(Boolean);
}

/** Display-only title case for choice labels (stored values unchanged). */
export function formatChoiceLabel(option: string): string {
	return option
		.split(/\s+/)
		.map((word) => {
			if (word === '&') return '&';
			if (/^[\d<]/.test(word)) return word;
			if (/^\d+-\d+/.test(word)) return word;
			if (/^\d+\+$/.test(word)) return word;
			if (word === 'hrs') return 'Hrs';
			if (!/[a-zA-Z]/.test(word)) return word;
			return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
		})
		.join(' ');
}

export type StepKind = 'choice' | 'text' | 'number' | 'email' | 'tel' | 'otp';

export type EligibilityStep = {
	id: string;
	key: string;
	kind: StepKind;
	/** Raw title string (may include Message clause — parsed in UI) */
	title: string;
	/** If set, choice options */
	options?: string[];
	placeholder?: string;
	min?: number;
	max?: number;
};

const INDUSTRY_OPTIONS = [
	'Retail & wholesale trade',
	'Construction & trades',
	'Professional services',
	'Transport, postal & warehousing',
	'Healthcare & social assistance',
	'Accommodation & food services',
	'Manufacturing',
	'Agriculture, forestry & fishing',
	'Information media & telecommunications',
	'Other / not listed',
];

/**
 * Ordered steps. Slash-separated options in spec → `options` array.
 * No options → text/number/email capture.
 */
export const ELIGIBILITY_STEPS: EligibilityStep[] = [
	{
		id: '1',
		key: 'fundPurpose',
		kind: 'choice',
		title: 'What Do You Need These Funds For?',
		options: parseOptions(
			'cashflow / working capital / stock / supplies / equipment / growth or project / general',
		),
	},
	{
		id: '2',
		key: 'hasAbn',
		kind: 'choice',
		title: 'Do you have an ABN?',
		options: parseOptions('Yes / No'),
	},
	{
		id: '3',
		key: 'loanUse',
		kind: 'choice',
		title: 'Is This Loan For Business Or Personal Reasons?',
		options: parseOptions('Business Use / Personal Use'),
	},
	{
		id: '4',
		key: 'borrowAmountAud',
		kind: 'number',
		title:
			'How Much Do You Want to Borrow? ($AUD) (Message - Minimum loan amount starts at $5000.)',
		min: 5000,
		placeholder: 'e.g. 25000',
	},
	{
		id: '5',
		key: 'citizenOrPr',
		kind: 'choice',
		title: 'Are You an Australian Citizen or Permanent Resident?',
		options: parseOptions('Yes / No'),
	},
	{
		id: '6',
		key: 'monthsTrading',
		kind: 'number',
		title:
			'How Many Months Have You Been Trading? (Message - Please enter your trading time in months, so our system will be able to match you with the right lenders.)',
		min: 0,
		placeholder: 'e.g. 18',
	},
	{
		id: '7',
		key: 'homeowner',
		kind: 'choice',
		title:
			'Are You a Homeowner? (Message - Being a homeowner can help to strengthen your application.)',
		options: parseOptions('Yes / No'),
	},
	{
		id: '8',
		key: 'monthlyRevenueAud',
		kind: 'number',
		title:
			"What Is Your Business's Monthly Revenue? ($AUD) (Message - Enter the total amount of money that hits your bank account each month before any taxes, expenses, or owner drawings are taken out.)",
		min: 0,
		placeholder: 'e.g. 45000',
	},
	{
		id: '9',
		key: 'industry',
		kind: 'choice',
		title: 'What Industry Is Your Business In?',
		options: INDUSTRY_OPTIONS,
	},
	{
		id: '10',
		key: 'creditHistory',
		kind: 'choice',
		title: 'What Is Your Credit History?',
		options: parseOptions('800+ / 600-800 / 400-600 / <400'),
	},
	{
		id: '11',
		key: 'hasDefaults',
		kind: 'choice',
		title:
			'Do You Have Any Defaults On This Or Any Other Company? (Message - We can help clients even with existing defaults. Please be as accurate as you can, so we can save time by going to the right lenders that match your unique situation.)',
		options: parseOptions('Yes / No'),
	},
	{
		id: '12',
		key: 'trustAccount',
		kind: 'choice',
		title: 'Does Your Business Operate Under a Trust Account?',
		options: parseOptions('Yes / No'),
	},
	{
		id: '13',
		key: 'fundsTiming',
		kind: 'choice',
		title: 'How Soon Do You Need The Funds?',
		options: parseOptions('today / 24-48 hrs / 7 days / 2 weeks'),
	},
	{
		id: '14',
		key: 'loanPriority',
		kind: 'choice',
		title:
			"What's Most Important to You in a Loan? (Message - Choose the one that best matches your needs right now.)",
		options: parseOptions(
			'Fits in my budget / Speed / Rates / Loan Amount / Flexibility',
		),
	},
	{
		id: '15',
		key: 'maxWeeklyRepaymentAud',
		kind: 'number',
		title:
			"What's The Maximum Weekly Repayment You'd Feel Comfortable With For The Right Loan? (Message - We use this to match your cashflow with the right funding. This is non-binding - we'll provide multiple options based on your business's full potential.)",
		min: 0,
		placeholder: 'e.g. 500',
	},
	{
		id: '16',
		key: 'callTime',
		kind: 'choice',
		title: 'What Is The Best Time To Call You?',
		options: parseOptions('9-12 AM / 12-6 PM / Anytime'),
	},
	{
		id: '17',
		key: 'fullName',
		kind: 'text',
		title: 'Please Enter Your Name',
		placeholder: 'Full name',
	},
	{
		id: '18',
		key: 'companyName',
		kind: 'text',
		title: 'Confirm Your Registered Company Name',
		placeholder: 'Registered company name',
	},
	{
		id: '19',
		key: 'abn',
		kind: 'text',
		title:
			"Confirm Your ABN (Message - If you're not sure, please use ABN Lookup to quickly find it by clicking here: ABN Lookup (business.gov.au))",
		placeholder: '11 digit ABN',
	},
	{
		id: '20',
		key: 'email',
		kind: 'email',
		title:
			'Confirm Your Email Address (Message - Your email will be used as your secure login for Portal. Double-check for typos so you can fast-track your application and access your finance offers.)',
		placeholder: 'you@business.com.au',
	},
	{
		id: '21',
		key: 'mobile',
		kind: 'tel',
		title:
			"Confirm Your Mobile Number (Message - We'll send a secure 6-digit code to verify your application. Please confirm your mobile is correct so you can receive your code instantly.)",
		placeholder: '04xx xxx xxx',
	},
	{
		id: '22',
		key: 'otp',
		kind: 'otp',
		title: 'Enter the 6-digit code we sent to your mobile',
		placeholder: '6-digit code',
	},
];

export const ELIGIBILITY_STEP_COUNT = ELIGIBILITY_STEPS.length;
