import type { Document, Element } from 'domhandler';
import { ElementType } from 'htmlparser2';
import styleToObject from 'style-to-object';

import {
  getMatchingAttributeTitles,
  getMatchingElementAttributePairTitles,
  getMatchingElementTitles
} from '../html-titles.js';
import { LocationIndex } from '../location.js';

import { type BaseCheckArgs } from './check-base.js';
import { checkDeclarations } from './check-css.js';
import { checkFeatures } from './check-features.js';

interface CheckHtmlArgs extends BaseCheckArgs {
  document: Document;
  source: string;
}

interface CheckHtmlNodeArgs extends BaseCheckArgs {
  node: Element;
}

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

export const checkHtml = ({ clients, issues, document, source }: CheckHtmlArgs) => {
  const locationIndex = new LocationIndex(source);

  for (const childNode of document.childNodes) {
    if (childNode.type === ElementType.Tag) {
      checkHtmlNode({ clients, issues, node: childNode as Element, locationIndex });
    }
  }
};
