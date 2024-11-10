import micromatch from 'micromatch';

import { checkHtml, checkStylesheet } from './checks';
import { clientNames, type EmailClient, type EmailClientGlobs } from './clients';
import { FeatureMap, type FeatureIssues, type FeatureIssue } from './features';
import { parseHtml } from './helpers';

export { rawData } from './features';

export interface CanIEmailOptions {
  /**
		An array of client names or globs to match email clients.
		Example: ['gmail.android', 'outlook.*', '*.ios']
	*/
  clients: EmailClientGlobs[];
  code: string;
}

export interface CanIEmailResult {
  issues: FeatureIssues;
  success: boolean;
}

export const caniemail = ({ clients: globs, code }: CanIEmailOptions): CanIEmailResult => {
  const { document, stylesheets } = parseHtml(code);
  const clients = Array.from(new Set<EmailClient>(micromatch(clientNames, globs) as any));
  const issues: FeatureIssues = {
    errors: new FeatureMap<FeatureIssue>(),
    warnings: new FeatureMap<FeatureIssue>()
  };

  if (clients.length === 0) {
    throw new RangeError(`The specified email client(s) (${globs.join(', ')}) were not found`);
  }

  for (const stylesheet of stylesheets) checkStylesheet({ clients, issues, stylesheet });

  checkHtml({ clients, document, issues });

  return {
    issues,
    success: issues.errors.size === 0
  };
};

interface FormatIssueOptions {
  client: EmailClient;
  issue: FeatureIssue;
  issueType: 'error' | 'warning';
}

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
