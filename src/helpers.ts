import css, { type CssStylesheetAST } from '@adobe/css-tools';
import type { Document, Element, Node, Text } from 'domhandler';
import * as htmlparser from 'htmlparser2';

interface ParseHtmlResult {
  document: Document;
  stylesheets: CssStylesheetAST[];
}

export function fromTitleEntries<T>(
  entries: Array<{ title: string; value: T } | undefined>
): Record<string, T> {
  return Object.fromEntries(
    entries.filter((entry) => entry !== void 0).map((entry) => [entry.title, entry.value])
  );
}

export const getTitleMatches = (
  pairs: Record<string, any>,
  targetValue: string | string[],
  comparer?: (value: any, targetValue: string | string[]) => Boolean
): string[] =>
  Object.entries(pairs)
    .filter(([, value]) => (comparer ? comparer(value, targetValue) : targetValue.includes(value)))
    .map(([title]) => title);

const getStyleNodes = (node: Node) => {
  if (node.type === htmlparser.ElementType.Style) return [node as Element];

  const results: Element[] = [];

  if ('childNodes' in node) {
    for (const child of (node as Element).childNodes) {
      results.push(...getStyleNodes(child));
    }
  }

  return results;
};

export function parseHtml(html: string): ParseHtmlResult {
  const document = htmlparser.parseDocument(html);

  const styleNodes: Element[] = [];
  for (const childNode of document.childNodes) {
    styleNodes.push(...getStyleNodes(childNode));
  }

  const stylesheets: CssStylesheetAST[] = [];
  for (const styleNode of styleNodes) {
    const styleTextNode = styleNode.childNodes[0] as Text | undefined;
    if (styleTextNode !== void 0) {
      stylesheets.push(css.parse(styleTextNode.data));
    }
  }

  return {
    document,
    stylesheets
  };
}
