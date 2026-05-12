/**
 * Lenders shown in the home-page marquee (resources/logos/marquee).
 * Used by TrustedLenders.astro and EmiLenderComparison (illustrative rates only).
 */
export interface TrustedMarqueeLender {
	id: string;
	name: string;
	logoSrc: string;
	/** Illustrative: added to user’s annual rate before clamping. */
	rateDelta: number;
	/** Illustrative: added to initial rate for comparison column. */
	comparisonRateAddon: number;
	/** Illustrative setup fee (AUD). */
	setupFee: number;
}

const pngGlob = import.meta.glob('../../resources/logos/marquee/*.png', {
	eager: true,
	query: '?url',
	import: 'default',
}) as Record<string, string>;

const jpgGlob = import.meta.glob('../../resources/logos/marquee/*.{jpg,jpeg}', {
	eager: true,
	query: '?url',
	import: 'default',
}) as Record<string, string>;

const svgGlob = import.meta.glob('../../resources/logos/marquee/*.svg', {
	eager: true,
	query: '?url',
	import: 'default',
}) as Record<string, string>;

const webpGlob = import.meta.glob('../../resources/logos/marquee/*.webp', {
	eager: true,
	query: '?url',
	import: 'default',
}) as Record<string, string>;

const icoGlob = import.meta.glob('../../resources/logos/marquee/*.ico', {
	eager: true,
	query: '?url',
	import: 'default',
}) as Record<string, string>;

/** Cycled so each marquee logo gets stable, varied illustrative fields without duplicating rows. */
const ILLUSTRATIVE_PRESETS: Array<Pick<TrustedMarqueeLender, 'rateDelta' | 'comparisonRateAddon' | 'setupFee'>> = [
	{ rateDelta: -0.65, comparisonRateAddon: 1.85, setupFee: 0 },
	{ rateDelta: -0.42, comparisonRateAddon: 1.62, setupFee: 495 },
	{ rateDelta: -0.28, comparisonRateAddon: 1.45, setupFee: 0 },
	{ rateDelta: -0.15, comparisonRateAddon: 1.78, setupFee: 890 },
	{ rateDelta: 0.05, comparisonRateAddon: 1.52, setupFee: 0 },
	{ rateDelta: 0.12, comparisonRateAddon: 1.68, setupFee: 1200 },
	{ rateDelta: -0.55, comparisonRateAddon: 1.92, setupFee: 350 },
	{ rateDelta: -0.33, comparisonRateAddon: 1.55, setupFee: 0 },
	{ rateDelta: -0.08, comparisonRateAddon: 1.41, setupFee: 650 },
	{ rateDelta: 0.22, comparisonRateAddon: 1.74, setupFee: 0 },
	{ rateDelta: -0.72, comparisonRateAddon: 2.05, setupFee: 1475 },
	{ rateDelta: 0.18, comparisonRateAddon: 1.59, setupFee: 0 },
];

function buildTrustedMarqueeLenders(): TrustedMarqueeLender[] {
	const logoFiles = Object.entries({
		...pngGlob,
		...jpgGlob,
		...svgGlob,
		...webpGlob,
		...icoGlob,
	});

	const sorted = logoFiles.sort(([a], [b]) =>
		a
			.replace(/^.*[\\/]/, '')
			.localeCompare(b.replace(/^.*[\\/]/, ''), undefined, { numeric: true, sensitivity: 'base' }),
	);

	return sorted.map(([path, src], index) => {
		const baseName = path.replace(/^.*[\\/]/, '').replace(/\.(png|jpe?g|ico|svg|webp)$/i, '');
		const readableName = baseName
			.replace(/[_-]+/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
		const preset = ILLUSTRATIVE_PRESETS[index % ILLUSTRATIVE_PRESETS.length]!;
		return {
			id: String(index + 1),
			name: readableName || 'Lender',
			logoSrc: src,
			...preset,
		};
	});
}

export const TRUSTED_MARQUEE_LENDERS: TrustedMarqueeLender[] = buildTrustedMarqueeLenders();
