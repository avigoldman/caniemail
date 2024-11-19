import { getProperty } from 'dot-prop';
import onetime from 'onetime';

import json from './data/can-i-email.json';
import { getSupportType, type EmailClient } from './clients';

export interface FeatureInfo extends FeatureIssue {
  url: string;
}

export interface FeatureIssue {
  notes: string[];
  title: string;
}

export interface FeatureIssues {
  errors: FeatureMap<FeatureIssue>;
  warnings: FeatureMap<FeatureIssue>;
}

type FeatureSet = Map<string, RawFeatureData>;

interface GetFeaturesResult {
  all: FeatureSet;
  css: FeatureSet;
  html: FeatureSet;
}

export type SupportType = string;

interface RawFeatureStats {
  aol: {
    android: Record<string, SupportType>;
    'desktop-webmail': Record<string, SupportType>;
    ios: Record<string, SupportType>;
  };
  'apple-mail': {
    ios: Record<string, SupportType>;
    macos: Record<string, SupportType>;
  };
  fastmail: { 'desktop-webmail': Record<string, SupportType> };
  gmail: {
    android: Record<string, SupportType>;
    'desktop-webmail': Record<string, SupportType>;
    ios: Record<string, SupportType>;
    'mobile-webmail': Record<string, SupportType>;
  };
  hey: { 'desktop-webmail': Record<string, SupportType> };
  laposte: { 'desktop-webmail': Record<string, SupportType> };
  'mail-ru': { 'desktop-webmail': Record<string, SupportType> };
  orange: {
    android: Record<string, SupportType>;
    'desktop-webmail': Record<string, SupportType>;
    ios: Record<string, SupportType>;
  };
  outlook: {
    android: Record<string, SupportType>;
    ios: Record<string, SupportType>;
    macos: Record<string, SupportType>;
    'outlook-com': Record<string, SupportType>;
    windows: Record<string, SupportType>;
    'windows-mail': Record<string, SupportType>;
  };
  protonmail: {
    android: Record<string, SupportType>;
    'desktop-webmail': Record<string, SupportType>;
    ios: Record<string, SupportType>;
  };
  'samsung-email': { android: Record<string, SupportType> };
  sfr: {
    android: Record<string, SupportType>;
    'desktop-webmail': Record<string, SupportType>;
    ios: Record<string, SupportType>;
  };
  thunderbird: { macos: Record<string, SupportType> };
  yahoo: {
    android: Record<string, SupportType>;
    'desktop-webmail': Record<string, SupportType>;
    ios: Record<string, SupportType>;
  };
}

interface RawFeatureData {
  category: 'html' | 'css' | 'image';
  description: string | null;
  keywords: string | null;
  last_test_date: string;
  notes: string | null;
  notes_by_num: null | Record<string, string>;
  slug: string;
  stats: RawFeatureStats;
  test_results_url: string | null;
  test_url: string;
  title: string;
  url: string;
}

export interface RawData {
  api_version: string;
  data: RawFeatureData[];
  last_update_date: string;
  nice_names: any;
}

export const rawData = json as unknown as RawData;

const { data } = json as unknown as RawData;

export class FeatureMap<TValue> extends Map<EmailClient, TValue[]> {
  // @ts-ignore
  set(key: EmailClient, value: TValue): this {
    const values = super.get(key) || [];
    values.push(value);
    super.set(key, values);
    return this;
  }
}

export const getFeatures = onetime((): GetFeaturesResult => {
  const all = new Map();
  const css = new Map();
  const html = new Map();

  for (const bit of data) {
    all.set(bit.title, bit);
    if (bit.category === 'css') css.set(bit.title, bit);
    if (bit.category === 'html') html.set(bit.title, bit);
  }

  return {
    all,
    css,
    html
  };
});

export const getAllFeatures = (clients: EmailClient[]) => {
  const results = {
    supported: new FeatureMap<FeatureInfo>(),
    unsupported: new FeatureMap<FeatureInfo>()
  };
  const { all: features } = getFeatures();

  for (const [, feature] of features) {
    const { stats, title, url } = feature;

    for (const client of clients) {
      const supportMap = getProperty(stats, client);

      // eslint-disable-next-line no-continue
      if (supportMap === void 0) continue;

      const supportStatus = getSupportType(supportMap);
      const notes = (supportStatus.noteNumbers ?? []).map(
        (noteNumber) => feature.notes_by_num![String(noteNumber)]
      );

      if (supportStatus.type === 'none') {
        results.unsupported.set(client, { notes, title, url });
      } else if (supportStatus.type === 'partial') {
        results.supported.set(client, { notes, title, url });
      }
    }
  }

  return results;
};
