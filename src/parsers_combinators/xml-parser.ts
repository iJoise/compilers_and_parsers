import {ws} from './space'
import {seq} from "./lib/seq";
import {take} from "./lib/take";
import {tag} from "./lib/tag";
import {repeat} from "./lib/repeat";
import {or} from "./lib/or";
import {opt} from "./lib/opt";

const xmlNameRegexp = /[^ <>"'=/]/

const xmlAttr = seq(
    ws,
    take(xmlNameRegexp, {token: 'CREATE_ATTR_KEY'}),
    ws,
    tag('='),
    ws,
    tag('"'),
    take(/[^"]/, {token: 'CREATE_ATTR_VALUE'}),
    tag('"')
)

const xmlTag = seq(
    ws,
    tag('<'),
    ws,
    take(xmlNameRegexp, {token: 'CREATE_TAG'}),
    ws,
    repeat(xmlAttr, {min: 0}),
    ws,
    tag('>', {token: 'END_CREATE_TAG'}),
)

const xmlEndTag = seq(
    ws,
    tag('</'),
    ws,
    take(xmlNameRegexp, {token: 'END_TAG'}),
    ws,
    tag('>'),
)

const xmlText = seq(
    take(/[^<>]/, {token: 'TEXT'}),
)

export const xml = repeat(
    seq(
        xmlTag,
        opt(
            (...args) =>
                or(
                    seq(xmlText, xml, opt(xmlText)),
                    xml
                )(...args)),
        xmlEndTag,
    ),
    {min: 0}
)

const p = xml(`
<foo attr-1="value 1" attr-2="value 2">
  <bar attr-1="value 1">Hello world</bar>
</foo>
`)
console.log([...p])
