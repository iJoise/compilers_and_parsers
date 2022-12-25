import {xml} from "./xml-parser";

function minimizeHTML(html) {
    let res = ''

    const tokens = xml(html)

    for (const token of tokens) {
        const val = token.value

        switch (token.type) {
            case 'CREATE_TAG':
                res += `<${val}`
                break

            case 'END_CREATE_TAG':
                res += '>'
                break

            case 'END_TAG':
                res += `</${val}>`
                break

            case 'CREATE_ATTR_KEY':
                res += ` ${val}`
                break

             case 'CREATE_ATTR_VALUE':
                 if (!/\s/.test(val)) {
                     res += `=${val}`
                 } else {
                     res += `="${val}"`
                 }
                 break

            case 'TEXT':
                let text = ''
                if (val.includes('\n')) {
                    text += val.replace(/\n/g, '').trim()
                }

                res += text.replace(/(\s)\1+/g, '$1')
                break
        }
    }

    return res
}

const html = minimizeHTML(`
<p attr="foo"   att2="bar">
    Hello       bar
</p>
`);

console.log(html)
