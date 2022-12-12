import { take } from './lib/take'
import { seq } from './lib/seq'
import { or } from './lib/or'
import { tag } from './lib/tag'
import { opt } from './lib/opt'

const sign = take(/[\-+]/, {
	min: 0,
	max: 1,
	token: 'NUMBER_SIGN'
})

const exp = seq(
	tag([/e/i]),
	take(/[\-+]/, { token: 'EXP_SIGN', min: 0, max: 1 }),
	take(/\d/, { token: 'EXP_VALUE' })
)

const fractional = seq(
	tag('.'),
	take(/\d/, { token: 'FRACTIONAL_VALUE' })
)

export const number = seq(
	sign,

	seq(
		or(
			seq(
				tag('0', { token: 'INT_VALUE' }),
				fractional
			),

			seq(
				seq(
					{
						token: 'INT_VALUE',
						tokenValue(value) {
							return value.reduce((res, { value }) => res + value, '')
						}
					},

					tag([/[1-9]/]),
					take(/\d/, { min: 0 }),
				),

				opt(fractional)
			)
		),

		opt(exp)
	)
)
