// Парсер математических выражений
interface Token {
	type: string,
	value: unknown;
	children?: Token[]
}

export function parseExpr(str: string) {
	str = str.replace(/\s/g, '')

	// if (/[^\d()+\-*/]/.test(str) || /(^|[^\d(])[+\-*/]($|[^\d)])/.test(str)) {
	// 	return NaN;
	// }

	const
		stack: string[] = [],
		queue: Token[] = []

	const
		isOp = /[+\-*/]/

	const priority = {
		'(': -1,
		')': -1,
		'+': 0,
		'-': 0,
		'*': 2,
		'/': 1
	}

	const lexems = str.split(/\b/).flatMap((el) => {
		if (/[+-/*()]/.test(el)) {
			return el.split('')
		}
		return el
	})

	for (const char of lexems) {
		if (char === '(') {
			stack.push(char)

		} else if (char === ')') {
			let
				valid = false

			while (stack.length > 0) {
				const
					head = stack.pop()

				if (head === '(') {
					valid = true
					break
				}

				queue.push({
					type: 'operator',
					value: head,
					children: [],
				})
			}

			if (!valid) {
				return NaN
			}

		} else if (isOp.test(char)) {
			if (stack.length === 0 || stack.at(-1) === '(') {
				stack.push(char)

			} else {
				while (priority[stack.at(-1)!] > priority[char]) {
					queue.push({
						type: 'operator',
						value: stack.pop(),
						children: [],
					})
				}

				stack.push(char)
			}

		} else {
			if (isNaN(<number><unknown>char)) {
				queue.push({
					type: 'variable',
					value: char
				})
			} else {
				queue.push({
					type: 'number',
					value: parseInt(char)
				})
			}
		}
	}

	while (stack.length > 0) {
		queue.push({
			type: 'operator',
			value: stack.pop(),
			children: [],
		})
	}

	const
		exprStack: Token[] = []

	for (const token of queue) {
		switch (token.type) {
			case 'number':
			case 'variable':
				exprStack.push(token)
				break
			default: {
				switch (token.value) {
					case '(': return NaN
					case ')': return NaN

					default:
						const right = exprStack.pop()!
						const left = exprStack.pop()!

						if (left.type === 'number' && right.type === 'number') {
							switch (token.value) {
								case '+':
									exprStack.push({
										type: 'number',
										value: Number(left.value) + Number(right.value)
									});
									break;

								case '-': {
									exprStack.push({
										type: 'number',
										value: Number(left.value) - Number(right.value)
									});
									break;
								}

								case '*':
									exprStack.push({
										type: 'number',
										value: Number(left.value) * Number(right.value)
									});
									break;

								case '/': {
									exprStack.push({
										type: 'number',
										value: Number(left.value) / Number(right.value)
									});
									break;
								}

								default:
									throw new TypeError('Invalid operator')
							}
						} else {
							token.children!.push(left)
							token.children!.push(right)
							exprStack.push(token)
						}
				}
			}
		}
	}

	return exprStack.pop()
}

// const ast = parseExpr('10 + x * 15 / (4 - y)');
// const ast = parseExpr('10 + x * 15 / (4 - 2)');
const ast = parseExpr('10 + 2 * 15 / (4 - 2)');
console.dir(ast, { depth: null })
