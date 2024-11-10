import { describe, expect, test } from 'vitest';

import {
  atRuleTitles,
  functionTitles,
  keywordTitles,
  propertyTitles,
  propertyValuePairTitles,
  unitTitles
} from '../src/css-titles';
import { attributeTitles, elementAttributePairTitles, elementTitles } from '../src/html-titles';
import { psuedoSelectorTitles, selectorTitles } from '../src/selectors';

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
