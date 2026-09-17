# CONTRIBUTING

Kotahi is a manuscript submission system, based on the discontinued xpub-collabra project.
It is currently under development by [eLife Pathways](https://elifepathways.org/) and is being built with [Coko Server](https://github.com/Coko-Foundation/cokoserver). We welcome people of all kinds to join the community and contribute with knowledge, skills, expertise.

In order to contribute to Kotahi, you're expected to follow a few sensible guidelines.

## Discuss your contribution before you build

Please let us know about the contribution you plan to make before you start it. Either comment on a relevant existing issue, or open a new [issue](https://github.com/eLifePathways/Kotahi/issues) if you can't find an existing one. This helps us avoid duplicating effort and to ensure contributions are likely to be accepted.

For contributions made as discussions and suggestions, you can at any time open an RFC (request for comments) in our issue tracker.

## Branches

We maintain `main` as the production branch and tag it with release names, and `staging` as our development branch. If you wish to contribute to Kotahi then you need to make a branch off `staging` and then issue a pull request following this procedure:

- Create a user account on GitHub: https://github.com
- Clone master with `git clone git@github.com:eLifePathways/Kotahi.git`
- Create a new branch and work off of that. Please name the branch to sensibly identify which feature you are working on (preferably starting with the issue number). You can push the branch to GitHub at anytime.

## Getting your contributions merged

From your fork of Kotahi, generate a Pull Request from the GitHub interface targeting eLife Pathways' `staging` branch of Kotahi, and request a review from one of the Kotahi devs.

Before merging all PRs must fulfill the following rules:

1.  Before a PR can be merged, it must pass the tests and CI.
2.  Before a PR can be merged, it shouldn't reduce the test coverage.
3.  All PRs must have corresponding unit/migration/e2e tests.

## Conventional commits

We use conventional commits and verify that commit messages match the pattern, you can read more about it here: https://conventionalcommits.org/ and here: https://github.com/conventional-changelog-archived-repos/conventional-changelog-angular/blob/master/convention.md. You can use `yarn commit` to use a command-line tool that helps you with formatting your commit. 

