import type { ParserValue, Test } from './types'


export class ParserError extends Error {
	prev: ParserValue | undefined

	constructor(message: string, prev: ParserValue | undefined) {
		super(message)
		this.prev = prev
	}
}

export function testChar(
	test: Test,
	char: string,
	prev: ParserValue | undefined
): boolean {
	switch (typeof test) {
		case 'string':
			if (test !== char) {
				throw new ParserError('Invalid string', prev)
			}

			break

		case 'function':
			if (!test(char)) {
				throw new ParserError('Invalid string', prev)
			}

			break

		default:
			if (!test.test(char)) {
				throw new ParserError('Invalid string', prev)
			}
	}

	return true
}
