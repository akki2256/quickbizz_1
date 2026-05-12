import { useLayoutEffect, useMemo, useState } from 'react';
import { safeReturnToProductPath } from '../lib/products';
import { computeEmi } from '../lib/emiMath';
import EmiLenderComparison from './EmiLenderComparison';

const PRINCIPAL_MIN = 10_000;
const PRINCIPAL_MAX = 2_000_000;
const PRINCIPAL_SLIDER_STEP = 1_000;

/** Annual rate, 10–40%, stored and shown to 2 decimal places. */
const RATE_MIN = 10;
const RATE_MAX = 40;
const RATE_SLIDER_STEP = 0.01;

/** Finer than 1 month so the term slider track feels as smooth as amount/rate; EMI still uses whole months. */
const TERM_SLIDER_STEP = 0.1;

/** 6 months minimum; maximum 7 years (84 months). */
const MONTHS_MIN = 6;
const MONTHS_MAX = 84;

function clamp(n: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, n));
}

const aud = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });
const pct = new Intl.NumberFormat('en-AU', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });

type TermUnit = 'years' | 'months';

function pieSlicePath(cx: number, cy: number, r: number, startAngle: number, sweep: number): string {
	if (sweep <= 0) return '';
	const endAngle = startAngle + sweep;
	const x1 = cx + r * Math.cos(startAngle);
	const y1 = cy + r * Math.sin(startAngle);
	const x2 = cx + r * Math.cos(endAngle);
	const y2 = cy + r * Math.sin(endAngle);
	const large = sweep > Math.PI ? 1 : 0;
	return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
}

function RepaymentPieChart({
	principal,
	interest,
	compact = false,
}: {
	principal: number;
	interest: number;
	compact?: boolean;
}) {
	const total = principal + interest;
	if (total <= 0 || !Number.isFinite(total)) return null;

	const cx = 100;
	const cy = 100;
	const r = compact ? 70 : 88;
	const dim = compact ? 168 : 200;
	const start = -Math.PI / 2;
	const pSweep = (2 * Math.PI * principal) / total;
	const iSweep = (2 * Math.PI * interest) / total;

	const dPrincipal = pieSlicePath(cx, cy, r, start, pSweep);
	const dInterest = pieSlicePath(cx, cy, r, start + pSweep, iSweep);

	const pShare = principal / total;
	const iShare = interest / total;
	const title = `Total repayment split: ${pct.format(pShare)} principal, ${pct.format(iShare)} interest.`;

	return (
		<div
			className={`flex flex-col gap-2 ${compact ? 'items-center lg:items-center' : 'items-center gap-3 sm:items-start'}`}
		>
			<p
				className={`text-center font-medium text-fg-muted ${compact ? 'text-[11px] lg:w-full' : 'text-xs sm:text-left'}`}
			>
				Total repayment split
			</p>
			<svg
				width={dim}
				height={dim}
				viewBox="0 0 200 200"
				className="shrink-0 drop-shadow-md"
				role="img"
				aria-label={title}
			>
				<title>{title}</title>
				{dPrincipal && (
					<path d={dPrincipal} fill="var(--color-brand)" stroke="var(--color-surface)" strokeWidth={2} />
				)}
				{dInterest && iShare > 0.0005 && (
					<path d={dInterest} fill="#ca8a04" stroke="var(--color-surface)" strokeWidth={2} />
				)}
			</svg>
			<ul
				className={`flex flex-wrap justify-center gap-x-3 gap-y-1.5 text-fg-muted ${compact ? 'max-w-[11rem] justify-center text-[11px] leading-relaxed' : 'gap-x-4 gap-y-2 text-xs sm:justify-start'}`}
			>
				<li className="flex items-center gap-1.5">
					<span className="h-2 w-2 shrink-0 rounded-sm bg-brand" aria-hidden />
					<span>
						Principal <span className="font-semibold tabular-nums text-fg">{pct.format(pShare)}</span>
					</span>
				</li>
				<li className="flex items-center gap-1.5">
					<span className="h-2 w-2 shrink-0 rounded-sm bg-[#ca8a04]" aria-hidden />
					<span>
						Interest <span className="font-semibold tabular-nums text-fg">{pct.format(iShare)}</span>
					</span>
				</li>
			</ul>
		</div>
	);
}

function monthsFromTermInput(raw: string, unit: TermUnit): number | null {
	const t = raw.replace(/,/g, '').trim();
	if (t === '') return null;
	const n = Number.parseFloat(t);
	if (!Number.isFinite(n) || n <= 0) return null;
	if (unit === 'months') {
		return clamp(Math.round(n), MONTHS_MIN, MONTHS_MAX);
	}
	const months = Math.round(n * 12);
	return clamp(months, MONTHS_MIN, MONTHS_MAX);
}

