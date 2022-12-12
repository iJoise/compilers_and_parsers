// опциональный комбинатор
import { repeat } from './repeat'
import type { Parser, ParserOptions } from './types'

export function opt<T = unknown, R = unknown>(
	parser: Parser<T, R>,
	opts?: ParserOptions<T[]>
): Parser<T | T[], R[]> {
	return repeat(parser, { min: 0, max: 1, ...opts })
}
