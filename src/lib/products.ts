export interface ProductItem {
	slug: string;
	title: string;
	/** Short summary shown in the home page product detail panel. */
	summary: string;
}

/** Product list — home page + `/products/[slug]` routes. */
export const products: ProductItem[] = [
	{
		slug: 'fast-business-loans',
		title: 'Fast Business Funding',
		summary:
			`When new openings arise, supplier payments are due, or payroll needs to be met, timing matters. Detentions in backing can slow down operations and impact business growth. That’s why Quick Bizz helps Australian businesses access presto and flexible backing results when they need it most.

Quick Bizz is a business finance innovator service. We don't give credit, and we aren't a lender. Rather, we connect eligible Australian businesses with trusted lenders who offer quick assessments and effective backing options. For numerous aspirants, tentative blessings may be available in a short timeframe, with funds potentially released soon after all required documents are completed and agreements are signed.

This means Faster access to working capital, lower paperwork and a simpler process. Support for supplier payments and payroll needs, an opportunity to act swiftly on business growth plans, and more time to concentrate on running your business. Whether you need short-term cash inflow support, finances for expansion, or help covering critical business charges, Quick Bizz is here to help connect you with suitable lending options.`,
	},
	{
		slug: 'business-line-of-credit',
		title: 'Business Line of Credit',
		summary:
			`Flexible Funding When Your Business Needs It
Cash flow can change quickly in any business. Some weeks may bring strong incoming payments, while other times you may be waiting on invoices as regular expenses continue. Having access to flexible finance can make it easier to manage these ups and downs with confidence. A Business Line of Credit gives Australian businesses access to an approved credit limit that can be used when required. Rather than receiving one fixed lump sum, you can draw funds as needed, repay the balance, and access those funds again—providing greater flexibility to support day-to-day operations.

At Quick Bizz, we are an introducer service. We do not provide credit and are not a lender. Instead, we help eligible ABN-holding Australian businesses connect with reputable lenders that offer revolving credit facilities designed to support changing business needs.

How a Business Line of Credit Can Help:
A line of credit can be useful for:
• Managing short-term cash flow gaps
• Covering supplier or operational expenses
• Purchasing stock or inventory
• Handling seasonal fluctuations
• Taking advantage of growth opportunities
• Accessing funds only when required

Why Businesses Choose This Option. Unlike traditional loans, a line of credit offers flexibility. You may only use what you need, when you need it, helping your business stay prepared without borrowing more than necessary.`,
	},
	{
		slug: 'short-term-business-loans',
		title: 'Short-Term Business Loans',
		summary:
			`Business conditions can change quickly. Seasonal slow periods, unexpected expenses, or urgent growth opportunities can create short-term pressure on cash flow, even for well-established businesses. Having access to the right funding at the right time can help your business stay on track. A Short-Term Business Loan is designed to provide fast access to working capital with repayment terms that are generally shorter than traditional long-term finance options. This can make it a practical solution for businesses that need immediate support without a lengthy commitment.

At Quick Bizz, we are an introducer service. We do not provide credit and are not a lender. Instead, we help eligible ABN-holding Australian businesses connect with reputable lenders who offer short-term funding solutions tailored to business needs.

How Short-Term Business Loans Can Help
Short-term funding may be suitable for:
• Managing temporary cash flow gaps
• Covering unexpected business expenses
• Purchasing stock or inventory quickly
• Taking advantage of urgent business opportunities
• Funding marketing campaigns or short-term projects
• Supporting operations during quieter seasons

Why Businesses Choose Short-Term Finance?
Short-term loans can provide quicker access to funds and may offer repayment structures suited to immediate business goals. They can be useful when you need finance now without committing to a long repayment period.`,
	},
	{
		slug: 'unsecured-business-loans',
		title: 'Unsecured Business Loans',
		summary:
			`Access Business Funding Without using assets as security

Many Business owners prefer funding solutions that do not require property, vehicles, or equipment to be offered as collateral. In some cases, using business assets as security may not be practical or desirable. That’s where unsecured finance can be a valuable option.
An Unsecured business loan can provide eligible Australian businesses with access to working capital based on factors such as business performance, cash flow, and trading history rather than relying solely on secured assets.

At Quick Bizz, we are an introducer service. We do not provide credit and are not a lender. Instead, we help eligible ABN-holding Australian businesses connect with reputable lenders who offer unsecured funding solutions tailored to business needs.

How Unsecured business loans can help?
This type of funding may be useful for:
• Managing business cash flow
• Purchasing stock or inventory
• Covering operational expenses
• Expanding your business
• Marketing and growth initiatives
• Handling unexpected costs

Why businesses choose unsecured Finance?
Unsecured funding can be attractive because it may allow access to finance without pleading major assets as security. It can also provide a simpler pathway for businesses seeking flexibility and quicker finance options, subject to lender assessment.`,
	},
	{
		slug: 'low-doc-business-loans',
		title: 'Low-Doc Business Loans',
		summary:
			`Low-Doc Business Loans in Australia: Simplified Funding for Busy Business Owners.
Not every business has the time or the coffers to prepare an expansive fiscal attestation. Whether you’re self-employed, a small business proprietor, or managing growing operations, penetrating finance shouldn’t be a lengthy or complicated process.
A Low Doc Business Loan is designed for businesses that may not have full fiscal statements readily available. Rather, lenders may assess your operation based on indispensable documents such as recent bank statements, BAS, or evidence of business exertion — helping streamline the backing process.
At Quick Bizz, we're an innovative service. We don't give credit and aren't a lender. Our part is to connect eligible ABN- holding Australian businesses with estimable lenders who offer low attestation backing options.

How Low Doc Business Loans Can Help
Low croaker backing may be suitable for:
• self-employed and small business owners
• Businesses with limited fiscal paperwork
• Managing short- term cash inflow needs
• Purchasing stock or outfit
• Supporting business expansion
• Handling critical charges.

Common Documents That May Be Needed
Depending on the lender, you may be asked to give Recent business bank statements, BAS( Business Activity Statements), ABN/ ACN details, evidence of identity, business expenditure or profit substantiation.

Why Businesses Choose Low Doc Loans
Low-croaker loans can offer a more flexible and time-efficient way to access backing, especially when traditional attestation isn't readily available. This makes them a practical option for businesses that need quicker fiscal support`,
	},
	{
		slug: 'business-equity-finance',
		title: 'Business Equity Finance',
		summary:
			`Unleash Funding Using Your Business Strength

As your business grows, you may create value through means, profit, and overall performance. Business Equity Finance allows you to work that value to secure backing for further growth, expansion or fiscal stability. Rather than counting cash on cash inflow, this type of backing considers the equity or value within your business, helping you access larger or further structured finance options.

At Quick Bizz, we’re an innovation service. We don’t give credit and aren’t a lender. We connect eligible ABN- holding Australian businesses with estimable lenders who offer equity-grounded finance results suited to their requirements.

How Business Equity Finance can help
Equity-grounded backing may be suitable for:
• Business expansion and scaling
• Purchasing marketable means or property
• Investing in new openings
• Strengthening cash inflow
• Refinancing of business arrears
• Supporting long-term growth plans

What Lender May Consider:
Depending on the lender, factors may include:
• Business value and performance
• Profit and profitability
• Being means or equity position
• Trading history
• Fiscal stability

Why Businesses Choose Equity Finance
Business equity finance can give access to advanced funding limits and further structured financial results. It may be suitable for established businesses looking to grow strategically without relying only on short-term backing.`,
	},
	{
		slug: 'bad-credit-business-loans',
		title: 'Bad Credit Business Loan',
		summary:
			`Funding Options When your Credit History isn’t perfect
A less-than-perfect credit history can make it harder to access traditional finance – but it doesn’t always mean your business is out of options. Many lenders today look beyond just credit scores and consider the overall strength of your business.
A bad credit business loan is designed for businesses that may have faced financial challenges in the past but are still operating and generating revenue. Lenders may assess factors such as cash flow, trading history and current business performance rather than relying solely on credit history.

At Quick Bizz, we are an introducer service. We don’t provide credit and are not a lender. We help eligible ABN-holding Australian businesses connect with reputable lenders who consider applications from businesses with varied credit profiles.

How Bad Credit Business Loans Can Help
This type of funding may be useful for:
• Managing cash flow challenges
• Covering urgent business expenses
• Paying suppliers or operational costs
• Rebuilding business stability
• Investing in revenue-generating opportunities

What Lenders May Consider
Even with a lower credit score, lenders may look at:
• Business revenue and cash flow
• Trading history
• Bank statements
• Existing liabilities
• Overall business performance`,
	},
];

export function getProductBySlug(slug: string): ProductItem | undefined {
	return products.find((p) => p.slug === slug);
}

/** Safe in-app path for EMI "back to product" (blocks open redirects). */
export function safeReturnToProductPath(value: string | null | undefined): string | null {
	if (value == null || value === '') return null;
	let path: string;
	try {
		path = decodeURIComponent(value.trim());
	} catch {
		return null;
	}
	if (!path.startsWith('/products/')) return null;
	if (path.includes('?') || path.includes('#')) return null;
	const slug = path.slice('/products/'.length);
	if (!slug || slug.includes('/')) return null;
	return getProductBySlug(slug) ? path : null;
}
