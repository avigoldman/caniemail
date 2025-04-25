import type { CssStylesheetAST } from '@adobe/css-tools';
import type { Document } from 'domhandler';

import { checkStylesheet } from './checks/check-css.js';
import { checkHtml } from './checks/check-html.js';
import { type EmailClient, type EmailClientGlobs, parseClients } from './clients.js';
import { type FeatureIssue, type FeatureIssues, FeatureMap } from './features.js';
import { parseCss, parseHtml } from './helpers.js';

export * from './helpers.js';
export { getAllFeatures, rawData } from './features.js';

export interface CanIEmailOptions {
  /**
		An array of client names or globs to match email clients.
		Example: ['gmail.android', 'outlook.*', '*.ios']
	*/
  clients: EmailClientGlobs[];
  css?: string;
  html?: string;
}

export interface CanIEmailResult {
  issues: FeatureIssues;
  success: boolean;
}

interface FormatIssueOptions {
  client: EmailClient;
  issue: FeatureIssue;
  issueType: 'error' | 'warning';
}

export const caniemail = ({ clients: globs, css, html }: CanIEmailOptions): CanIEmailResult => {
  if (!css && !html) throw new RangeError('Please provide either `code` or `html` options');

  let document: Document | null = null;
  let stylesheets: CssStylesheetAST[] = [];

  const clients = parseClients(globs);
  const issues: FeatureIssues = {
    errors: new FeatureMap<FeatureIssue>(),
    warnings: new FeatureMap<FeatureIssue>()
  };

  if (!clients.length)
    throw new RangeError(`The specified email client(s) (${globs.join(', ')}) were not found`);
  if (css) stylesheets.push(parseCss(css));
  if (html) ({ document, stylesheets } = parseHtml(html));

  for (const stylesheet of stylesheets) checkStylesheet({ clients, issues, stylesheet });

  if (document) checkHtml({ clients, document, issues, source: html! });

  return {
    issues,
    success: issues.errors.size === 0
  };
};

export const formatIssue = ({ client, issue, issueType }: FormatIssueOptions) => {
  const { notes, title } = issue;
  return {
    message:
      issueType === 'error'
        ? `\`${title}\` is not supported by \`${client}\``
        : `\`${title}\` is only partially supported by \`${client}\``,
    notes: notes.map((note) => `Note about \`${title}\` support for \`${client}\`: ${note}`)
  };
};
