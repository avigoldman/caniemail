import type { CssStylesheetAST } from '@adobe/css-tools';

import {
  getMatchingAtRuleTitles,
  getMatchingFunctionTitles,
  getMatchingKeywordTitles,
  getMatchingPropertyTitles,
  getMatchingPropertyValuePairTitles,
  getMatchingUnitTitles
} from '../css-titles.js';
import { type Position, getFeatures } from '../features.js';
import { getMatchingPseudoSelectorTitles, getMatchingSelectorTitles } from '../selectors.js';

import { type BaseCheckArgs, adjustPosition } from './check-base.js';
import { checkFeatures } from './check-features.js';

interface CheckDeclarationsArgs extends BaseCheckArgs {
  declarations: Array<{
    property: string;
    value: string;
    position?: Position;
  }>;
  offset?: {
    line: number;
    column: number;
  };
}

interface CheckSelectorsArgs extends BaseCheckArgs {
  selectors: string[];
  position?: Position;
  offset?: {
    line: number;
    column: number;
  };
}

interface CheckStylesheetArgs extends BaseCheckArgs {
  stylesheet: CssStylesheetAST;
  offset?: {
    line: number;
    column: number;
  };
}

const atRules = new Set([
  'charset',
  'custom-media',
  'document',
  'font-face',
  'host',
  'import',
  'keyframes',
  'keyframe',
  'media',
  'namespace',
  'page',
  'supports'
]);

export const checkDeclarations = ({
  clients,
  declarations,
  issues,
  offset
}: CheckDeclarationsArgs) => {
  const { css: features } = getFeatures();

  for (const declaration of declarations) {
    const { property: propertyName, value: propertyValue, position } = declaration;
    const adjustedPosition = adjustPosition(position, offset);

    if (propertyName !== void 0 && features.get(propertyName) !== void 0) {
      const propertyTitles = getMatchingPropertyTitles({ propertyName });
      checkFeatures({ clients, issues, titles: propertyTitles, position: adjustedPosition });
    }

    if (propertyValue !== void 0) {
      const functionTitles = getMatchingFunctionTitles({ propertyValue });
      const keywordTitles = getMatchingKeywordTitles({ propertyValue });
      const unitTitles = getMatchingUnitTitles({ propertyValue });

      checkFeatures({ clients, issues, titles: functionTitles, position: adjustedPosition });
      checkFeatures({ clients, issues, titles: keywordTitles, position: adjustedPosition });
      checkFeatures({ clients, issues, titles: unitTitles, position: adjustedPosition });
    }

    if (propertyName !== void 0 && propertyValue !== void 0) {
      const propertyValuePairTitles = getMatchingPropertyValuePairTitles({
        propertyName,
        propertyValue
      });
      checkFeatures({
        clients,
        issues,
        titles: propertyValuePairTitles,
        position: adjustedPosition
      });
    }
  }
};

const checkSelectors = ({ clients, issues, selectors, position, offset }: CheckSelectorsArgs) => {
  const adjustedPosition = adjustPosition(position, offset);

  for (const selector of selectors) {
    const pseudoSelectorTitles = getMatchingPseudoSelectorTitles({ selector });
    const selectorTitles = getMatchingSelectorTitles({ selector });

    checkFeatures({ clients, issues, titles: pseudoSelectorTitles, position: adjustedPosition });
    checkFeatures({ clients, issues, titles: selectorTitles, position: adjustedPosition });
  }
};

export const checkStylesheet = ({ clients, issues, stylesheet, offset }: CheckStylesheetArgs) => {
  const matchedAtRules: string[] = [];
  for (const stylesheetRule of stylesheet.stylesheet?.rules ?? []) {
    if (stylesheetRule.type === 'rule') {
      const rule = stylesheetRule;
      const declarations = (rule.declarations ?? [])
        .filter((declaration) => declaration.type !== 'comment')
        .map((declaration) => ({
          property: declaration.property,
          value: declaration.value,
          position: declaration.position ? { ...declaration.position } : undefined
        }));

      checkDeclarations({ clients, declarations, issues, offset });
      checkSelectors({
        clients,
        issues,
        selectors: rule.selectors ?? [],
        position: rule.position ? { ...rule.position } : undefined,
        offset
      });
    }

    if (atRules.has(stylesheetRule.type)) {
      matchedAtRules.push(stylesheetRule.type);
    }
  }

  const atRuleTitles = getMatchingAtRuleTitles({ atRules: matchedAtRules });
  checkFeatures({ clients, issues, titles: atRuleTitles });
};
