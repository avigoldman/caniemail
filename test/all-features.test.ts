import { describe, expect, test } from 'vitest';

import { parseClients } from '../dist/clients.js';
import { getAllFeatures } from '../dist/features.js';

describe('all features', () => {
  test('getAllFeatures()', () => {
    const clients = parseClients(['*']);
    const features = getAllFeatures(clients);

    expect(clients).toMatchSnapshot();
    expect(features).toMatchSnapshot();
  });
});
