[![libera manifesto](https://img.shields.io/badge/libera-manifesto-lightgrey.svg)](https://liberamanifesto.com)

# caniemail

Check HTML and CSS Feature Support for Email Clients from [caniemail.com](https://caniemail.com)

## Requirements

The packages requires an [LTS](https://github.com/nodejs/Release) Node version (v20.19.0+)

## Installation

Install the package from npm using your favourite package manager:

```shell
pnpm add caniemail
# bun add caniemail
# yarn add caniemail
# npm add caniemail
```

## Exports

### caniemail(html, options)

Returns:

```typescript
interface CanIEmailResult {
  issues: FeatureIssues;
  success: boolean;
}
```

#### `options`

Type: `CanIEmailOptions`

```typescript
interface CanIEmailOptions {
  /**
    An array of client names or globs to match email clients.
    Example: ['gmail.android', 'outlook.*', '*.ios']
  */
  clients: EmailClientGlobs[];
  css?: string;
  html?: string;
}
```

##### `clients`

Type: `EmailClientGlobs[]`<br>
Required: `true`

An array of globs for matching email clients to be checked against CanIEmail data. For more information about the glob syntax that is used, refer to the [micromatch](https://www.npmjs.com/package/micromatch) documentation.

To match all clients, pass `['*']`.

Possible email clients:

```javascript
[
  'apple-mail.macos',
  'apple-mail.ios',
  'gmail.desktop-webmail',
  'gmail.ios',
  'gmail.android',
  'gmail.mobile-webmail',
  'orange.desktop-webmail',
  'orange.ios',
  'orange.android',
  'outlook.windows',
  'outlook.windows-mail',
  'outlook.macos',
  'outlook.ios',
  'outlook.android',
  'yahoo.desktop-webmail',
  'yahoo.ios',
  'yahoo.android',
  'aol.desktop-webmail',
  'aol.ios',
  'aol.android',
  'samsung-email.android',
  'sfr.desktop-webmail',
  'sfr.ios',
  'sfr.android',
  'thunderbird.macos',
  'protonmail.desktop-webmail',
  'protonmail.ios',
  'protonmail.android',
  'hey.desktop-webmail',
  'mail-ru.desktop-webmail',
  'fastmail.desktop-webmail',
  'laposte.desktop-webmail'
];
```

Example: `["gmail.*", "*.desktop-webmail"]`

##### `css`

Type: `string`<br>
Required: `false`

CSS string to analyze for email client compatibility.

##### `html`

Type: `string`<br>
Required: `false`

HTML string to analyze for email client compatibility.

_Note: At least one of `css` or `html` must be provided._

### `formatIssue(options)`

Returns:

```typescript
{
  message: string;
  notes: string[];
}
```

#### `options`

Type:

```typescript
interface FormatIssueOptions {
  client: EmailClient;
  issue: FeatureIssue;
  issueType: 'error' | 'warning';
}
```

##### `client`

Type: `EmailClient`<br>
Required: `true`

The email client to format the issue for.

##### `issue`

Type: `FeatureIssue`<br>
Required: `true`

The feature issue to format.

##### `issueType`

Type: `'error' | 'warning'`<br>
Required: `true`

The type of issue being formatted. Determines the formatting of the message.

## Contributing, Working With This Repo

We 💛 contributions! After all, this is a community-driven project. We have no corporate sponsorship or backing. The maintainers and users keep this project going!

Please check out our [Contribution Guide](./CONTRIBUTING.md).

## License

[MIT License](./LICENSE.md)
