import { describe, expect, test } from 'vitest';

import { getAllFeatures } from '../src/features';
import { parseClients } from '../src/clients';

describe('all features', () => {
  test('getAllFeatures()', () => {
    const clients = parseClients(['*']);
    const features = getAllFeatures(clients);

    expect(features).toMatchSnapshot();
  });
});
