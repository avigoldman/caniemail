import type { EmailClient } from '../clients.js';
import type { FeatureIssues, Position } from '../features.js';

export interface BaseCheckArgs {
  clients: EmailClient[];
  issues: FeatureIssues;
}

export const adjustPosition = (
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
