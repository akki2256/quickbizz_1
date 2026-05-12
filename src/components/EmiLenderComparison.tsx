import { useEffect, useMemo, useState } from 'react';
import { computeEmi } from '../lib/emiMath';
import { TRUSTED_MARQUEE_LENDERS } from '../lib/trustedMarqueeLenders';

const RATE_MIN = 10;
const RATE_MAX = 40;

const aud = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 });
const audCents = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct2 = new Intl.NumberFormat('en-AU', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 });

function clamp(n: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, n));
}

function round2(n: number): number {
	return Math.round(n * 100) / 100;
}

/** Rows per page: tuned for desktop EMI layout so the table fills vertical space beside the summary. */
const PAGE_SIZE = 8;

type SortKey = 'emi' | 'initialRate' | 'comparisonRate' | 'setupFee';

const SORT_OPTIONS: { value: string; label: string }[] = [
	{ value: 'emi|asc', label: 'Monthly repayment (low to high)' },
	{ value: 'emi|desc', label: 'Monthly repayment (high to low)' },
	{ value: 'initialRate|asc', label: 'Initial rate (low to high)' },
	{ value: 'initialRate|desc', label: 'Initial rate (high to low)' },
	{ value: 'comparisonRate|asc', label: 'Comparison rate (low to high)' },
	{ value: 'comparisonRate|desc', label: 'Comparison rate (high to low)' },
	{ value: 'setupFee|asc', label: 'Setup fee (low to high)' },
	{ value: 'setupFee|desc', label: 'Setup fee (high to low)' },
];

function parseSortOption(v: string): { key: SortKey; dir: 'asc' | 'desc' } {
	const [key, dir] = v.split('|');
	return { key: key as SortKey, dir: dir as 'asc' | 'desc' };
}

export interface EmiLenderComparisonProps {
	principal: number;
	userAnnualRate: number;
	nMonths: number;
	/** When true, lighter styling for use inside the main EMI card. */
	embedded?: boolean;
}

