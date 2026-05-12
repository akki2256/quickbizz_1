export type TextBlock =
	| { kind: 'paragraph'; text: string; emphasize: boolean }
	| { kind: 'list'; items: string[] };

function cleanLine(line: string): string {
	return line.replace(/^[•\-]\s*/, '').trim();
}

function isEmphasisLine(line: string): boolean {
	return line.endsWith('?') || line.endsWith(':');
}

export function parseStructuredText(input: string): TextBlock[] {
	const sections = input
		.split(/\n\s*\n/g)
		.map((section) => section.trim())
		.filter(Boolean);

	return sections.flatMap((section) => {
		const lines = section
			.split('\n')
			.map((line) => line.trim())
			.filter(Boolean);
		if (!lines.length) return [];

		const bulletLines = lines.filter((line) => /^[•\-]\s+/.test(line));
		if (bulletLines.length === lines.length) {
			return [{ kind: 'list', items: bulletLines.map(cleanLine) }];
		}

		const blocks: TextBlock[] = [];
		let paragraphBuffer: string[] = [];
		let listBuffer: string[] = [];

		const flushParagraph = () => {
			if (!paragraphBuffer.length) return;
			const text = paragraphBuffer.join(' ').trim();
			blocks.push({ kind: 'paragraph', text, emphasize: isEmphasisLine(text) });
			paragraphBuffer = [];
		};

		const flushList = () => {
			if (!listBuffer.length) return;
			blocks.push({ kind: 'list', items: listBuffer });
			listBuffer = [];
		};

		for (const line of lines) {
			if (/^[•\-]\s+/.test(line)) {
				flushParagraph();
				listBuffer.push(cleanLine(line));
				continue;
			}

			flushList();
			paragraphBuffer.push(line);
		}

		flushParagraph();
		flushList();
		return blocks;
	});
}
