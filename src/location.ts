import binarySearch from 'binary-search';
import splitLines from 'split-lines';

export interface Position {
  start: { line: number; column: number };
  end: { line: number; column: number };
}

export class LocationIndex {
  private readonly _lineStartEndTriples: Array<[number, number, number]>;
  private readonly _stringLength: number;

  constructor(source: string) {
    // Ensure newline termination for consistency
    if (source[source.length - 1] !== '\n') {
      source += '\n';
    }

    this._stringLength = source.length;
    this._lineStartEndTriples = [];

    // Get lines with their endings preserved
    const lines = splitLines(source, { preserveNewlines: true });
    let currentPos = 0;

    // Build index in a single pass through the pre-split lines
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const lineLength = lines[lineIndex].length;
      this._lineStartEndTriples.push([lineIndex, currentPos, currentPos + lineLength]);
      currentPos += lineLength;
    }
  }

  locationOf(index: number): { line: number; column: number } | null {
    if (index < 0 || index >= this._stringLength) {
      return null;
    }

    const foundIndex = binarySearch(this._lineStartEndTriples, index, (triple, needle) => {
      if (needle < triple[1]) return 1;
      if (needle >= triple[2]) return -1;
      return 0;
    });

    // binarySearch returns negative when not found
    if (foundIndex < 0) return null;

    const triple = this._lineStartEndTriples[foundIndex];
    return {
      line: triple[0] + 1, // Convert to 1-based line numbers
      column: index - triple[1] + 1 // Convert to 1-based column numbers
    };
  }

  positionOf(startIndex: number, endIndex: number): Position | undefined {
    const start = this.locationOf(startIndex);
    const end = this.locationOf(endIndex);

    if (!start || !end) return undefined;

    return { start, end };
  }
}
