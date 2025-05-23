import { getFeatures } from './features.js';
import { fromTitleEntries, getTitleMatches } from './helpers.js';

const features = getFeatures().html;
const keys = [...features.keys()];

export const attributeTitles = fromTitleEntries<string[]>(
  keys.map((title) => {
    if (title === 'srcset and sizes attributes') {
      return {
        title,
        value: ['srcset', 'sizes']
      };
    }

    if (!title.endsWith('attribute')) return void 0;

    return {
      title,
      value: [title.replace(/ attribute$/, '')]
    };
  })
);

export const elementAttributePairTitles = fromTitleEntries<{
  attributes: Array<string | [string, RegExp | string]>;
  // Can match any of these
  element: string;
}>(
  keys.map((title) => {
    if (title === 'Local anchors') {
      return {
        title,
        value: {
          attributes: [['href', /^#/], 'name'],
          element: 'a'
        }
      };
    }

    if (title === 'mailto: links') {
      return {
        title,
        value: {
          attributes: [['href', /^mailto:/]],
          element: 'a'
        }
      };
    }

    if (title === 'AMP for Email') {
      return {
        title,
        value: {
          attributes: ['⚡4email', 'amp4email'],
          element: 'html'
        }
      };
    }

    const attributePairMatch = /<(\w+) (\w+)="(\w+)"> element/.exec(title);
    if (attributePairMatch === null) return void 0;

    return {
      title,
      value: {
        attributes: [[attributePairMatch[2], attributePairMatch[3]]],
        element: attributePairMatch[1]
      }
    };
  })
);

// Map of property titles to the properties they support
export const elementTitles = fromTitleEntries<string[]>(
  keys.map((title) => {
    if (title === 'address') {
      return { title, value: ['address'] };
    }

    if (title === 'HTML5 doctype') {
      return { title, value: ['!doctype html'] };
    }

    if (title === 'HTML5 semantics') {
      return {
        title,
        value: [
          'article',
          'aside',
          'details',
          'figcaption',
          'figure',
          'footer',
          'header',
          'main',
          'mark',
          'nav',
          'section',
          'summary',
          'time'
        ]
      };
    }

    if (title === 'Image maps') {
      return { title, value: ['map'] };
    }

    if (title === 'Embedded <svg> image') {
      return { title, value: ['image'] };
    }

    const htmlMatches = /<(\w+)>/.exec(title);
    if (htmlMatches === null) return void 0;

    return {
      title,
      value: [htmlMatches[1]]
    };
  })
);

export const getMatchingElementTitles = ({ tagName }: { tagName: string }) =>
  getTitleMatches(elementTitles, tagName);

// TODO: test this
export const getMatchingAttributeTitles = ({ attributes }: { attributes: string[] }) =>
  getTitleMatches(attributeTitles, attributes, (values) =>
    values.some((attribute: any) => attributes.includes(attribute))
  );

export const getMatchingElementAttributePairTitles = ({
  tagName,
  attributes
}: {
  attributes: Record<string, string>;
  tagName: string;
}) => {
  const matchingElementAttributePairTitles: string[] = [];

  for (const [elementAttributePairTitle, elementAttributePairValues] of Object.entries(
    elementAttributePairTitles
  )) {
    // Don't bother trying to match if the elements aren't even equal
    // eslint-disable-next-line no-continue
    if (elementAttributePairValues.element !== tagName) continue;

    for (const attributeMatcher of elementAttributePairValues.attributes) {
      // If the attribute matcher is a string, we just check whether the element contains the attribute name
      if (
        typeof attributeMatcher === 'string' &&
        Object.keys(attributes).includes(attributeMatcher)
      ) {
        matchingElementAttributePairTitles.push(elementAttributePairTitle);
      }
      // If the attribute matcher is an array, we check each attribute name against an expected attribute value
      else if (Array.isArray(attributeMatcher)) {
        const [attributeName, attributeValue] = attributeMatcher;

        // If the attribute doesn't even exist, try checking the next attribute
        // eslint-disable-next-line no-continue
        if (attributes[attributeName] === void 0) continue;

        // If the attribute to match is a string, we check for equality
        if (typeof attributeValue === 'string' && attributes[attributeName] === attributeValue) {
          matchingElementAttributePairTitles.push(elementAttributePairTitle);
        }
        // If the attribute to match is a regex, we check if the regex matches
        else if (
          attributeValue instanceof RegExp &&
          attributeValue.test(attributes[attributeName])
        ) {
          matchingElementAttributePairTitles.push(elementAttributePairTitle);
        }
      }
    }
  }

  return matchingElementAttributePairTitles;
};
