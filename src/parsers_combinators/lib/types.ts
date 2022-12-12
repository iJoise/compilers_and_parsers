export type Test = string | RegExp | ((char: string) => boolean);

export enum ParserState {
	EXPECT_NEW_INPUT
}

export interface ParserToken<T = unknown> {
	type: string;
	value?: T;
}

export interface ParserValue<T = unknown> extends ParserToken<T> {
}

type ParserResult<T = unknown> = [ParserValue, Iterable<string>];
export type Parser<T = unknown, R = unknown> =
	(iterable: Iterable<string>, prev?: ParserValue) =>
		Generator<ParserState | ParserToken<T>, ParserResult<R>, Iterable<string> | undefined>;

export interface ParserOptions<T = unknown> {
	token?: string;

	tokenValue?(unknown): T;
}

export interface TakeOptions extends ParserOptions<string> {
	min?: number;
	max?: number;
}

export interface RepeatOptions<T = unknown> extends ParserOptions<T> {
	min?: number;
	max?: number;
}
