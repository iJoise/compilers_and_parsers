import { Parser, ParserOptions, ParserState } from './types'
import { intoIter } from './iter'

// парсерный комбинатор seq ( sequence )
export function seq<T = unknown, R = unknown>(
	...parsers: Parser[]
): Parser<T | T[], R[]>;

export function seq<T = unknown, R = unknown>(
	opts: ParserOptions,
	...parsers: Parser[]
): Parser<T | T[], R[]>;

export function seq(
	optsOrParser: ParserOptions | Parser,
	...parsers: Parser[]
): Parser {
	let
		opts: ParserOptions = {}

	if (typeof optsOrParser === 'function') {
		parsers.unshift(optsOrParser)

	} else {
		opts = optsOrParser
	}

	return function* (source, prev) {
		const
			value: unknown[] = []

		let
			iter = intoIter(source),
			data

		for (const parser of parsers) {
			const
				parsing = parser(iter, prev)

			while (true) {
				const
					chunk = parsing.next(data)

				if (chunk.done) {
					prev = chunk.value[0]
					value.push(prev)

					iter = intoIter(chunk.value[1])
					break

				} else {
					if (chunk.value === ParserState.EXPECT_NEW_INPUT) {
						data = yield chunk.value

					} else {
						yield chunk.value
					}
				}
			}
		}

		if (opts.token) {
			yield {
				type: opts.token,
				value: opts.tokenValue?.(value) ?? value
			}
		}

		const token = {
			type: 'SEQ',
			value
		}

		return [token, iter]
	}
}
