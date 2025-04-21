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
import { getFeatures, type FeatureIssue, type FeatureIssues, type Position } from './features.js';
import {
  getMatchingAttributeTitles,
  getMatchingElementAttributePairTitles,
  getMatchingElementTitles
} from './html-titles.js';
import { getMatchingPseudoSelectorTitles, getMatchingSelectorTitles } from './selectors.js';
import { LocationIndex } from './location.js';

interface BaseCheckArgs {
  clients: EmailClient[];
  issues: FeatureIssues;
}

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

interface CheckHtmlArgs extends BaseCheckArgs {
  document: Document;
  source: string;
}

interface CheckHtmlNodeArgs extends BaseCheckArgs {
  node: Element;
}

interface CheckFeaturesArgs extends BaseCheckArgs {
  titles: string | string[];
  position?: Position;
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

const adjustPosition = (
  position: Position | undefined,
  offset?: { line: number; column: number }
): Position | undefined => {
  if (!position || !offset) return position;

  return {
    start: {
      line: position.start.line + offset.line - 1,
      column:
        position.start.line === 1
          ? position.start.column + offset.column - 1
          : position.start.column
    },
    end: {
      line: position.end.line + offset.line - 1,
      column:
        position.end.line === 1 ? position.end.column + offset.column - 1 : position.end.column
    },
    ...(position.source && { source: position.source })
  };
};

const checkFeatures = ({ clients, issues, titles, position }: CheckFeaturesArgs) => {
  const { all: features } = getFeatures();

  for (const title of [titles].flat()) {
    for (const client of clients) {
      const feature = features.get(title);

      if (feature === void 0) throw new RangeError(`Feature "${title}" not found.`);

      const { stats } = feature;
      const supportMap = getProperty(stats, client);

      if (supportMap === void 0) {
        throw new RangeError(`Feature "${title}" not found on "${client}".`);
      }

      const supportStatus = getSupportType(supportMap);
      const notes = (supportStatus.noteNumbers ?? []).map(
        (noteNumber) => feature.notes_by_num![String(noteNumber)]
      );
      const support = supportStatus.type;

      const issue: FeatureIssue = {
        notes,
        title,
        position,
        support
      };

      if (support === 'none') {
        issues.errors.set(client, issue);
      } else if (support === 'partial') {
        issues.warnings.set(client, issue);
      }
    }
  }
};

const checkDeclarations = ({ clients, declarations, issues, offset }: CheckDeclarationsArgs) => {
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

const checkHtmlNode = ({
  clients,
  issues,
  node,
  locationIndex
}: CheckHtmlNodeArgs & { locationIndex: LocationIndex }) => {
  const elementTitles = getMatchingElementTitles({ tagName: node.tagName });
  const position =
    (node as any).sourceCodeLocation ||
    (node.startIndex !== null && node.endIndex !== null
      ? locationIndex.positionOf(node.startIndex, node.endIndex)
      : undefined);

  checkFeatures({ clients, issues, titles: elementTitles, position });

  if (node.attributes !== void 0) {
    const elementAttributePairTitles = getMatchingElementAttributePairTitles({
      attributes: Object.fromEntries(node.attributes.map((attr) => [attr.name, attr.value])),
      tagName: node.tagName
    });
    const attributeTitles = getMatchingAttributeTitles({
      attributes: node.attributes.map((attr) => attr.name)
    });

    checkFeatures({ clients, issues, titles: attributeTitles, position });
    checkFeatures({ clients, issues, titles: elementAttributePairTitles, position });

    const styleAttr = node.attributes.find((attr) => attr.name === 'style');
    if (styleAttr !== void 0) {
      const styleObject = ((styleToObject as any).default ?? styleToObject)(styleAttr.value);
      if (styleObject !== null) {
        // Get the style attribute location
        const attrLoc = (styleAttr as any).sourceCodeLocation;
        const offset = attrLoc
          ? {
              line: attrLoc.startLine,
              column: attrLoc.startCol + 'style="'.length
            }
          : undefined;

        const declarations = Object.entries(styleObject).map(([property, value]) => ({
          property,
          value: String(value),
          position
        }));
        checkDeclarations({ clients, declarations, issues, offset });
      }
    }
  }

  if ('childNodes' in node) {
    for (const childNode of node.childNodes) {
      if (childNode.type === ElementType.Tag || childNode.type === ElementType.Style) {
        checkHtmlNode({ clients, issues, node: childNode as Element, locationIndex });
      }
    }
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

export const checkHtml = ({ clients, issues, document, source }: CheckHtmlArgs) => {
  const locationIndex = new LocationIndex(source);

  for (const childNode of document.childNodes) {
    if (childNode.type === ElementType.Tag) {
      checkHtmlNode({ clients, issues, node: childNode as Element, locationIndex });
    }
  }
};
