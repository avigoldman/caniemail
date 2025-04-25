## Contributing in this repository

We 💛 contributions! The rules for contributing to this org are few:

1. Don't be a jerk
1. Search issues before opening a new one
1. Lint and run tests locally before submitting a PR
1. Adhere to the code style the project has chosen

## Repo Info

The `caniemail` repository uses [`pnpm`](https://pnpm.io/). `pnpm` is used for package management in the repo. We also assume that you have Node.js installed.

### Getting Started

You'll want to get dependencies installed. Run the following command:

```console
$ pnpm install
```

And then make sure things are building:

```console
$ pnpm build
```

## Before Committing

1. Use at least Node.js v20.19.0 or higher. [NVM](https://github.com/creationix/nvm) can be handy for switching between Node versions.
1. Lint your changes via `pnpm lint`. Fix any errors and warnings before committing.
1. Format your changes via `pnpm format` before committing.
1. Test your changes via `pnpm test`. Pull Requests for features and bug fixes will only be approved and merged if they have passing tests.

## Submitting Code

Any code change should be submitted as a pull request. Our guidelines for Pull Requests:

- Please fill in our template in its entirety. Please don't reformat it or modify it
- The description should explain what the code does and give steps to execute it
- The pull request should also contain tests
- Before submitting your Pull Request, please lint your changes by running `pnpm lint` and `pnpm format` in the root directory
- If any checks fail for your Pull Request, please resolve them. Always feel free to ask for help if unable to resolve issues with checks

## Code Review Process

The bigger the pull request, the longer it will take to review and merge. Try to break down large pull requests in smaller chunks that are easier to review and merge.

It is also always helpful to have some context for your pull request. What was the purpose? Why does it matter to you? Does it resolve any known Github issues? Adding a line "resolves #&lt;issue number&gt;" (e.g. "resolves #23") to the description of your pull request or of a specific commit will automatically close this issue once the pull request is merged.
