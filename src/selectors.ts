import * as CSSWhat from 'css-what';
import { SelectorType } from 'css-what';

import { getFeatures } from './features.js';
import { fromTitleEntries, getTitleMatches } from './helpers.js';

type SelectorDetector = (selectors: CSSWhat.Selector[][]) => boolean;

const features = getFeatures().css;
const keys = [...features.keys()];

export const selectorDetectorsMap: Record<string, SelectorDetector> = {
  'Adjacent sibling combinator': (selectors: CSSWhat.Selector[][]) => {
    for (const selector of selectors) {
      if (selector.some((s) => s.type === SelectorType.Adjacent)) return true;
    }

    return false;
  },
  'Attribute selector': (selectors: CSSWhat.Selector[][]) => {
    for (const selector of selectors) {
      if (
        selector.some(
          (s) => s.type === SelectorType.Attribute && s.name !== 'id' && s.name !== 'class'
        )
      ) {
        return true;
      }
    }

    return false;
  },
  'Chaining selectors': (selectors: CSSWhat.Selector[][]) => {
    for (const selector of selectors) {
      if (
        selector.filter((s) => s.type === SelectorType.Attribute && s.name === 'class').length >= 2
      ) {
        return true;
      }
    }

    return false;
  },
  'Child combinator': (selectors: CSSWhat.Selector[][]) => {
    for (const selector of selectors) {
      if (selector.some((s) => s.type === SelectorType.Child)) return true;
    }

    return false;
  },
  'Class selector': (selectors: CSSWhat.Selector[][]) => {
    for (const selector of selectors) {
      if (selector.some((s) => s.type === SelectorType.Attribute && s.name === 'class')) {
        return true;
      }
    }

    return false;
  },
  'Descendant combinator': (selectors: CSSWhat.Selector[][]) => {
    for (const selector of selectors) {
      if (selector.some((s) => s.type === SelectorType.Descendant)) return true;
    }

    return false;
  },
  'General sibling combinator': (selectors: CSSWhat.Selector[][]) => {
    for (const selector of selectors) {
      if (selector.some((s) => s.type === SelectorType.Sibling)) {
        return true;
      }
    }

    return false;
  },
  'Grouping selectors': (selectors: CSSWhat.Selector[][]) => selectors.length >= 2,
  'ID selector': (selectors: CSSWhat.Selector[][]) => {
    for (const selector of selectors) {
      if (selector.some((s) => s.type === SelectorType.Attribute && s.name === 'id')) {
        return true;
      }
    }

    return false;
  },
  'Type selector': (selectors: CSSWhat.Selector[][]) => {
    for (const selector of selectors) {
      if (selector.some((s) => s.type === SelectorType.Tag)) return true;
    }

    return false;
  },
  'Universal selector *': (selectors: CSSWhat.Selector[][]) => {
    for (const selector of selectors) {
      if (selector.some((s) => s.type === SelectorType.Universal)) {
        return true;
      }
    }

    return false;
  }
};

export const psuedoSelectorTitles = fromTitleEntries<string>(
  keys.map((title) => {
    if (!title.startsWith(':')) return void 0;

    return { title, value: title };
  })
);

export const selectorTitles = fromTitleEntries<SelectorDetector>(
  keys.map((title) => {
    if (selectorDetectorsMap[title] === void 0) return void 0;

    return { title, value: selectorDetectorsMap[title] };
  })
);

export const getMatchingSelectorTitles = ({ selector }: { selector: string }) => {
  const parsedSelectors = CSSWhat.parse(selector);
  return getTitleMatches(selectorTitles, selector, (tester) => tester(parsedSelectors));
};

export const getMatchingPseudoSelectorTitles = ({ selector }: { selector: string }) =>
  getTitleMatches(psuedoSelectorTitles, selector);
