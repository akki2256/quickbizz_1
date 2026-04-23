import { useMemo, useState } from 'react';
import { products } from '../lib/products';

const defaultSlug = products[0]?.slug ?? '';

export default function ProductsSectionInteractive() {
	const [selectedSlug, setSelectedSlug] = useState(defaultSlug);

	const selected = useMemo(
		() => products.find((p) => p.slug === selectedSlug) ?? products[0],
		[selectedSlug],
	);

	if (!selected) return null;

	return (
		<div className="mt-10 grid gap-6 lg:grid-cols-12 lg:gap-8 lg:items-stretch">
			<nav className="w-full lg:col-span-3 lg:max-w-xs" aria-label="Product categories">
				<ul className="flex flex-col gap-2">
					{products.map((p) => {
						const isActive = p.slug === selectedSlug;
						return (
							<li key={p.slug}>
								<button
									type="button"
									onClick={() => setSelectedSlug(p.slug)}
									aria-pressed={isActive}
									className={
										'w-full rounded-xl border px-4 py-3.5 text-left font-display text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary focus-visible:ring-offset-2 ' +
										(isActive
											? 'border-brand-secondary bg-brand/[0.06] text-brand shadow-sm shadow-brand/10'
											: 'border-brand/12 bg-surface/90 text-fg-muted hover:border-brand-secondary/40 hover:bg-surface hover:text-brand')
									}
								>
									{p.title}
								</button>
							</li>
						);
					})}
				</ul>
			</nav>

			<div className="flex h-full min-h-0 min-w-0 lg:col-span-9">
				<div
					className="flex h-full min-h-0 w-full flex-col rounded-2xl border border-brand/12 bg-surface/90 p-6 shadow-sm shadow-brand/5 sm:p-8"
					role="region"
					aria-live="polite"
					aria-labelledby="product-panel-heading"
				>
					<h3 id="product-panel-heading" className="font-display text-xl font-bold text-brand sm:text-2xl">
						{selected.title}
					</h3>
					<div className="mt-4 min-h-0 flex-1">
						<p className="text-sm leading-relaxed text-fg-muted sm:text-base">{selected.summary}</p>
					</div>
					<p className="mt-auto pt-8">
						<a
							href={`/products/${selected.slug}`}
							className="font-semibold text-brand-secondary underline decoration-brand-secondary/40 underline-offset-4 transition hover:text-brand hover:decoration-brand"
						>
							Know More
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}
