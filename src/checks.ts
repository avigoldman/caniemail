import type { CssStylesheetAST } from '@adobe/css-tools';
import type { Document, Element } from 'domhandler';
import { getProperty } from 'dot-prop';
import { ElementType } from 'htmlparser2';
import styleToObject from 'style-to-object';

import { getSupportType, type EmailClient } from './clients.js';
import {
  getMatchingAtRuleTitles,
  getMatchingFunctionTitles,
  getMatchingKeywordTitles,
  getMatchingPropertyTitles,
  getMatchingPropertyValuePairTitles,
  getMatchingUnitTitles
} from './css-titles.js';
import { getFeatures, type FeatureIssues } from './features.js';
import {
  getMatchingAttributeTitles,
  getMatchingElementAttributePairTitles,
  getMatchingElementTitles
} from './html-titles.js';
import { getMatchingPseudoSelectorTitles, getMatchingSelectorTitles } from './selectors.js';

interface BaseCheckArgs {
  clients: EmailClient[];
  issues: FeatureIssues;
}

interface CheckDeclarationsArgs extends BaseCheckArgs {
  declarations: Array<{ property: string; value: string }>;
}

interface CheckHtmlArgs extends BaseCheckArgs {
  document: Document;
}

interface CheckHtmlNodeArgs extends BaseCheckArgs {
  node: Element;
}

interface CheckFeaturesArgs extends BaseCheckArgs {
  titles: string | string[];
}

interface CheckSelectorsArgs extends BaseCheckArgs {
  selectors: string[];
}

interface CheckStylesheetArgs extends BaseCheckArgs {
  stylesheet: CssStylesheetAST;
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

const checkFeatures = ({ clients, issues, titles }: CheckFeaturesArgs) => {
  const { all: features } = getFeatures();

  for (const title of [titles].flat()) {
    for (const client of clients) {
      const feature = features.get(title);

      if (feature === void 0) throw new RangeError(`Feature \`${title}\` not found.`);

      const { stats } = feature;
      const supportMap = getProperty(stats, client);

      if (supportMap === void 0) {
        throw new RangeError(`Feature \`${title}\` not found on \`${client}\`.`);
      }

      const supportStatus = getSupportType(supportMap);
      const notes = (supportStatus.noteNumbers ?? []).map(
        (noteNumber) => feature.notes_by_num![String(noteNumber)]
      );

      if (supportStatus.type === 'none') {
        issues.errors.set(client, { notes, title });
      } else if (supportStatus.type === 'partial') {
        issues.warnings.set(client, { notes, title });
      }
    }
  }
};

const checkDeclarations = ({ clients, declarations, issues }: CheckDeclarationsArgs) => {
  const { css: features } = getFeatures();

  for (const declaration of declarations) {
    const { property: propertyName, value: propertyValue } = declaration;

    // Check that the property name is supported
    if (propertyName !== void 0 && features.get(propertyName) !== void 0) {
      const propertyTitles = getMatchingPropertyTitles({ propertyName });
      checkFeatures({ clients, issues, titles: propertyTitles });
    }

    // Check that the units and functions in the property value are supported
    if (propertyValue !== void 0) {
      const functionTitles = getMatchingFunctionTitles({ propertyValue });
      const keywordTitles = getMatchingKeywordTitles({ propertyValue });
      const unitTitles = getMatchingUnitTitles({ propertyValue });

      checkFeatures({ clients, issues, titles: functionTitles });
      checkFeatures({ clients, issues, titles: keywordTitles });
      checkFeatures({ clients, issues, titles: unitTitles });
    }

    // Check that the property name + value pair is supported
    if (propertyName !== void 0 && propertyValue !== void 0) {
      const propertyValuePairTitles = getMatchingPropertyValuePairTitles({
        propertyName,
        propertyValue
      });
      checkFeatures({ clients, issues, titles: propertyValuePairTitles });
    }
  }
};

const checkSelectors = ({ clients, issues, selectors }: CheckSelectorsArgs) => {
  for (const selector of selectors) {
    const pseudoSelectorTitles = getMatchingPseudoSelectorTitles({ selector });
    const mselectorTitles = getMatchingSelectorTitles({ selector });

    checkFeatures({ clients, issues, titles: pseudoSelectorTitles });
    checkFeatures({ clients, issues, titles: mselectorTitles });
  }
};

export const checkStylesheet = ({ clients, issues, stylesheet }: CheckStylesheetArgs) => {
  const matchedAtRules: string[] = [];
  for (const stylesheetRule of stylesheet.stylesheet?.rules ?? []) {
    if (stylesheetRule.type === 'rule') {
      const rule = stylesheetRule;
      const declarations = (rule.declarations ?? [])
        .filter((declaration) => declaration.type !== 'comment')
        .map((declaration) => {
          return {
            property: declaration.property,
            value: declaration.value
          };
        });

      checkDeclarations({ clients, declarations, issues });
      checkSelectors({ clients, issues, selectors: rule.selectors ?? [] });
    }

    if (atRules.has(stylesheetRule.type)) {
      matchedAtRules.push(stylesheetRule.type);
    }
  }

  const atRuleTitles = getMatchingAtRuleTitles({ atRules: matchedAtRules });

  checkFeatures({ clients, issues, titles: atRuleTitles });
};

const checkHtmlNode = ({ clients, issues, node }: CheckHtmlNodeArgs) => {
  const elementTitles = getMatchingElementTitles({ tagName: node.tagName });

  checkFeatures({ clients, issues, titles: elementTitles });

  if (node.attributes !== void 0) {
    const elementAttributePairTitles = getMatchingElementAttributePairTitles({
      attributes: Object.fromEntries(node.attributes.map((attr) => [attr.name, attr.value])),
      tagName: node.tagName
    });
    const attributeTitles = getMatchingAttributeTitles({
      attributes: node.attributes.map((attr) => attr.name)
    });

    checkFeatures({ clients, issues, titles: attributeTitles });
    checkFeatures({ clients, issues, titles: elementAttributePairTitles });

    // Check inline styles
    const styleAttr = node.attributes.find((attr) => attr.name === 'style');
    if (styleAttr !== void 0) {
      const styleObject = ((styleToObject as any).default ?? styleToObject)(styleAttr.value);
      if (styleObject !== null) {
        const declarations = Object.entries(styleObject).map(
          ([property, value]) => ({ property, value }) as any
        );
        checkDeclarations({ clients, declarations, issues });
      }
    }
  }

  if ('childNodes' in node) {
    for (const childNode of node.childNodes) {
      if (childNode.type === ElementType.Tag) {
        checkHtmlNode({ clients, issues, node: childNode as Element });
      }
    }
  }
};

export const checkHtml = ({ clients, issues, document }: CheckHtmlArgs) => {
  for (const childNode of document.childNodes) {
    if (childNode.type === ElementType.Tag) {
      checkHtmlNode({ clients, issues, node: childNode as Element });
    }
  }
};
