# CONTRIBUTING

Kotahi is a manuscript submission system, based on the discontinued xpub-collabra project.
It is currently under development by [eLife Pathways](https://elifepathways.org/) and is being built with [Coko Server](https://github.com/Coko-Foundation/cokoserver). We welcome people of all kinds to join the community and contribute with knowledge, skills, expertise. Everyone is welcome in our chat room (https://mattermost.coko.foundation/coko/channels/town-square).

In order to contribute to Kotahi, you're expected to follow a few sensible guidelines.

## Discuss your contribution before you build

Please let us know about the contribution you plan to make before you start it. Either comment on a relevant existing issue, or open a new [issue](https://github.com/eLifePathways/Kotahi/issues) if you can't find an existing one. This helps us avoid duplicating effort and to ensure contributions are likely to be accepted. You can also ask in the chat room (https://mattermost.coko.foundation/coko/channels/kotahi) if you are unsure.

For contributions made as discussions and suggestions, you can at any time open an RFC (request for comments) in our issue tracker.

## Branches

We maintain main as the production branch and tag it with release names. If you wish to contribute to Kotahi then you need to make a branch and then issue a pull request following this procedure:

- Create a user account on GitHub: https://github.com
- Clone master with `git clone git@github.com:eLifePathways/Kotahi.git`
- Create a new branch and work off of that. Please name the branch to sensibly identify which feature you are working on (preferably starting with the issue number). You can push the branch to GitHub at anytime.

## Getting your contributions merged

This is a two part process, first ask for comments, then ask for the changes to be merged.

To ask for comments, generate a Pull Request from the GitHub interface but do not assign this request to anyone. You do this from the GitHub UI on your branch.
Look at the feedback and alter your branch as necessary.

To merge with master - generate a pull request. You do this from the GitHub UI on your branch.
We encourage feedback and discussion from as many people as possible on Pull Requests!

Before merging all PRs must fulfill these three simple rules:

1.  Before a PR can be merged, it must pass the tests and CI.
2.  Before a PR can be merged, it shouldn't reduce the test coverage.
3.  Bugfixes go in PRs and a bugfix PR shouldn't be merged without a regression test.

## Conventional commits

We use conventional commits and verify that commit messages match the pattern, you can read more about it here: https://conventionalcommits.org/ and here: https://github.com/conventional-changelog-archived-repos/conventional-changelog-angular/blob/master/convention.md. You can use `yarn cz` to use a command-line tool that helps you with formatting your commit. We use conventional commits so that we can automatically follow semantic versioning and generate a CHANGELOG.

## Bug reports, feature requests, support questions

This is all done through GitLab using their native issue tracker
Visit the master issue tracker for Kotahi (https://github.com/eLifePathways/Kotahi/issues)
Tag the issue with 'support', 'bug', or 'feature' to identify the nature of your issue
