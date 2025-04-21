import { describe, expect, test } from 'vitest';
import { FeatureMap, type FeatureIssue } from '../dist/features';
import { groupIssues, sortIssues, type IssueGroup } from '../dist/helpers';

describe('issue formatting', () => {
  test('groups single map of issues correctly', () => {
    const errors = new FeatureMap<FeatureIssue>();

    errors.set('outlook.windows', {
      title: 'Parse Error',
      position: { start: { line: 1, column: 10 }, end: { line: 1, column: 15 } },
      notes: ['Invalid syntax'],
      support: 'none'
    });
    errors.set('gmail.ios', {
      title: 'Parse Error',
      position: { start: { line: 1, column: 10 }, end: { line: 1, column: 15 } },
      notes: ['Invalid syntax'],
      support: 'none'
    });
    errors.set('yahoo.ios', {
      title: 'Parse Error',
      position: { start: { line: 2, column: 5 }, end: { line: 2, column: 10 } },
      notes: ['Different position, same title'],
      support: 'none'
    });

    const grouped = groupIssues(errors);

    expect(grouped).toHaveLength(2);
    expect(grouped).toMatchSnapshot();
  });

  test('sorts grouped issues correctly', () => {
    const unsortedIssues: IssueGroup[] = [
      // Line 5 issues
      {
        issue: {
          title: 'Late Error',
          position: { start: { line: 5, column: 15 }, end: { line: 5, column: 20 } },
          notes: [],
          support: 'none'
        },
        clients: ['yahoo.ios']
      },
      {
        issue: {
          title: 'Mid-Line Warning',
          position: { start: { line: 5, column: 8 }, end: { line: 5, column: 12 } },
          notes: [],
          support: 'partial'
        },
        clients: ['outlook.ios']
      },
      {
        issue: {
          title: 'Early Error',
          position: { start: { line: 5, column: 1 }, end: { line: 5, column: 5 } },
          notes: [],
          support: 'none'
        },
        clients: ['gmail.ios']
      },
      // Line 3 issues
      {
        issue: {
          title: 'Late Warning',
          position: { start: { line: 3, column: 20 }, end: { line: 3, column: 25 } },
          notes: [],
          support: 'partial'
        },
        clients: ['thunderbird.macos']
      },
      {
        issue: {
          title: 'Early Line 3',
          position: { start: { line: 3, column: 5 }, end: { line: 3, column: 10 } },
          notes: [],
          support: 'none'
        },
        clients: ['protonmail.ios']
      },
      // Line 8 issues
      {
        issue: {
          title: 'Very Late Warning',
          position: { start: { line: 8, column: 12 }, end: { line: 8, column: 15 } },
          notes: [],
          support: 'partial'
        },
        clients: ['apple-mail.ios']
      },
      // Line 1 issues
      {
        issue: {
          title: 'First Error',
          position: { start: { line: 1, column: 10 }, end: { line: 1, column: 15 } },
          notes: [],
          support: 'none'
        },
        clients: ['outlook.ios']
      },
      {
        issue: {
          title: 'First Warning',
          position: { start: { line: 1, column: 5 }, end: { line: 1, column: 8 } },
          notes: [],
          support: 'partial'
        },
        clients: ['gmail.ios']
      },
      // Line 7 issue
      {
        issue: {
          title: 'Lone Error',
          position: { start: { line: 7, column: 1 }, end: { line: 7, column: 5 } },
          notes: [],
          support: 'none'
        },
        clients: ['yahoo.ios']
      }
    ];

    const sorted = sortIssues(unsortedIssues);

    expect(
      sorted.map(
        ({ issue }) =>
          `${issue.support} ${issue.position!.start.line}:${issue.position!.start.column}`
      )
    ).toEqual([
      'partial 1:5',
      'none 1:10',
      'none 3:5',
      'partial 3:20',
      'none 5:1',
      'partial 5:8',
      'none 5:15',
      'none 7:1',
      'partial 8:12'
    ]);
  });
});
