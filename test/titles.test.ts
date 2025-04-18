import { describe, expect, test } from 'vitest';

import {
  atRuleTitles,
  functionTitles,
  keywordTitles,
  propertyTitles,
  propertyValuePairTitles,
  unitTitles
} from '../src/css-titles.js';
import { attributeTitles, elementAttributePairTitles, elementTitles } from '../src/html-titles.js';
import { psuedoSelectorTitles, selectorTitles } from '../src/selectors.js';

describe('css', () => {
  Object.entries({
    atRuleTitles,
    functionTitles,
    keywordTitles,
    propertyTitles,
    propertyValuePairTitles,
    psuedoSelectorTitles,
    selectorTitles,
    unitTitles
  }).forEach(([name, map]) => {
    test(name, () => {
      expect(Object.keys(map).sort()).toMatchSnapshot();
    });
  });
});

describe('html', () => {
  Object.entries({
    attributeTitles,
    elementAttributePairTitles,
    elementTitles
  }).forEach(([name, map]) => {
    test(name, () => {
      expect(Object.keys(map).sort()).toMatchSnapshot();
    });
  });
});
