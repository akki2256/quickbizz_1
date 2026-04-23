import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import {
	ELIGIBILITY_STEPS,
	formatChoiceLabel,
	parseTitleAndHelper,
	type EligibilityStep,
} from '../data/eligibility-flow';
import { isValidAbnChecksum, type AbnLookupResult } from '../lib/abn';

const ABN_NO_DETAIL =
	'Most lenders require an active ABN for the business funding products we can assist with.';

const PERSONAL_USE_DETAIL =
	'We specialise in business funding; personal-use requests may have limited matches.';

type AbnUiState = 'idle' | 'checking' | 'valid' | 'invalid' | 'inactive' | 'service_unavailable';

function validateStep(step: EligibilityStep, raw: string): string | null {
	const v = raw.trim();
	if (step.kind === 'choice') {
		if (!v) return 'Please select an option.';
		return null;
	}
	if (step.kind === 'number') {
		const n = Number(v.replace(/,/g, ''));
		if (Number.isNaN(n)) return 'Enter a valid number.';
		if (step.min !== undefined && n < step.min) {
			if (step.key === 'borrowAmountAud') return 'Minimum loan amount is $10,000 AUD.';
			if (step.key === 'monthsTrading') return 'You must have been trading for at least 6 months.';
			return `Value must be at least ${step.min}.`;
		}
		if (step.key === 'monthsTrading' && !Number.isInteger(n)) {
			return 'Enter whole months only.';
		}
		return null;
	}
	if (step.kind === 'email') {
		if (!v) return 'Email is required.';
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email.';
		return null;
	}
	if (step.kind === 'tel') {
		if (v.replace(/\D/g, '').length < 8) return 'Enter a valid Australian mobile.';
		return null;
	}
	if (step.kind === 'otp') {
		if (!/^\d{6}$/.test(v)) return 'Enter the 6-digit code.';
		return null;
	}
	if (step.key === 'abn') {
		if (!v) return 'ABN is required.';
		if (!/^\d{11}$/.test(v)) return 'Enter a valid 11-digit ABN.';
		return null;
	}
	if (!v) return 'This field is required.';
	return null;
}

