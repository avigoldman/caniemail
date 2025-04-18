import { getProperty } from 'dot-prop';
import onetime from 'onetime';

import { getSupportType, type EmailClient } from './clients.js';
import { caniEmailJson, type RawFeatureData } from './json.cjs';

export { caniEmailJson as rawData };

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

  for (const bit of caniEmailJson.data) {
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
