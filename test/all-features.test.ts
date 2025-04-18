import { describe, expect, test } from 'vitest';

import { getAllFeatures } from '../src/features.js';
import { parseClients } from '../src/clients.js';

describe('all features', () => {
  test('getAllFeatures()', () => {
    const clients = parseClients(['*']);
    const features = getAllFeatures(clients);

    expect(features).toMatchSnapshot();
  });
});
