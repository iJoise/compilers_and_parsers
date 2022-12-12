import { Parser, ParserState, ParserToken, RepeatOptions } from './types'
import { intoBufIter, intoIter, seq as iterSeq } from './iter'
import { ParserError } from './errors'

// парсерный комбинатор repeat
export function repeat<T = unknown, R = unknown>(
	parser: Parser<T, R>,
	opts: RepeatOptions<T[]> = {}
): Parser<T | T[], R[]> {
	return function* (source, prev) {
		const
			{ min = 1, max = Infinity } = opts

		const
			value: T[] = [],
			yields: ParserToken<T | T[]>[] = []

		let
			iter = intoIter(source),
			count = 0,
			data

		const
			globalBuffer: string[] = []

		outer: while (true) {
			const
				buffer: string[] = count >= min ? [] : globalBuffer,
				parsing = parser(intoBufIter(iter, buffer), prev)

			while (true) {
				if (count >= max) {
					yield* yields
					break outer
				}

				try {
					const
						chunk = parsing.next(data)

					if (chunk.done) {
						prev = chunk.value[0]
						iter = intoIter(chunk.value[1])

						value.push(<any>prev)
						count++

						if (count >= min) {
							yield* yields
							yields.splice(0, yields.length)
						}

						break

					} else {
						if (chunk.value === ParserState.EXPECT_NEW_INPUT) {
							data = yield chunk.value

							if (data == null) {
								throw new ParserError('Invalid input', prev)
							}

							iter = intoIter(data)

						} else {
							yields.push(chunk.value)
						}
					}

				} catch (err) {
					if (count < min) {
						throw err
					}

					iter = buffer.length > 0 ? iterSeq(buffer, iter) : iter
					break outer
				}
			}
		}

		if (opts.token && count > 0) {
			yield {
				type: opts.token,
				value: opts.tokenValue?.(value) ?? value
			}
		}

		const token = {
			type: 'REPEAT',
			value
		}

		return [token, iter]
	}
}
