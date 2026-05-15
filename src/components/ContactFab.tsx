import { useState } from 'react';

export default function ContactFab() {
	const [busy, setBusy] = useState(false);
	const [hint, setHint] = useState<string | null>(null);

	async function handleClick() {
		if (busy) return;
		setBusy(true);
		setHint(null);

		try {
			const res = await fetch('/api/reports/questionnaire-export', {
				method: 'POST',
				cache: 'no-store',
			});
			const data = (await res.json()) as { ok?: boolean; rowCount?: number; error?: string };
			if (!res.ok) {
				setHint(data.error ?? 'Could not send export.');
			} else {
				setHint(
					data.rowCount === 0
						? 'Export sent (no submissions yet). Opening contact…'
						: `Export sent (${data.rowCount} rows). Opening contact…`,
				);
			}
		} catch {
			setHint('Network error sending export.');
		} finally {
			setBusy(false);
			window.setTimeout(() => {
				window.location.href = '/contact';
			}, 600);
		}
	}

	return (
		<>
			<button
				type="button"
				onClick={() => void handleClick()}
				disabled={busy}
				className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-secondary text-white shadow-lg shadow-brand/25 transition hover:bg-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary focus-visible:ring-offset-2 disabled:opacity-70"
				aria-label="Contact us"
				title="Contact us"
			>
				<svg
					className="h-7 w-7"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth="1.8"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M21.75 6.75v10.5A2.25 2.25 0 0119.5 19.5h-15A2.25 2.25 0 012.25 17.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75m19.5 0l-8.69 5.518a2.25 2.25 0 01-2.12 0L2.25 6.75"
					/>
				</svg>
			</button>
			{hint && (
				<p
					role="status"
					className="fixed bottom-24 right-5 z-50 max-w-[14rem] rounded-lg bg-brand px-3 py-2 text-xs text-white shadow-lg"
				>
					{hint}
				</p>
			)}
		</>
	);
}