export default function EmiLenderComparison({ principal, userAnnualRate, nMonths, embedded = false }: EmiLenderComparisonProps) {
	const [page, setPage] = useState(0);
	const [sortOption, setSortOption] = useState('emi|asc');

	useEffect(() => {
		setPage(0);
	}, [principal, userAnnualRate, nMonths, sortOption]);

	const rows = useMemo(() => {
		const out = TRUSTED_MARQUEE_LENDERS.map((l) => {
			const initialRate = round2(clamp(userAnnualRate + l.rateDelta, RATE_MIN, RATE_MAX));
			const comparisonRate = round2(clamp(initialRate + l.comparisonRateAddon, RATE_MIN, RATE_MAX + 8));
			const emi = computeEmi(principal, initialRate, nMonths);
			if (emi === null || !Number.isFinite(emi)) return null;
			return {
				...l,
				initialRate,
				comparisonRate,
				emi,
			};
		}).filter(Boolean) as Array<
			(typeof TRUSTED_MARQUEE_LENDERS)[number] & { initialRate: number; comparisonRate: number; emi: number }
		>;

		return out;
	}, [principal, userAnnualRate, nMonths]);

	const sortedRows = useMemo(() => {
		const { key, dir } = parseSortOption(sortOption);
		const mult = dir === 'asc' ? 1 : -1;
		return [...rows].sort((a, b) => {
			const av = a[key];
			const bv = b[key];
			if (av === bv) return 0;
			return av < bv ? -mult : mult;
		});
	}, [rows, sortOption]);

	const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
	const safePage = Math.min(page, totalPages - 1);
	const pageRows = sortedRows.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
	const from = sortedRows.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
	const to = sortedRows.length === 0 ? 0 : Math.min(sortedRows.length, (safePage + 1) * PAGE_SIZE);

	if (sortedRows.length === 0) return null;

	return (
		<div
			className={
				embedded
					? 'flex h-full min-h-0 flex-col rounded-xl border border-brand/15 bg-page p-3 sm:p-4 lg:sticky lg:top-24'
					: 'mt-8 rounded-2xl border border-brand/20 bg-surface p-4 shadow-lg shadow-brand/10 sm:p-6'
			}
		>
			<div className="w-full sm:ml-auto sm:w-auto sm:min-w-[12rem]">
				<select
					id="emi-lender-sort"
					value={sortOption}
					onChange={(e) => setSortOption(e.target.value)}
					aria-label="Sort lender comparison"
					className="w-full max-w-full rounded-xl border border-brand/20 bg-page px-3 py-2.5 text-sm text-fg shadow-sm focus:border-cta focus:outline-none focus:ring-2 focus:ring-cta/25 sm:w-[min(100%,20rem)]"
				>
					{SORT_OPTIONS.map((o) => (
						<option key={o.value} value={o.value}>
							{o.label}
						</option>
					))}
				</select>
			</div>

			<div className="mt-4 hidden min-w-0 flex-1 overflow-x-auto lg:mt-5 lg:block">
				<table className="w-full min-w-[36rem] border-collapse text-left text-sm">
					<caption className="sr-only">
						Illustrative lender comparison: logo, initial rate, comparison rate, setup fee, monthly repayment, and
						enquire action per row.
					</caption>
					<tbody>
						{pageRows.map((row) => (
							<tr key={row.id} className="border-b border-brand/10 last:border-0 [&>td]:py-3.5">
								<td className="pr-4 align-middle">
									<div className="flex items-center justify-start">
										<div className="flex h-11 min-w-[3rem] max-w-[7.5rem] items-center justify-center rounded-xl bg-brand/[0.08] px-2 ring-1 ring-brand/10">
											<img
												src={row.logoSrc}
												alt={row.name}
												className="max-h-9 w-auto max-w-full object-contain"
												draggable={false}
											/>
										</div>
									</div>
								</td>
								<td className="pr-3 align-top">
									<span className="font-semibold tabular-nums text-brand-secondary">{pct2.format(row.initialRate)}%</span>
									<p className="mt-0.5 text-xs text-fg-muted">Initial rate</p>
								</td>
								<td className="pr-3 align-top">
									<span className="font-semibold tabular-nums text-amber-700">{pct2.format(row.comparisonRate)}%</span>
									<p className="mt-0.5 text-xs text-fg-muted">Comparison rate</p>
								</td>
								<td className="pr-3 align-top">
									<span className="font-semibold tabular-nums text-success">
										{row.setupFee === 0 ? '$0' : aud.format(row.setupFee)}
									</span>
									<p className="mt-0.5 text-xs text-fg-muted">Setup fee</p>
								</td>
								<td className="pr-3 align-top">
									<span className="font-semibold tabular-nums text-brand">{audCents.format(row.emi)}</span>
									<p className="mt-0.5 text-xs text-fg-muted">Monthly repayment</p>
								</td>
								<td className="text-right align-middle">
									<a
										href="/contact"
										className="inline-flex rounded-lg bg-cta px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-brand/20 transition hover:brightness-110"
									>
										Enquire
									</a>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<ul className="mt-4 flex flex-col gap-3 lg:hidden">
				{pageRows.map((row) => (
					<li key={row.id} className="rounded-xl border border-brand/12 bg-page/80 p-4 shadow-sm">
						<div className="flex items-start justify-between gap-3">
							<div className="flex h-11 min-w-[3rem] max-w-[8rem] items-center justify-center rounded-lg bg-brand/[0.08] px-2 ring-1 ring-brand/10">
								<img
									src={row.logoSrc}
									alt={row.name}
									className="max-h-9 w-auto max-w-full object-contain"
									draggable={false}
								/>
							</div>
							<a
								href="/contact"
								className="shrink-0 rounded-lg bg-cta px-3 py-1.5 text-xs font-semibold text-white"
							>
								Enquire
							</a>
						</div>
						<dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
							<div>
								<dt className="text-fg-muted">Initial rate</dt>
								<dd className="mt-0.5 font-semibold tabular-nums text-brand-secondary">{pct2.format(row.initialRate)}%</dd>
							</div>
							<div>
								<dt className="text-fg-muted">Comparison rate</dt>
								<dd className="mt-0.5 font-semibold tabular-nums text-amber-700">{pct2.format(row.comparisonRate)}%</dd>
							</div>
							<div>
								<dt className="text-fg-muted">Setup fee</dt>
								<dd className="mt-0.5 font-semibold tabular-nums text-success">
									{row.setupFee === 0 ? '$0' : aud.format(row.setupFee)}
								</dd>
							</div>
							<div>
								<dt className="text-fg-muted">Monthly repayment</dt>
								<dd className="mt-0.5 font-semibold tabular-nums text-brand">{audCents.format(row.emi)}</dd>
							</div>
						</dl>
					</li>
				))}
			</ul>

			<div className="mt-5 flex flex-col items-stretch gap-3 border-t border-brand/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
				<p className="text-center text-xs text-fg-muted sm:text-left">
					{from}–{to} of {sortedRows.length} scenarios
				</p>
				<div className="flex items-center justify-center gap-2">
					<button
						type="button"
						className="rounded-lg border border-brand/20 bg-page px-3 py-1.5 text-sm font-medium text-brand transition hover:border-brand/40 disabled:cursor-not-allowed disabled:opacity-40"
						disabled={safePage <= 0}
						onClick={() => setPage((p) => Math.max(0, p - 1))}
						aria-label="Previous page"
					>
						←
					</button>
					<span className="min-w-[4.5rem] text-center text-xs tabular-nums text-fg-muted">
						{safePage + 1} / {totalPages}
					</span>
					<button
						type="button"
						className="rounded-lg border border-brand/20 bg-page px-3 py-1.5 text-sm font-medium text-brand transition hover:border-brand/40 disabled:cursor-not-allowed disabled:opacity-40"
						disabled={safePage >= totalPages - 1}
						onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
						aria-label="Next page"
					>
						→
					</button>
				</div>
			</div>
		</div>
	);
}
