import css, { type CssStylesheetAST } from '@adobe/css-tools';
import type { Document, Element, Node, Text } from 'domhandler';
import * as htmlparser from 'htmlparser2';

import { type EmailClient } from './clients.js';
import { type FeatureIssue, type FeatureMap } from './features.js';

export interface IssueGroup {
  issue: FeatureIssue;
  clients: EmailClient[];
}

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
  comparer?: (value: any, targetValue: string | string[]) => boolean
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

export const groupIssues = (issues: FeatureMap<FeatureIssue>): IssueGroup[] => {
  const groupedIssues = new Map<string, IssueGroup>();

  for (const [client, clientIssues] of issues.entries()) {
    for (const issue of clientIssues) {
      if (!issue.position) continue;

      const key = `${issue.position.start.line}:${issue.position.start.column}:${issue.title}`;

      if (!groupedIssues.has(key)) {
        groupedIssues.set(key, {
          issue,
          clients: [client]
        });
      } else {
        groupedIssues.get(key)!.clients.push(client);
      }
    }
  }

  return Array.from(groupedIssues.values());
};

export const parseCss = (cssContent: string) => css.parse(cssContent);

export const parseHtml = (html: string): ParseHtmlResult => {
  const document = htmlparser.parseDocument(html, { withStartIndices: true, withEndIndices: true });

  const styleNodes: Element[] = [];
  for (const childNode of document.childNodes) {
    styleNodes.push(...getStyleNodes(childNode));
  }

  const stylesheets: CssStylesheetAST[] = [];
  for (const styleNode of styleNodes) {
    const styleTextNode = styleNode.childNodes[0] as Text | undefined;
    if (styleTextNode !== void 0) {
      stylesheets.push(parseCss(styleTextNode.data));
    }
  }

  return {
    document,
    stylesheets
  };
};

export const sortIssues = (groupedIssues: IssueGroup[]): IssueGroup[] => {
  return [...groupedIssues].sort((a, b) => {
    const aPos = a.issue.position!.start;
    const bPos = b.issue.position!.start;
    return aPos.line === bPos.line ? aPos.column - bPos.column : aPos.line - bPos.line;
  });
};
