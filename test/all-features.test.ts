import { describe, expect, test } from 'vitest';

import { getAllFeatures } from '../dist/features.js';
import { parseClients } from '../dist/clients.js';

describe('all features', () => {
  test('getAllFeatures()', () => {
    const clients = parseClients(['*']);
    const features = getAllFeatures(clients);

    expect(clients).toMatchSnapshot();
    expect(features).toMatchSnapshot();
  });
});
