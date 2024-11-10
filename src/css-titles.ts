/* eslint-disable func-names */

import { getFeatures } from './features';
import { fromTitleEntries, getTitleMatches } from './helpers';

const features = getFeatures().css;
const keys = [...features.keys()];
const propertyNameRegex = /^[a-z-]+$/;

export const atRuleTitles = fromTitleEntries<string>(
  keys.map((title) => {
    if (!title.startsWith('@')) return void 0;

    return { title, value: title.replace(/^@/, '') };
  })
);

export const functionTitles = fromTitleEntries</* function name */ string>(
  keys.map((title) => {
    if (title.startsWith(':')) return void 0;

    if (title === 'CSS Variables (Custom Properties)') {
      return {
        title,
        value: 'var'
      };
    }

    if (!title.includes('()')) return void 0;

    const matches = /([a-z-]+)\(\)/.exec(title);
    if (matches === null) {
      throw new Error(`Could not determine function name in ${title}`);
    }

    return { title, value: matches[1] };
  })
);

export const keywordTitles = fromTitleEntries<string>(
  keys.map((title) => {
    if (!title.includes(' keyword')) return void 0;

    return {
      title,
      value: title.replace(/ keyword$/, '')
    };
  })
);

export const propertyValuePairTitles = fromTitleEntries<
  readonly [/* property */ string, /* value */ string]
>(
  keys.map((title) => {
    const matches = /([a-z-]+):\s*([a-z-]+)/.exec(title);
    if (matches === null) return void 0;

    return { title, value: [matches[1], matches[2]] as const };
  })
);

// Map of property titles to the properties they support
export const propertyTitles = fromTitleEntries<string[]>(
  keys.map((title) => {
    if (title === 'left, right, top, bottom') {
      return {
        title,
        value: ['left', 'right', 'top', 'bottom']
      };
    }

    const trimmedTitle = title
      .trim()
      .replace(/ shorthand$/, '')
      .replace(/ property$/, '');

    if (propertyNameRegex.test(trimmedTitle)) return { title, value: [trimmedTitle] };

    return void 0;
  })
);

export const unitTitles = fromTitleEntries<string>(
  keys.map((title) => {
    if (!title.endsWith(' unit')) return void 0;

    return { title, value: title.replace(/ unit$/, '') };
  })
);

export const getMatchingPropertyValuePairTitles = ({
  propertyName,
  propertyValue
}: {
  propertyName: string;
  propertyValue: string;
}): string[] =>
  getTitleMatches(
    propertyValuePairTitles,
    '',
    (value) => value[0] === propertyName && value[1] === propertyValue
  );

export const getMatchingAtRuleTitles = ({ atRules }: { atRules: string[] }) =>
  getTitleMatches(atRuleTitles, atRules);

export const getMatchingFunctionTitles = ({ propertyValue }: { propertyValue: string }) => {
  const matchingFunctionNames: string[] = [];

  // Match `<function>(` (e.g. `max(`, `calc(`)
  const valueFunctionNames = new Set(
    [...propertyValue.matchAll(/([a-z-]+)\(/g)].map((match) => match[1])
  );

  for (const [functionName, functionTitle] of Object.entries(functionTitles)) {
    if (valueFunctionNames.has(functionName)) {
      matchingFunctionNames.push(functionTitle);
    }

    valueFunctionNames.delete(functionName);
  }

  return matchingFunctionNames;
};

export const getMatchingKeywordTitles = ({ propertyValue }: { propertyValue: string }) =>
  getTitleMatches(keywordTitles, propertyValue);

export const getMatchingPropertyTitles = ({ propertyName }: { propertyName: string }): string[] =>
  getTitleMatches(propertyTitles, propertyName);

export const getMatchingUnitTitles = ({ propertyValue }: { propertyValue: string }) =>
  getTitleMatches(unitTitles, propertyValue, (value) => {
    if (value === 'initial') {
      return /\binitial\b/.test(propertyValue);
    }
    return new RegExp(`\\d${value}`).test(propertyValue);
  });
