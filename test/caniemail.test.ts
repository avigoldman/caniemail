import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { outdent } from 'outdent';
import { describe, expect, test } from 'vitest';

import { caniemail } from '../dist/index.js';

describe('exports', () => {
  test('data', async () => {
    // @ts-ignore
    const json = await import('caniemail/caniemail.json');
    expect(json).toBeTruthy();
  });

  test('package.json', async () => {
    // @ts-ignore
    const json = await import('caniemail/package.json');
    expect(json).toBeTruthy();
  });

  test('caniemail', async () => {
    // @ts-ignore
    const caniemail = await import('caniemail');
    expect(caniemail).toBeTruthy();
  });
});

describe('check() works', () => {
  test('works with blank email template', () => {
    const code = outdent`
    <!doctype html>
    <html>
      <body>
      </body>
    </html>
  `;
    const result = caniemail({ clients: ['gmail.*'], html: code });
    expect(result.success).toEqual(true);
    expect(result).toMatchSnapshot();
  });

  test('parses CSS', () => {
    const code = `.test { background-color: orange; width: 1rem; }`;
    const result = caniemail({ clients: ['gmail.*', 'outlook.windows'], css: code });
    expect(result).toMatchSnapshot();
  });

  test('parses inline CSS', () => {
    const code = outdent`
    <!doctype html>
    <html>
      <body>
        <div style='background-color: orange'></div>
      </body>
    </html>
  `;
    const result = caniemail({ clients: ['gmail.*'], html: code });
    expect(result.success).toEqual(true);
    expect(result).toMatchSnapshot();
  });

  test('should fail on unsupported <style> features', () => {
    // `filter` isn't supported by gmail.desktop-webmail: https://www.caniemail.com/features/css-filter/
    const code = outdent`
    <!doctype html>
    <html>
      <head>
        <style>
          .container {
            filter: blur(50%);
          }
        </style>
      </head>
      <body>
        <div class='container' style='background-color: orange'></div>
      </body>
    </html>
  `;
    const result = caniemail({ clients: ['gmail.desktop-webmail'], html: code });
    expect(result.success).toEqual(false);
    expect(result).toMatchSnapshot();
  });

  test('should fail on unsupported inline-style features, only css', () => {
    // `flex-direction: column` isn't supported by Gmail: https://www.caniemail.com/features/css-flex-direction/
    const code = `.test { flex-direction: column }`;
    const result = caniemail({ clients: ['gmail.desktop-webmail'], css: code });
    expect(result.success).toEqual(false);
    expect(result).toMatchSnapshot();
  });

  test('should fail on unsupported inline-style features', () => {
    // `flex-direction: column` isn't supported by Gmail: https://www.caniemail.com/features/css-flex-direction/
    const code = outdent`
    <!doctype html>
    <html>
      <body>
        <div style='flex-direction: column'></div>
      </body>
    </html>
  `;
    const result = caniemail({ clients: ['gmail.desktop-webmail'], html: code });
    expect(result.success).toEqual(false);
    expect(result).toMatchSnapshot();
  });

  test('should work with selectors', () => {
    // Desktop webmail supports most selectors
    const code = outdent`
    <!doctype html>
    <html>
      <head>
        <style>
          div > a#linkId[href="https://google.com"].link {}
          * { box-sizing: border-box }
        </style>
      </head>
      <body>
        <div>
          <a id='linkId' class='link' href='https://google.com'></div>
        </div>
      </body>
    </html>
  `;
    const result = caniemail({ clients: ['gmail.desktop-webmail'], html: code });
    expect(result.success).toEqual(true);
    expect(result).toMatchSnapshot();
  });

  test('should fail with unsupported element-attribute pairs', () => {
    {
      // iOS Gmail does not support local anchors: https://www.caniemail.com/features/html-anchor-links/
      const code = outdent`
      <!doctype html>
      <html>
        <body>
          <div>
            <div id='header'>Header</div>
            <a href='#header'></div>
          </div>
        </body>
      </html>
    `;
      const result = caniemail({ clients: ['gmail.ios'], html: code });
      expect(result.success).toEqual(false);
      expect(result).toMatchSnapshot();
    }

    {
      // Outlook windows doesn't support `display: flex`: https://www.caniemail.com/features/css-display-flex/
      const code = outdent`
      <div style='display: flex'>
        <div>Hello,</div>
        <div>world!</div>
      </div>
    `;
      const result = caniemail({ clients: ['outlook.windows'], html: code });
      expect(result.success).toEqual(false);
      expect(result).toMatchSnapshot();
    }
  });

  test('works with empty styles', () => {
    // iOS Gmail does not support local anchors: https://www.caniemail.com/features/html-anchor-links/
    const code = outdent`
    <style></style>
    <div style=''></div>
  `;
    const result = caniemail({ clients: ['gmail.ios'], html: code });
    expect(result.success).toEqual(true);
    expect(result).toMatchSnapshot();
  });

  test('fails with unsupported class selectors', () => {
    // iOS webmail does not support class selectors: https://www.caniemail.com/features/html-anchor-links/
    const code = outdent`
    <style>
     .a {}
    </style>
    <div class='a'></div>
  `;
    const result = caniemail({ clients: ['gmail.mobile-webmail'], html: code });
    expect(result.success).toEqual(false);
    expect(result).toMatchSnapshot();
  });

  test('checks content with rem unit', () => {
    // iOS webmail does not support class selectors: https://www.caniemail.com/features/html-anchor-links/
    const code = outdent`
    <style>
      .a { width: 1rem; }
    </style>
    <div class='a'></div>
  `;
    const result = caniemail({ clients: ['outlook.windows'], html: code });
    expect(result.success).toEqual(false);
    expect(result).toMatchSnapshot();
  });
});

describe('check() file', () => {
  test('fixture html file', async () => {
    const html = await readFile(join(__dirname, './fixtures/email.html'), 'utf8');
    const clients = ['apple-mail.*', 'gmail.*', 'outlook.*', 'protonmail.*', 'hey.*', 'fastmail.*'];
    const results = caniemail({ clients: clients as any, html });

    expect(results).toMatchSnapshot();
  });
});
