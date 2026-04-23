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
		title: 'Fast Business Loans',
		summary:
			'When timing matters, fast business loans can help you cover cash flow gaps, seize opportunities, or settle urgent bills. We work with lenders who prioritise quick assessment so you are not left waiting. Eligibility and rates depend on your trading history and security offered—replace this copy with your final positioning.',
	},
	{
		slug: 'business-line-of-credit',
		title: 'Business Line of Credit',
		summary:
			'A line of credit gives you a pre-approved limit to draw from as needed—pay interest on what you use, not the full limit. Ideal for seasonal businesses or uneven invoicing. Limits and pricing vary by lender and your profile; placeholder text until your compliance-approved description is ready.',
	},
	{
		slug: 'short-term-business-loans',
		title: 'Short-Term Business Loans',
		summary:
			'Short-term facilities are structured for near-term needs: bridging ATO obligations, stock, or a short project window. Terms and costs differ from longer loans—your specialist can outline repayment frequency and total cost of credit. Replace with your approved messaging.',
	},
	{
		slug: 'unsecured-business-loans',
		title: 'Unsecured business Loans',
		summary:
			'Unsecured options may suit businesses that prefer not to tie up specific assets, subject to lender criteria and pricing. Amounts and rates typically reflect risk and trading strength. This is placeholder content for the panel—update when your product rules are final.',
	},
	{
		slug: 'low-doc-business-loans',
		title: 'Low Doc Business Loans',
		summary:
			'Low-documentation paths can work when full financials are not readily available, often using bank statements and BAS as core evidence. Not all businesses qualify; suitability is assessed case by case. Placeholder summary for the interactive panel.',
	},
	{
		slug: 'business-equity-finance',
		title: 'Business Equity Finance',
		summary:
			'Equity finance helps businesses unlock funding based on business value and ownership structure, often to support growth, expansion, or strategic projects. Structure and eligibility vary by provider. Replace this text with your licenced description and typical use cases.',
	},
	{
		slug: 'bad-credit-business-loans',
		title: 'bad credit Business Loans',
		summary:
			'If your credit file has blemishes, some specialist programs still consider trading performance and security. Outcomes are not guaranteed and pricing may reflect risk. Use this space later for compliant, clear wording about how you assist in this segment.',
	},
];

export function getProductBySlug(slug: string): ProductItem | undefined {
	return products.find((p) => p.slug === slug);
}
