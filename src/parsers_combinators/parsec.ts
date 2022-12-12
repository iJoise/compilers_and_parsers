// Парсерные комбинаторы
import { take } from './lib/take'
import type { ParserValue } from './lib/types'
import { or } from './lib/or'
import { repeat } from './lib/repeat'
import { tag } from './lib/tag'
import { seq } from './lib/seq'
import { opt } from './lib/opt'
import { ws } from './space'
import { number } from './number'
import { string } from './string'
import { boolean } from './boolean'

// поточный парсер JSON
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