export default function EligibilityWizard() {
	const [stepIndex, setStepIndex] = useState(0);
	const [answers, setAnswers] = useState<Record<string, string>>({});
	const [input, setInput] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [done, setDone] = useState(false);
	const [terminated, setTerminated] = useState(false);
	const [terminationDetail, setTerminationDetail] = useState<string | null>(null);
	const [devHint, setDevHint] = useState<string | null>(null);
	const [abnStatus, setAbnStatus] = useState<AbnUiState>('idle');
	const [abnMessage, setAbnMessage] = useState<string | null>(null);
	const [abnEntityName, setAbnEntityName] = useState<string | null>(null);
	const abnLookupAbortRef = useRef<AbortController | null>(null);
	const abnLookupTimerRef = useRef<number | null>(null);
	const busyRef = useRef(false);

	const step = ELIGIBILITY_STEPS[stepIndex];
	const total = ELIGIBILITY_STEPS.length;
	const progress = ((stepIndex + 1) / total) * 100;

	const { title, helper } = useMemo(() => parseTitleAndHelper(step.title), [step.title]);

	useEffect(() => {
		setInput(answers[step.key] ?? '');
		setError(null);
	}, [stepIndex, step.key, answers]);

	useEffect(() => {
		return () => {
			abnLookupAbortRef.current?.abort();
			if (abnLookupTimerRef.current !== null) window.clearTimeout(abnLookupTimerRef.current);
		};
	}, []);

	useEffect(() => {
		if (step.key !== 'abn') return;
		const abn = input.trim();

		abnLookupAbortRef.current?.abort();
		if (abnLookupTimerRef.current !== null) {
			window.clearTimeout(abnLookupTimerRef.current);
			abnLookupTimerRef.current = null;
		}

		setAbnEntityName(null);
		setAbnMessage(null);

		if (!abn) {
			setAbnStatus('idle');
			return;
		}
		if (abn.length < 11) {
			setAbnStatus('idle');
			return;
		}
		if (!isValidAbnChecksum(abn)) {
			setAbnStatus('invalid');
			setAbnMessage('Enter a valid 11-digit ABN.');
			return;
		}

		setAbnStatus('checking');
		abnLookupTimerRef.current = window.setTimeout(() => {
			const controller = new AbortController();
			abnLookupAbortRef.current = controller;
			void (async () => {
				try {
					const res = await fetch('/api/abn/lookup', {
						method: 'POST',
						headers: { 'content-type': 'application/json' },
						body: JSON.stringify({ abn }),
						signal: controller.signal,
					});
					const data = (await res.json()) as AbnLookupResult | { error?: string };
					if (!res.ok) {
						setAbnStatus('service_unavailable');
						setAbnMessage(
							'ABN service is temporarily unavailable. You can continue now and we will validate the ABN shortly.',
						);
						return;
					}
					if ('status' in data) {
						setAbnStatus(data.status);
						if (data.status === 'valid') {
							setAbnEntityName(data.entityName);
							setAbnMessage(null);
							return;
						}
						setAbnEntityName(null);
						setAbnMessage(data.message);
					}
				} catch {
					if (controller.signal.aborted) return;
					setAbnStatus('service_unavailable');
					setAbnMessage(
						'ABN service is temporarily unavailable. You can continue now and we will validate the ABN shortly.',
					);
				}
			})();
		}, 250);
	}, [input, step.key]);

	function clearDownstream(fromIndex: number) {
		setAnswers((prev) => {
			const next = { ...prev };
			for (let j = fromIndex + 1; j < ELIGIBILITY_STEPS.length; j++) {
				delete next[ELIGIBILITY_STEPS[j].key];
			}
			return next;
		});
	}

	function handleBack() {
		if (stepIndex <= 0 || loading) return;
		clearDownstream(stepIndex - 1);
		setStepIndex((i) => i - 1);
		setDevHint(null);
	}

	function terminateWithMessage(detail: string) {
		setTerminationDetail(detail);
		setTerminated(true);
		setError(null);
	}

	/** Advance with explicit value (avoids stale state for immediate choice selection). */
	async function tryAdvance(valueOverride?: string) {
		if (done || terminated || busyRef.current) return;

		const value = (valueOverride !== undefined ? valueOverride : input).trim();
		const err = validateStep(step, value);
		if (err) {
			setError(err);
			return;
		}
		if (step.key === 'abn') {
			if (abnStatus === 'checking') {
				setError('Please wait while we verify your ABN.');
				return;
			}
			if (abnStatus === 'invalid' || abnStatus === 'inactive') {
				setError(abnMessage ?? 'Please enter an active ABN.');
				return;
			}
		}

		/* Business rule: no ABN — stop here */
		if (step.key === 'hasAbn' && value === 'No') {
			setAnswers((prev) => ({ ...prev, hasAbn: value }));
			setInput(value);
			terminateWithMessage(ABN_NO_DETAIL);
			return;
		}

		/* Business rule: personal use — stop here */
		if (step.key === 'loanUse' && value === 'Personal Use') {
			setAnswers((prev) => ({ ...prev, loanUse: value }));
			setInput(value);
			terminateWithMessage(PERSONAL_USE_DETAIL);
			return;
		}

		busyRef.current = true;

		const nextAnswers = { ...answers, [step.key]: value };
		setAnswers(nextAnswers);

		if (step.key === 'mobile') {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch('/api/otp/send', {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({ mobile: value }),
				});
				const data = (await res.json()) as { ok?: boolean; error?: string; devCode?: string };
				if (!res.ok) {
					setError(data.error ?? 'Could not send code.');
					return;
				}
				if (data.devCode) setDevHint(`Dev: use code ${data.devCode}`);
				setStepIndex((i) => i + 1);
			} catch {
				setError('Network error.');
			} finally {
				setLoading(false);
				busyRef.current = false;
			}
			return;
		}

		if (step.kind === 'otp') {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch('/api/eligibility/complete', {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({
						answers: Object.fromEntries(
							Object.entries(nextAnswers).filter(([k]) => k !== 'otp'),
						),
						otp: value,
					}),
				});
				const data = (await res.json()) as { ok?: boolean; error?: string };
				if (!res.ok) {
					setError(data.error ?? 'Could not verify.');
					return;
				}
				setDone(true);
			} catch {
				setError('Network error.');
			} finally {
				setLoading(false);
				busyRef.current = false;
			}
			return;
		}

		setStepIndex((i) => i + 1);
		busyRef.current = false;
	}

	function handleChoiceSelect(opt: string) {
		setInput(opt);
		setError(null);
		void tryAdvance(opt);
	}

	function handleTextKeyDown(e: KeyboardEvent<HTMLInputElement>) {
		if (e.key !== 'Enter') return;
		e.preventDefault();
		const v = (e.currentTarget as HTMLInputElement).value;
		void tryAdvance(v);
	}

	function handleOtpChange(raw: string) {
		const v = raw.replace(/\D/g, '').slice(0, 6);
		setInput(v);
		setError(null);
		if (v.length === 6) void tryAdvance(v);
	}

	if (done) {
		return (
			<div className="rounded-2xl border border-brand/20 bg-surface p-8 text-center shadow-lg">
				<p className="font-display text-xl font-semibold text-brand">You&apos;re all set</p>
				<p className="mt-3 text-fg-muted">
					Thanks — your details are saved. We&apos;ll be in touch shortly.
				</p>
				<a
					href="/contact#lead"
					className="mt-6 inline-block text-sm font-medium text-cta underline"
				>
					Need to add a note? Contact us below
				</a>
			</div>
		);
	}

	if (terminated) {
		return (
			<div className="rounded-2xl border border-red-200 bg-surface p-8 text-center shadow-lg">
				{terminationDetail && (
					<p className="text-sm leading-relaxed text-red-700">{terminationDetail}</p>
				)}
				<p className="mt-4 font-display text-lg font-semibold text-brand">Sorry, we can&apos;t help you</p>
				<p className="mt-3 text-sm text-fg-muted">
					If you think this was a mistake, you can start again or reach us via the contact section.
				</p>
				<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
					<button
						type="button"
						onClick={() => {
							setTerminated(false);
							setTerminationDetail(null);
							setError(null);
							setStepIndex(0);
							setAnswers({});
							setInput('');
							setDevHint(null);
						}}
						className="rounded-xl border border-brand/25 bg-page px-6 py-3 text-sm font-semibold text-brand transition hover:bg-surface-subtle"
					>
						Start again
					</button>
					<a
						href="/contact#lead"
						className="inline-flex items-center justify-center rounded-xl bg-cta px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"
					>
						Contact us
					</a>
				</div>
			</div>
		);
	}

	const choiceOptions = step.kind === 'choice' ? (step.options ?? []) : [];
	const showEnterHint =
		step.kind === 'text' ||
		step.kind === 'number' ||
		step.kind === 'email' ||
		step.kind === 'tel';
	const isAbnStep = step.key === 'abn';
	const blockContinueForAbn = isAbnStep && (abnStatus === 'checking' || abnStatus === 'invalid' || abnStatus === 'inactive');

	return (
		<div className="rounded-2xl border border-brand/20 bg-surface p-6 text-center shadow-xl shadow-brand/10 sm:p-8">
			<div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-page">
				<div
					className="h-full rounded-full bg-cta transition-[width] duration-300"
					style={{ width: `${progress}%` }}
				/>
			</div>

			{stepIndex > 0 && (
				<div className="mb-2 flex justify-end">
					<button
						type="button"
						onClick={handleBack}
						disabled={loading}
						className="text-xs font-medium text-cta underline decoration-cta/40 underline-offset-2 hover:decoration-cta disabled:opacity-50"
					>
						Back
					</button>
				</div>
			)}

			<h3
				id="eligibility-q-title"
				className="font-display text-lg font-semibold text-brand sm:text-xl"
			>
				{title}
			</h3>

			{helper && (
				<p className="mt-2 text-sm leading-relaxed text-fg-muted">
					{helper}{' '}
					{step.key === 'abn' && (
						<a
							href="https://abr.business.gov.au/"
							target="_blank"
							rel="noopener noreferrer"
							className="font-medium text-cta underline"
						>
							abr.business.gov.au
						</a>
					)}
				</p>
			)}

			<div className="mt-6 space-y-3">
				{showEnterHint && (
					<p id="eligibility-enter-hint" className="sr-only">
						{step.kind === 'tel'
							? 'Press Enter or Continue to send the verification code and go to the next step.'
							: 'Press Enter or Continue to go to the next question.'}
					</p>
				)}
				{step.kind === 'choice' && (
					<div className="flex w-full flex-col gap-3" role="radiogroup" aria-labelledby="eligibility-q-title">
						{choiceOptions.map((opt) => (
							<button
								key={opt}
								type="button"
								role="radio"
								aria-checked={input === opt}
								disabled={loading}
								onClick={() => handleChoiceSelect(opt)}
								className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border px-4 py-3.5 text-center text-sm font-medium leading-snug transition duration-200 ${
									loading ? 'cursor-not-allowed opacity-60' : ''
								} ${
									input === opt
										? 'border-cta bg-page ring-2 ring-cta/25 enabled:hover:shadow-lg enabled:hover:shadow-brand/25'
										: 'border-brand/20 bg-page hover:border-brand/35 enabled:hover:shadow-lg enabled:hover:shadow-brand/20'
								}`}
							>
								<span className="block w-full text-balance">{formatChoiceLabel(opt)}</span>
							</button>
						))}
					</div>
				)}

				{(step.kind === 'text' || step.kind === 'number') && (
					<input
						type="text"
						inputMode={step.kind === 'number' || step.key === 'abn' ? 'numeric' : 'text'}
						value={input}
						onChange={(e) => {
							const nextValue =
								step.key === 'abn' ? e.target.value.replace(/\D/g, '').slice(0, 11) : e.target.value;
							setInput(nextValue);
							setError(null);
						}}
						onKeyDown={handleTextKeyDown}
						placeholder={step.placeholder}
						disabled={loading}
						className="w-full rounded-xl border border-brand/20 bg-page px-4 py-3 text-center text-fg placeholder:text-fg-muted/60 focus:border-cta focus:outline-none focus:ring-2 focus:ring-cta/25 disabled:opacity-60"
						autoComplete="off"
						maxLength={step.key === 'abn' ? 11 : undefined}
						aria-describedby={showEnterHint ? 'eligibility-enter-hint' : undefined}
					/>
				)}
				{isAbnStep && abnStatus === 'checking' && (
					<div className="flex items-center justify-center gap-2 text-xs text-fg-muted">
						<span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand/25 border-t-cta" />
						Verifying ABN...
					</div>
				)}
				{isAbnStep && abnStatus === 'valid' && abnEntityName && (
					<p className="text-xs text-green-700">Entity name: {abnEntityName}</p>
				)}
				{isAbnStep && abnStatus === 'inactive' && abnMessage && (
					<p className="text-xs text-red-600">{abnMessage}</p>
				)}
				{isAbnStep && abnStatus === 'invalid' && abnMessage && (
					<p className="text-xs text-red-600">{abnMessage}</p>
				)}
				{isAbnStep && abnStatus === 'service_unavailable' && abnMessage && (
					<p className="text-xs text-amber-700">{abnMessage}</p>
				)}

				{step.kind === 'email' && (
					<input
						type="email"
						value={input}
						onChange={(e) => {
							setInput(e.target.value);
							setError(null);
						}}
						onKeyDown={handleTextKeyDown}
						placeholder={step.placeholder}
						disabled={loading}
						className="w-full rounded-xl border border-brand/20 bg-page px-4 py-3 text-center text-fg placeholder:text-fg-muted/60 focus:border-cta focus:outline-none focus:ring-2 focus:ring-cta/25 disabled:opacity-60"
						autoComplete="email"
						aria-describedby="eligibility-enter-hint"
					/>
				)}

				{step.kind === 'tel' && (
					<input
						type="tel"
						value={input}
						onChange={(e) => {
							setInput(e.target.value.replace(/\D/g, ''));
							setError(null);
						}}
						onKeyDown={handleTextKeyDown}
						placeholder={step.placeholder}
						disabled={loading}
						className="w-full rounded-xl border border-brand/20 bg-page px-4 py-3 text-center text-fg placeholder:text-fg-muted/60 focus:border-cta focus:outline-none focus:ring-2 focus:ring-cta/25 disabled:opacity-60"
						autoComplete="tel"
						aria-describedby="eligibility-enter-hint"
					/>
				)}

				{step.kind === 'otp' && (
					<div className="flex flex-col items-center gap-2">
						<input
							type="text"
							inputMode="numeric"
							maxLength={6}
							value={input}
							onChange={(e) => handleOtpChange(e.target.value)}
							placeholder={step.placeholder}
							disabled={loading}
							className="mx-auto w-full max-w-xs rounded-xl border border-brand/20 bg-page px-4 py-3 text-center font-mono text-lg tracking-[0.3em] text-fg focus:border-cta focus:outline-none focus:ring-2 focus:ring-cta/25 disabled:opacity-60"
							autoComplete="one-time-code"
							aria-label="Six digit verification code"
						/>
						{devHint && <p className="text-xs text-fg-muted">{devHint}</p>}
						<p className="text-xs text-fg-muted">The code is submitted automatically when all 6 digits are entered.</p>
					</div>
				)}
			</div>

			{showEnterHint && (
				<button
					type="button"
					onClick={() => void tryAdvance()}
					disabled={loading || blockContinueForAbn}
					className="mt-6 w-full rounded-xl bg-cta py-3.5 text-base font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
				>
					Continue
				</button>
			)}

			{error && !terminated && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}

			{loading && step.kind !== 'choice' && (
				<p className="mt-4 text-center text-sm text-fg-muted">Please wait…</p>
			)}

			<p className="mt-6 text-center text-xs text-fg-muted">
				By using this check you agree to our terms of use and privacy policy.
			</p>
		</div>
	);
}
