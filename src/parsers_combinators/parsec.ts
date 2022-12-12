// Парсерные комбинаторы

import type { Parser, ParserOptions, ParserValue } from './types'
import { tag } from './tag'
import { take } from './take'
import { seq } from './seq'
import { or } from './or'
import { repeat } from './repeat'


// опциональный комбинатор
function opt<T = unknown, R = unknown>(
	parser: Parser<T, R>,
	opts?: ParserOptions<T[]>
): Parser<T | T[], R[]> {
	return repeat(parser, {min: 0, max: 1, ...opts})
}

// white space
const
	ws = take(/\s/, {min: 0});

const sign = take(/[\-+]/, {
	min: 0,
	max: 1,
	token: 'NUMBER_SIGN'
});

const exp = seq(
	tag([/e/i]),
	take(/[\-+]/, {token: 'EXP_SIGN', min: 0, max: 1}),
	take(/\d/, {token: 'EXP_VALUE'})
);

const fractional = seq(
	tag('.'),
	take(/\d/, {token: 'FRACTIONAL_VALUE'})
);

const number = seq(
	sign,

	seq(
		or(
			seq(
				tag('0', {token: 'INT_VALUE'}),
				fractional
			),

			seq(
				seq(
					{
						token: 'INT_VALUE',
						tokenValue(value) {
							return value.reduce((res, {value}) => res + value, '');
						}
					},

					tag([/[1-9]/]),
					take(/\d/, {min: 0}),
				),

				opt(fractional)
			)
		),

		opt(exp)
	)
);

const string = seq(
	{
		token: 'STRING_VALUE',
		tokenValue(value) {
			return value.reduce((res, {value}) => res + value, '');
		}
	},

	tag('"'),
	take(/[^"]/),
	tag('"')
);

const boolean = or(
	{
		token: 'BOOLEAN_VALUE',
		tokenValue({value}) {
			return value;
		}
	},

	tag('true'),
	tag('false')
);

const json = (
	source: Iterable<string>,
	prev?: ParserValue | undefined
) => or(string, boolean, number, array, object)(source, prev);

const array = seq(
	tag('[', {token: 'ARRAY_START'}),
	ws,

	repeat(seq(ws, json, ws, tag(','), ws), {min: 0}),
	opt(json),

	ws,
	tag(']', {token: 'ARRAY_END'}),
);

const objectKey = seq(
	{
		token: 'OBJECT_KEY',
		tokenValue(value) {
			return value[1].value;
		}
	},

	tag('"'),
	take(/[^"]/),
	tag('"'),
	ws,
	tag(':'),
	ws
);

const objectValue = seq(ws, objectKey, ws, json, ws);

const object = seq(
	tag('{', {token: 'OBJECT_START'}),
	ws,

	repeat(seq(ws, objectValue, ws, tag(','), ws), {min: 0}),
	opt(objectValue),

	ws,
	tag('}', {token: 'OBJECT_END'}),
);

// const p = json('{"a" : {"b": [1, 2, 3]}}');
const p = json('{"a" : {"b":');

console.dir(p.next(), {depth: null});
console.dir(p.next('[1, 2, 3]}}'), {depth: null});
console.dir([...p], {depth: null});
console.log(p.next())
