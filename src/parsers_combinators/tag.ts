import { Parser, ParserOptions, ParserState, Test } from './types'
import { intoIter } from './iter'
import { ParserError, testChar } from './errors'

// фабрика tag
export function tag(pattern: Iterable<Test>, opts: ParserOptions<string> = {}): Parser<string, string> {
	return function* (source, prev) {
		let
			iter = intoIter(source)

		let
			value = ''

		for (const test of pattern) {
			let
				chunk = iter.next(),
				char = chunk.value

			if (chunk.done) {
				const
					data = yield ParserState.EXPECT_NEW_INPUT

				if (data == null) {
					throw new ParserError('Invalid input', prev)
				}

				iter = intoIter(data)
				chunk = iter.next()
				char = chunk.value
			}

			testChar(test, char, prev)
			value += char
		}

		if (opts.token) {
			yield {
				type: opts.token,
				value: opts.tokenValue?.(value) ?? value
			}
		}

		const token = {
			type: 'TAG',
			value,
		}

		return [token, iter]
	}
}
