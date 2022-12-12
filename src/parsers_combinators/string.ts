import { seq } from './lib/seq'
import { tag } from './lib/tag'
import { take } from './lib/take'

export const string = seq(
	{
		token: 'STRING_VALUE',
		tokenValue(value) {
			return value.reduce((res, { value }) => res + value, '')
		}
	},

	tag('"'),
	take(/[^"]/),
	tag('"')
)
