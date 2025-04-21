import micromatch from 'micromatch';

import type { SupportType } from './json.cjs';

export const clientNames = [
  'apple-mail.macos',
  'apple-mail.ios',
  'gmail.desktop-webmail',
  'gmail.ios',
  'gmail.android',
  'gmail.mobile-webmail',
  'orange.desktop-webmail',
  'orange.ios',
  'orange.android',
  'outlook.windows',
  'outlook.windows-mail',
  'outlook.macos',
  'outlook.ios',
  'outlook.android',
  'yahoo.desktop-webmail',
  'yahoo.ios',
  'yahoo.android',
  'aol.desktop-webmail',
  'aol.ios',
  'aol.android',
  'samsung-email.android',
  'sfr.desktop-webmail',
  'sfr.ios',
  'sfr.android',
  'thunderbird.macos',
  'protonmail.desktop-webmail',
  'protonmail.ios',
  'protonmail.android',
  'hey.desktop-webmail',
  'mail-ru.desktop-webmail',
  'fastmail.desktop-webmail',
  'laposte.desktop-webmail'
] as const;

export type EmailClient = (typeof clientNames)[number];

type ClientSplit<S extends string> = S extends `${infer First}.${infer Second}`
  ? [First, Second]
  : never;
type ClientTuple = ClientSplit<(typeof clientNames)[number]>;
type Provider = ClientTuple[0];
type Platform = ClientTuple[1];

export type EmailClientGlobs = '*' | `${Provider}.${Platform}` | `*.${Platform}` | `${Provider}.*`;

export interface SupportTypeResult {
  noteNumbers: number[] | undefined;
  type: 'full' | 'partial' | 'none';
}

export const parseClients = (globs: EmailClientGlobs[]) =>
  Array.from(new Set<EmailClient>(micromatch(clientNames, globs) as any));

export function getSupportType(stats: Record<string, SupportType>): SupportTypeResult {
  const statKeys = Object.keys(stats).sort((k1, k2) => {
    if (k1 < k2) return -1;
    else if (k1 > k2) return 1;
    return 0;
  });

  // TODO: option to specify specific version, right now, it defaults to latest
  const latestEmailClient = statKeys[statKeys.length - 1];
  const supportStatus = stats[latestEmailClient];

  let noteNumbers: number[] | undefined = [...supportStatus.matchAll(/#(\d+)/g)]
    .map((matches) => matches[1])
    .map((noteNumber) => Number(noteNumber));

  if (noteNumbers.length === 0) noteNumbers = void 0;

  if (supportStatus.startsWith('y')) return { noteNumbers, type: 'full' };
  else if (supportStatus.startsWith('n')) return { noteNumbers, type: 'none' };

  return { noteNumbers, type: 'partial' };
}
