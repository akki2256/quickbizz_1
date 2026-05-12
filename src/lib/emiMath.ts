/** Standard amortising loan monthly repayment. */
export function computeEmi(loanAmount: number, annualRatePercent: number, nMonths: number): number | null {
	if (loanAmount <= 0 || nMonths <= 0 || !Number.isFinite(loanAmount) || !Number.isFinite(nMonths)) {
		return null;
	}
	const r = annualRatePercent / 100 / 12;
	if (r === 0) return loanAmount / nMonths;
	const pow = (1 + r) ** nMonths;
	return (loanAmount * r * pow) / (pow - 1);
}
