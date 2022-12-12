import { Parser, ParserOptions, ParserState, ParserToken } from './types'
import { intoBufIter, intoIter, seq as iterSeq } from './iter'
import { ParserError } from './errors'

// парсерный комбинатор or
export function or<T = unknown, R = unknown>(
	...parsers: Parser[]
): Parser<T, R>;

export function or<T = unknown, R = unknown>(
	opts: ParserOptions,
	...parsers: Parser[]
): Parser<T, R>;

export function or(
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
			yields: ParserToken[] = []

		let
			value,
			done = false,
			iter = intoIter(source),
			data

		outer: for (const parser of parsers) {
			const
				buffer = [],
				parsing = parser(intoBufIter(iter, buffer), prev)

			while (true) {
				try {
					const
						chunk = parsing.next(data)

					if (chunk.done) {
						done = true
						value = chunk.value[0]
						iter = intoIter(chunk.value[1])
						break outer

					} else {
						if (chunk.value === ParserState.EXPECT_NEW_INPUT) {
							data = yield chunk.value

						} else {
							yields.push(chunk.value)
						}
					}

				} catch (err) {
					iter = buffer.length > 0 ? iterSeq(buffer, iter) : iter
					yields.splice(0, yields.length)
					break
				}
			}
		}

		if (!done) {
			throw new ParserError('Invalid data', prev)
		}

		yield* yields

		if (opts.token) {
			yield {
				type: opts.token,
				value: opts.tokenValue?.(value) ?? value
			}
		}

		const token = {
			type: 'OR',
			value
		}

		return [token, iter]
	}
}
