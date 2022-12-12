import { Parser, ParserState, TakeOptions, Test } from './types'
import { intoIter, seq as iterSeq } from './iter'
import { ParserError, testChar } from './errors'

// Фабрика take
export function take(
	test: Test,
	opts: TakeOptions = {}
): Parser<string, string> {
	return function* (source, prev) {
		const
			{ min = 1, max = Infinity } = opts

		const
			buffer: string[] = []

		let
			iter = intoIter(source),
			count = 0

		let
			value = ''

		while (true) {
			if (count >= max) {
				break
			}

			let
				chunk = iter.next(),
				char = chunk.value

			if (chunk.done) {
				if (count >= min) {
					break
				}

				const
					data = yield ParserState.EXPECT_NEW_INPUT

				if (data == null) {
					throw new ParserError('Invalid input', prev)
				}

				source = data
				iter = intoIter(source)
				chunk = iter.next()
				char = chunk.value
			}

			try {
				if (testChar(test, char, prev)) {
					count++
				}

			} catch (err) {
				if (count < min) {
					throw err
				}

				buffer.push(char)
				break
			}

			value += char
		}

		if (opts.token && count > 0) {
			yield {
				type: opts.token,
				value: opts.tokenValue?.(value) ?? value
			}
		}

		const token = {
			type: 'TAKE',
			value,
		}

		return [token, buffer.length > 0 ? iterSeq(buffer, iter) : iter]
	}
}
