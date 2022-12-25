import {seq} from "./lib/seq";
import {take} from "./lib/take";
import {ws} from "./space";
import {tag} from "./lib/tag";
import {or} from "./lib/or";
import {repeat} from "./lib/repeat";

// определить глубину вложенности
const depth = or(
  seq(
    tag('\n'),

    take(/ /, {
      token: 'DEPTH',
      tokenValue: (v) => v.length
    })
  ),
  ws
)

// перенос строки (next line)
const nl = take(/\n/, {token: 'NL'})

const header = seq(
  depth,
  take(/#/, {
    token: 'HEADER',
    tokenValue: (v) => v.length
  }),
  ws,
  take(/[^\n]/, {token: 'HEADER_VALUE'})
)

const link = seq(
  depth,
  tag('['),
  take(/[^\]\n]/, {token: 'LINK_TEXT',}),
  tag(']('),
  take(/[^)]/, {token: 'LINK_VALUE',}),
  tag(')')
)

const ul = seq(
  depth,
  tag('*'),
  ws,
  take(/[^\n]/, {token: 'LI_LABLE',}),
)

const text = seq(
  depth,
  take(/[^\n]/, {token: 'TEXT'})
)

const markdown = repeat(
  or(
    header,
    link,
    ul,
    text,
    ws,
    nl
  )
)

function markdownToHTML(text): any {
  const tokens = markdown(text)
  const doc = document.createDocumentFragment()
  const stack: Element[] = []

  let currentDepth = 0

  for (const token of tokens) {
    // @ts-ignore
    const v = token.value
    // @ts-ignore
    switch (token.type) {

      case 'HEADER':
        stack.push(document.createElement(`h${v}`))
        break

      case 'HEADER_VALUE':
        stack.at(-1)!.innerHTML = v
        doc.append(stack.pop()!)
        break

      case 'LINK_TEXT':
        const a = document.createElement('a')
        a.innerHTML = v
        stack.push(a)

        break

      case 'LINK_VALUE':
        stack.at(-1)!.setAttribute('href', v)
        doc.append(stack.pop()!)
        break

      case 'DEPTH':
        if (v < currentDepth) {
          //TODO: continue
        }

    }
  }

  return doc
}

console.log([...markdownToHTML(`
# Heading

[iJoise github](https://github.com/iJoise)

* List item 1
  * Nested List item 1
* List item 2
`)]);

/*
<h1>Heading</h1>
<a href="https://github.com/iJoise">iJoise github</a>
<ul>
  <li>
    List item 1
    <ul>
      <li>Nested List item 1</li>
    </ul>
  </li>
  <li>List item 2</li>
</ul>
*/
