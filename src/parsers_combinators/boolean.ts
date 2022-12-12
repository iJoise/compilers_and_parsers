import { or } from './lib/or'
import { tag } from './lib/tag'

export const boolean = or(
	{
		token: 'BOOLEAN_VALUE',
		tokenValue({ value }) {
			return value
		}
	},

	tag('true'),
	tag('false')
)
