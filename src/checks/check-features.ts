import { getProperty } from 'dot-prop';

import { getSupportType } from '../clients.js';
import { getFeatures, type FeatureIssue, type Position } from '../features.js';

import { type BaseCheckArgs } from './check-base.js';

interface CheckFeaturesArgs extends BaseCheckArgs {
  titles: string | string[];
  position?: Position;
}

export const checkFeatures = ({ clients, issues, titles, position }: CheckFeaturesArgs) => {
  const { all: features } = getFeatures();

  for (const title of [titles].flat()) {
    for (const client of clients) {
      const feature = features.get(title);

      if (feature === void 0) throw new RangeError(`Feature "${title}" not found.`);

      const { stats } = feature;
      const supportMap = getProperty(stats, client);

      if (supportMap === void 0) {
        throw new RangeError(`Feature "${title}" not found on "${client}".`);
      }

      const supportStatus = getSupportType(supportMap);
      const notes = (supportStatus.noteNumbers ?? []).map(
        (noteNumber) => feature.notes_by_num![String(noteNumber)]
      );
      const support = supportStatus.type;

      const issue: FeatureIssue = {
        notes,
        title,
        position,
        support
      };

      if (support === 'none') {
        issues.errors.set(client, issue);
      } else if (support === 'partial') {
        issues.warnings.set(client, issue);
      }
    }
  }
};