function termStrFromMonths(nMonths: number, unit: TermUnit): string {
	if (unit === 'months') return String(nMonths);
	const y = nMonths / 12;
	if (Number.isInteger(y)) return String(y);
	return String(Math.round(y * 100) / 100);
}

export default function EmiCalculator() {
	const [backHref, setBackHref] = useState('/#products');

	const [principalNum, setPrincipalNum] = useState(100_000);
	const [principalStr, setPrincipalStr] = useState('100000');

	const [rateNum, setRateNum] = useState(20);
	const [rateStr, setRateStr] = useState('20.00');

	const [termUnit, setTermUnit] = useState<TermUnit>('years');
	const [termMonthsPrecise, setTermMonthsPrecise] = useState(60);
	const [termStr, setTermStr] = useState('5');

	const nMonths = clamp(Math.round(termMonthsPrecise), MONTHS_MIN, MONTHS_MAX);

	useLayoutEffect(() => {
		const raw = new URLSearchParams(window.location.search).get('returnTo');
		const safe = safeReturnToProductPath(raw);
		if (safe) setBackHref(safe);
	}, []);

	const setPrincipalFromSlider = (v: number) => {
		const p = Math.round(v / PRINCIPAL_SLIDER_STEP) * PRINCIPAL_SLIDER_STEP;
		const c = clamp(p, PRINCIPAL_MIN, PRINCIPAL_MAX);
		setPrincipalNum(c);
		setPrincipalStr(String(c));
	};

	const onPrincipalText = (raw: string) => {
		setPrincipalStr(raw);
		const n = Number.parseFloat(raw.replace(/,/g, ''));
		if (Number.isFinite(n) && n > 0) {
			setPrincipalNum(clamp(n, PRINCIPAL_MIN, PRINCIPAL_MAX));
		}
	};

	const setRateFromSlider = (v: number) => {
		const c = clamp(Math.round(v * 100) / 100, RATE_MIN, RATE_MAX);
		setRateNum(c);
		setRateStr(c.toFixed(2));
	};

	const onRateText = (raw: string) => {
		setRateStr(raw);
		const n = Number.parseFloat(raw);
		if (Number.isFinite(n) && n >= RATE_MIN && n <= RATE_MAX) {
			setRateNum(Math.round(n * 100) / 100);
		}
	};

	const onTermText = (raw: string) => {
		setTermStr(raw);
		const m = monthsFromTermInput(raw, termUnit);
		if (m !== null) setTermMonthsPrecise(m);
	};

	const switchTermUnit = (next: TermUnit) => {
		if (next === termUnit) return;
		setTermUnit(next);
		setTermStr(termStrFromMonths(nMonths, next));
	};

	const parsed = useMemo(() => {
		const P = principalNum;
		const rate = rateNum;
		const n = nMonths;
		return { P, rate, n };
	}, [principalNum, rateNum, nMonths]);

	const emi = useMemo(() => computeEmi(parsed.P, parsed.rate, parsed.n), [parsed]);

	const summary = useMemo(() => {
		if (emi === null || !Number.isFinite(emi)) return null;
		const totalRepayments = emi * parsed.n;
		const interest = totalRepayments - parsed.P;
		if (!Number.isFinite(totalRepayments) || !Number.isFinite(interest)) return null;
		return { emi, totalRepayments, interest, n: parsed.n };
	}, [emi, parsed.P, parsed.n]);

	const rangeClass =
		'mt-2 lg:mt-1.5 h-2 w-full cursor-pointer appearance-none rounded-full bg-brand/10 accent-[var(--color-cta)] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cta [&::-webkit-slider-thumb]:shadow-md';

	return (
		<section className="border-b border-brand/10 bg-gradient-to-b from-page to-surface-subtle py-10 sm:py-14 lg:py-10">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<header className="text-center">
					<p className="text-sm font-medium text-brand-secondary">
						<a href={backHref} className="transition hover:text-brand">
							← Back to products
						</a>
					</p>
					<h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-brand sm:text-4xl">
						EMI calculator
					</h1>
					<p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-fg-muted">
						Estimate your monthly repayment using the standard amortising loan formula. Figures are illustrative
						only—not a quote, approval, or offer of credit.
					</p>
				</header>

				<div className="mx-auto mt-6 w-full max-w-7xl rounded-2xl border border-brand/20 bg-surface p-5 shadow-xl shadow-brand/10 sm:p-6 lg:mt-5 lg:p-6">
					<div className="flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:items-stretch lg:gap-8">
						<div className="flex min-w-0 flex-col gap-6 lg:col-span-4 lg:h-full lg:min-h-0">
							<form className="space-y-5 lg:space-y-4" onSubmit={(e) => e.preventDefault()}>
						<div>
							<div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
								<label htmlFor="emi-principal" className="text-sm font-medium text-fg">
									Loan amount (AUD)
								</label>
								<span className="text-xs text-fg-muted tabular-nums">
									{aud.format(PRINCIPAL_MIN)} – {aud.format(PRINCIPAL_MAX)}
								</span>
							</div>
							<input
								id="emi-principal-slider"
								type="range"
								min={PRINCIPAL_MIN}
								max={PRINCIPAL_MAX}
								step={PRINCIPAL_SLIDER_STEP}
								value={clamp(principalNum, PRINCIPAL_MIN, PRINCIPAL_MAX)}
								onChange={(e) => setPrincipalFromSlider(Number(e.target.value))}
								className={rangeClass}
								aria-valuemin={PRINCIPAL_MIN}
								aria-valuemax={PRINCIPAL_MAX}
								aria-valuenow={principalNum}
								aria-valuetext={aud.format(principalNum)}
							/>
							<input
								id="emi-principal"
								type="text"
								inputMode="decimal"
								autoComplete="off"
								value={principalStr}
								onChange={(e) => onPrincipalText(e.target.value)}
								onBlur={() => {
									const n = Number.parseFloat(principalStr.replace(/,/g, ''));
									if (Number.isFinite(n) && n > 0) {
										const c = clamp(n, PRINCIPAL_MIN, PRINCIPAL_MAX);
										setPrincipalNum(c);
										setPrincipalStr(String(c));
									} else {
										setPrincipalStr(String(principalNum));
									}
								}}
								className="mt-2 w-full rounded-xl border border-brand/20 bg-page px-4 py-3 text-fg placeholder:text-fg-muted/70 focus:border-cta focus:outline-none focus:ring-2 focus:ring-cta/25"
								placeholder="e.g. 100000"
							/>
						</div>

						<div>
							<div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
								<label htmlFor="emi-rate" className="text-sm font-medium text-fg">
									Annual interest rate (%)
								</label>
								<span className="text-xs text-fg-muted tabular-nums">
									{RATE_MIN}% – {RATE_MAX}%
								</span>
							</div>
							<input
								id="emi-rate-slider"
								type="range"
								min={RATE_MIN}
								max={RATE_MAX}
								step={RATE_SLIDER_STEP}
								value={clamp(rateNum, RATE_MIN, RATE_MAX)}
								onChange={(e) => setRateFromSlider(Number(e.target.value))}
								className={rangeClass}
								aria-valuemin={RATE_MIN}
								aria-valuemax={RATE_MAX}
								aria-valuenow={rateNum}
								aria-valuetext={`${rateNum.toFixed(2)}% per year`}
							/>
							<input
								id="emi-rate"
								type="text"
								inputMode="decimal"
								autoComplete="off"
								value={rateStr}
								onChange={(e) => onRateText(e.target.value)}
								onBlur={() => {
									const n = Number.parseFloat(rateStr);
									if (Number.isFinite(n)) {
										const c = clamp(Math.round(n * 100) / 100, RATE_MIN, RATE_MAX);
										setRateNum(c);
										setRateStr(c.toFixed(2));
									} else {
										setRateStr(rateNum.toFixed(2));
									}
								}}
								className="mt-2 w-full rounded-xl border border-brand/20 bg-page px-4 py-3 text-fg placeholder:text-fg-muted/70 focus:border-cta focus:outline-none focus:ring-2 focus:ring-cta/25"
								placeholder="e.g. 18.50"
							/>
						</div>

						<div>
							<div className="mb-2 flex flex-wrap items-center justify-between gap-3">
								<span id="emi-term-label" className="text-sm font-medium text-fg">
									Loan term
								</span>
								<div
									className="inline-flex rounded-full border border-brand/20 bg-page p-0.5 text-xs font-medium"
									role="radiogroup"
									aria-labelledby="emi-term-label"
								>
									<button
										type="button"
										role="radio"
										aria-checked={termUnit === 'years'}
										onClick={() => switchTermUnit('years')}
										className={`rounded-full px-3 py-1.5 transition ${
											termUnit === 'years' ? 'bg-cta text-white shadow-sm' : 'text-fg-muted hover:text-fg'
										}`}
									>
										Years
									</button>
									<button
										type="button"
										role="radio"
										aria-checked={termUnit === 'months'}
										onClick={() => switchTermUnit('months')}
										className={`rounded-full px-3 py-1.5 transition ${
											termUnit === 'months' ? 'bg-cta text-white shadow-sm' : 'text-fg-muted hover:text-fg'
										}`}
									>
										Months
									</button>
								</div>
							</div>
							<p className="mb-1 text-xs text-fg-muted">
								{MONTHS_MIN}–{MONTHS_MAX} months (up to {MONTHS_MAX / 12} years). Currently {nMonths}{' '}
								month{nMonths !== 1 ? 's' : ''}.
							</p>
							<input
								id="emi-term-slider"
								type="range"
								min={MONTHS_MIN}
								max={MONTHS_MAX}
								step={TERM_SLIDER_STEP}
								value={clamp(termMonthsPrecise, MONTHS_MIN, MONTHS_MAX)}
								onChange={(e) => {
									const v = Number(e.target.value);
									setTermMonthsPrecise(Number.isFinite(v) ? v : nMonths);
									setTermStr(termStrFromMonths(clamp(Math.round(v), MONTHS_MIN, MONTHS_MAX), termUnit));
								}}
								className={rangeClass}
								aria-valuemin={MONTHS_MIN}
								aria-valuemax={MONTHS_MAX}
								aria-valuenow={nMonths}
								aria-valuetext={
									termUnit === 'years'
										? `${(nMonths / 12).toFixed(2)} years`
										: `${nMonths} months`
								}
							/>
							<label htmlFor="emi-term" className="sr-only">
								Loan term ({termUnit === 'years' ? 'years' : 'months'})
							</label>
							<input
								id="emi-term"
								type="text"
								inputMode="decimal"
								autoComplete="off"
								value={termStr}
								onChange={(e) => onTermText(e.target.value)}
								onBlur={() => {
									const m = monthsFromTermInput(termStr, termUnit);
									if (m !== null) {
										setTermMonthsPrecise(m);
										setTermStr(termStrFromMonths(m, termUnit));
									} else {
										setTermStr(termStrFromMonths(nMonths, termUnit));
									}
								}}
								className="mt-2 w-full rounded-xl border border-brand/20 bg-page px-4 py-3 text-fg placeholder:text-fg-muted/70 focus:border-cta focus:outline-none focus:ring-2 focus:ring-cta/25"
								placeholder={termUnit === 'years' ? 'e.g. 5 or 5.5' : 'e.g. 60'}
							/>
						</div>
					</form>

							<div
								className={`rounded-xl border border-brand/15 bg-page px-4 py-4 sm:px-5 lg:py-5${
									summary ? ' lg:flex lg:flex-1 lg:flex-col lg:min-h-0' : ''
								}`}
								aria-live="polite"
							>
								{summary ? (
									<div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-center sm:gap-8">
										<div className="shrink-0 self-center sm:self-start">
											<RepaymentPieChart principal={parsed.P} interest={summary.interest} compact />
										</div>
										<dl className="min-w-0 flex-1 space-y-3 text-sm">
											<div>
												<dt className="text-xs font-medium text-fg-muted sm:text-sm">Monthly repayment (EMI)</dt>
												<dd className="mt-1 font-display text-xl font-bold tabular-nums leading-tight text-brand lg:text-lg xl:text-xl">
													{aud.format(summary.emi)}
												</dd>
											</div>
											<div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-brand/10 pt-3">
												<dt className="text-fg-muted">Total amount payable</dt>
												<dd className="font-semibold tabular-nums text-fg">{aud.format(summary.totalRepayments)}</dd>
											</div>
											<div className="flex flex-wrap items-baseline justify-between gap-2">
												<dt className="text-fg-muted">Total interest</dt>
												<dd className="tabular-nums text-fg">{aud.format(summary.interest)}</dd>
											</div>
										</dl>
									</div>
								) : (
									<p className="text-sm text-fg-muted">Enter valid loan amount, rate, and term to see your estimate.</p>
								)}
							</div>
						</div>

						<div className="flex min-w-0 flex-col lg:col-span-8 lg:flex lg:h-full lg:min-h-0 lg:flex-col">
							{summary ? (
								<div className="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
									<EmiLenderComparison
										embedded
										principal={parsed.P}
										userAnnualRate={parsed.rate}
										nMonths={parsed.n}
									/>
								</div>
							) : (
								<div className="flex min-h-[14rem] flex-col items-center justify-center rounded-xl border border-dashed border-brand/25 bg-page/60 px-4 py-10 text-center text-sm leading-relaxed text-fg-muted lg:min-h-[min(24rem,calc(100vh-12rem))]">
									Enter your loan amount, rate, and term to see illustrative lender comparisons beside your
									estimate.
								</div>
							)}
						</div>
					</div>
				</div>

				<p className="mx-auto mt-5 max-w-3xl text-center text-xs leading-relaxed text-fg-muted lg:mt-4">
					QuickBiz is an introducer service, not a lender. Actual repayments depend on lender assessment, fees, and
					contract terms.
				</p>
			</div>
		</section>
	);
}
