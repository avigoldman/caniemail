[![libera manifesto](https://img.shields.io/badge/libera-manifesto-lightgrey.svg)](https://liberamanifesto.com)

# caniemail

Check HTML and CSS Feature Support for Email Clients from [caniemail.com](https://caniemail.com)

## Installation

Install the package from npm using your favourite package manager:

```shell
pnpm add caniemail
# yarn add caniemail
# npm add caniemail
```

## Exports

### caniemail(html, options)

#### html

Type: `string`

The HTML that represents the email.

#### options

##### clients

Type: `string[]`

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
