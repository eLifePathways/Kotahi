# FAQ

### Flax content management system

Kotahi includes a microservice, Flax, which serves as a Content Management System (CMS) for Kotahi allowing publication of manuscripts, reviews and evaluations directly to a public-facing site.

Multiple Page Management: alongside the article and evaluation pages, you can add supporting pages such as "About Us", policy pages, contact information, etc, as well as configuring headers and footers for all pages. All this is configured from the CMS section on the Kotahi site.

The publication site's appearance, including color theme and layout, can be customized to your preferences.

The publication site will be built the first time you publish an article or any CMS page.

#### Configuring for Flax:

The following variables must be set in the `.env` file (`.env.example` provides sensible defaults for local development):

- `FLAX_EXPRESS_PORT`: e.g. 8082: a port number for the Express server.
- `FLAX_EXPRESS_HOST=kotahi-flax-site`: Typically this should not change, as it references the `kotahi-flax-site` docker container where the Express server resides.
- `FLAX_SITE_PORT`: e.g. 8081: the port for running the Flax site.
- `FLAX_CLIENT_ID`: choose a random ID
- `FLAX_CLIENT_SECRET`: choose a password
- `FLAX_CLIENT_API_URL`: The Kotahi site origin used by Flax to fetch data from Kotahi. Typically `http://client:4000` for local development.
- `FLAX_SITE_URL`: The desired origin for accessing and running the Flax site. For example, `http://localhost:8081` or `https://myflaxdomain.org`.

When configuring DNS for a production installation, Flax and Kotahi will need two separate DNS configurations. They can differ by subdomain, or you may choose to provide entirely separate domains for the two. Just ensure that `FLAX_SITE_URL` and `FLAX_CLIENT_API_URL` are set correspondingly.

Metadata (for SEO) can be set inside of Kotahi by going to **Settings > CMS > File browser**, then editing `kotahi/layouts/base.njk`.

### All I see is a "Recent publications" page with no publications. How do I login?

Click **Dashboard** in the upper right. You'll be taken to the login flow.

## Publishing

### How do I publish from Kotahi?

While Kotahi deals with importing, reviewing, editing and preproduction, the final step of publishing to the web (or to print) is relegated to other tools. A wide variety of tools exist for building a static website from structured data; you may wish to use Flax which is built expressly for this task.

Kotahi provides a GraphQL API for obtaining published article data; see [API](#api) below.

Kotahi can also be configured to trigger a webhook whenever an article is published, using the following environment variables:

- `PUBLISHING_WEBHOOK_URL` -- the location of the webhook
- `PUBLISHING_WEBHOOK_TOKEN` -- (optional) a token to pass to the webhook for authentication
- `PUBLISHING_WEBHOOK_REF` -- (optional) a reference to pass to the webhook instead of the manuscript ID

If `PUBLISHING_WEBHOOK_URL` is set, then every time you publish an article a POST request will be sent to the webhook, with variables `ref` and (if a token is configured) `token`. The ref will either be the published manuscript ID or the content of `PUBLISHING_WEBHOOK_REF` if that is set.

Using a tool like Flax, you can either:

- respond to every webhook request by requesting the relevant article from Kotahi and building (or rebuilding) its page (plus index pages); or
- periodically request all articles published after the date of the most recent article you've already received.

### Crossref

#### Registering a DOI for an article with Crossref

Crossref offers a paid service for indexing articles and registering DOIs. Kotahi can be configured to register articles with new DOIs upon publication. It can also be configured to register evaluations of articles. The following environment variables are needed:

```
JOURNAL_NAME="Your Journal Name"
JOURNAL_ABBREVIATED_NAME="AbbrvJournName"
JOURNAL_HOMEPAGE="http://yourjournal.com/"
CROSSREF_LOGIN=crossrefLogin
CROSSREF_PASSWORD=crossrefPassword
CROSSREF_REGISTRANT="Crossref Registrant Name"
CROSSREF_DEPOSITOR_NAME="Crossref Depositor Name"
CROSSREF_DEPOSITOR_EMAIL="depositor-email@yourjournal.com"
CROSSREF_PUBLICATION_TYPE=article
CROSSREF_USE_SANDBOX=true
DOI_PREFIX=12.34567
PUBLISHED_ARTICLE_LOCATION_PREFIX=http://yourjournal.com/article/
PUBLICATION_LICENSE_URL=https://creativecommons.org/licenses/by/4.0/
```

Crossref login, registrant and depositor information, as well as your organization-specific DOI prefix, should be organized with Crossref. In order to register an article's DOI, the article should be published to a public facing site (typically using Flax, above). The `PUBLISHED_ARTICLE_LOCATION_PREFIX` will be used to predict the published article's URL, by appending the article's `shortId` (manuscript number) to it. Flax (or your tool of choice) should be configured with this in mind.

For development and testing, `CROSSREF_USE_SANDBOX` should be true. This will send all requests to Crossref's test API. Note that you must request Crossref to give you access to the test API, for which a separate password may be issued.

If a submission to Crossref fails basic schema validation (e.g. if required fields are missing), Kotahi will report the failure beneath the "Publish" button. Success at this point does not guarantee that the submission will succeed once Crossref retrieves it from its queue for processing: it can still fail for reasons such as containing invalid DOI references, etc, _and this failure will not be reported by Kotahi_. You can view Crossref's queue and check whether a submission has succeeded via Crossref's submission administration dashboard at `https://doi.crossref.org/servlet/useragent` or `https://test.crossref.org/servlet/useragent`.

#### Form fields for publishing an article to Crossref

Registering an `article` DOI to Crossref on the publish action requires that you have certain fields configured via the form-builder. These are:

<!-- prettier-ignore -->
| Field type | Internal field name        | Purpose                                                                                                                              |
| ---------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Title      | `submission.$title`        | Article title                                                                                                                        |
| Authors    | `submission.$authors`      | Ordered list of authors                                                                                                              |
| Abstract   | `submission.$abstract`     | Article abstract                                                                                                                     |
| Rich text  | `submission.references`    | Citations in separate paragraphs                                                                                                     |
| Text       | `submission.$volumeNumber` | (Optional) Journal volume number                                                                                                     |
| Text       | `submission.$issueNumber`  | (Optional) Journal issue number                                                                                                      |
| Text       | `submission.$issueYear`    | The year of publication. If `submission.$volumeNumber` is formatted as a year (e.g. 2021), then `submission.$issueYear` is optional. |
| DOI suffix | `submission.$doiSuffix`    | (Optional) The custom DOI suffix for the article                                                                                     |

<!-- prettier-ignore -->
#### Registering peer review DOIs via Crossref

Register peer review DOIs for `journal` and `prc` archetypes. A `referee-report` will be deposited for individual review submissions (data captured in a Review form submission) and an `aggregate` report for editorial team submissions (data captured in a Decision form submission). On publish action a peer review component will be depoisted if;

1. It contains data (not blank); and
2. The review is not hidden; and
3. The field's publishing is set to "Always", or it is set to "Ad hoc" and the field has been manually ticked for publishing by an editor or group manager

#### Registering peer review DOIs via Crossref using a single form

Alternatively, you may be using Kotahi to publish evaluations of pre-existing articles. If this is your workflow, Kotahi can register these evaluations with Crossref, generating a DOI for each. The registering of peer views using a single form when using the `preprint1` or `preprint2` archhetype. The following environment variables are required for this:

```
CROSSREF_LOGIN=crossrefLogin
CROSSREF_PASSWORD=crossrefPassword
CROSSREF_REGISTRANT="Crossref Registrant Name"
CROSSREF_DEPOSITOR_NAME="Crossref Depositor Name"
CROSSREF_DEPOSITOR_EMAIL="depositor-email@yourjournal.com"
CROSSREF_PUBLICATION_TYPE=evaluations
CROSSREF_USE_SANDBOX=true
DOI_PREFIX=12.34567
```

And the following form fields are required:

| Field type | Field name                                                                                                                                                                                                       | Purpose                                                  |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| DOI        | `submission.$doi`                                                                                                                                                                                                | The DOI link to the article under review                 |
| Rich text  | `submission.review1`                                                                                                                                                                                             | Review number 1                                          |
| Text       | `submission.review1date`                                                                                                                                                                                         | Review 1 date, formatted as yyyy-mm-dd or mm/dd/yyyy     |
| Text       | `submission.review1creator`                                                                                                                                                                                      | Review 1 author, formatted as Firstname Lastname         |
| Text       | `submission.review1suffix`                                                                                                                                                                                       | (Optional) Review 1 custom DOI sufix                     |
| (As above) | `submission.review2`, `submission.review2date`, `submission.review2creator`, `submission.review2suffix`, `submission.review3`, `submission.review3date`, `submission.review3creator`, `submission.review3suffix` | (Optional) Fields for second and third reviews.          |
| (As above) | `submission.summary`, `submission.summarydate`, `submission.summarycreator`, `submission.summarysuffix`                                                                                                          | (Optional) Fields for a summary of the reviews.          |
| Title      | `submission.$title`                                                                                                                                                                                              | Title of the article under review, possibly abbreviated. |

### Registering article DOIs with Datacite

Datacite offers a paid service for indexing articles and registering DOIs. Kotahi can be configured to register articles with new DOIs upon publication. The following environment variables are needed:

| Field type           | Internal field name             | Purpose                                                              |
| -------------------- | ------------------------------- | -------------------------------------------------------------------- |
| \*Title              | submission.$title               | Article title                                                        |
| \*Creators           | submission.$authors             | Ordered list of authors                                              |
| Abstract             | submission.$abstract            | Article abstract                                                     |
| \*Resource Type      | submission.resourcetype         | Datacite Resource type                                               |
| TypeValue            | submission.ifother              | Datacite Type Value                                                  |
| rightsUri            | submission.localcontext         | Rights URI                                                           |
| rightsIdentifier     | submission.lcbadges             | Rights Badges                                                        |
| geoLocations         | submission.geolocation          | Geolocation                                                          |
| funderName           | submission.Funding              | Funder Name                                                          |
| funderIdentifierType | submission.funderIdentifierType | Funder Identifier Type                                               |
| awardNumber          | submission.awardnumber          | Award Number                                                         |
| awardTitle           | submission.awardtitle           | Award Title                                                          |
| awardUri             | submission.awarduri             | Award URI                                                            |
| \*DOI                | submission.$dois                | Multiple related DOIs (see 'retrieve citation styles from Datacite') |

Variables mapped to the Configuration>General page:

| Field type     | Internal field name         | Purpose                                  |
| -------------- | --------------------------- | ---------------------------------------- |
| \*Journal Name | config.groupIdentity.title  | Journal Name                             |
| ROR            | config.groupIdentity.rorUrl | Research Organization Registry (ROR) url |

Variables mapped to the Configuration>Integration and Publishing Endpoints page:

| Field type         | Internal field name                            | Purpose                                           |
| ------------------ | ---------------------------------------------- | ------------------------------------------------- |
| \*Username         | config.formData.publishing.datacite.login      | Datacite account username                         |
| \*Password         | config.formData.publishing.datacite.password   | Datacite account password                         |
| Publish to sandbox | config.formData.publishing.datacite.useSandbox | Enable publishing to sandbox for testing purposes |
| \*DOI Prefix       | config.formData.publishing.datacite.doiPrefix  | Datacite account prefix                           |

\*Indicates a minimum required metadata fields to register an article DOI with Datacite.

### Retrieve citations styles from Datacite;

If Configuration>Production>'Search and retrieve citation results from Datacite' setting is enabled then highlighting (annotating) text and applying the 'Reference' parser will display a Datacite result. These result can be mapped to `submission.$dois` and markup the `HasPart` relationship to `relatedIdentifiers`.

### Hypothesis

[Hypothesis](https://web.hypothes.is) is a tool for annotating webpages and sharing those annotations. It is powered by the hypothesis browser plugin, which displays annotations (retrieved from Hypothesis's servers) when you visit an annotated webpage. It allows evaluations of articles or other data to be shared (publicly or with a select group) directly on the page where the article lives. Kotahi supports publishing most form data as Hypothesis annotations.

To enable this, you will need to first [generate a personal API token](https://h.readthedocs.io/en/latest/api/authorization/#access-tokens) for Hypothesis, and a [group key](https://web.hypothes.is/blog/introducing-groups/) (e.g. `g4JPqbk5` if your group URL is `https://hypothes.is/groups/g4JPqbk5/my-journal-group`).

Using these keys, set the following `.env` variables:

```
HYPOTHESIS_API_KEY=<your API key here>
HYPOTHESIS_GROUP=<group key here>
HYPOTHESIS_ALLOW_TAGGING=true
```

Your submission form must also contain a 'Manuscript source URI' field (internal name `submission.$sourceUri`), which should contain the URL of the page to be annotated.

Once these preliminaries are in place, there are two approaches to publishing to Hypothesis. Both can be used at the same time:

#### Selecting individual fields to publish to Hypothesis

In the form-builder, you can choose fields of the submission and decision forms to be published to Hypothesis, by setting the "Include when sharing or publishing" option for those fields to "Always" (currently unavailable for SupplementaryFiles and VisualAbstract field types). This will cause each of those fields to be published as Hypothesis annotations when a manuscript is published. If you want Hypothesis to apply a tag to the annotation, this can be specified in the "Hypothesis tag" text box.

Alternatively, you may choose the "Ad hoc" option for a field, which will cause a "Publish" checkbox to appear next to that field in the Control page (in ThreadedDiscussion fields, each comment has its own separate checkbox). For any given manuscript, an editor must manually select that field (or comment) in order for it to publish to Hypothesis. They should select those they wish to publish, then hit the "Publish" button.

Each selected field or comment (if it is not empty) will be published as a separate Hypothesis annotation. An annotation can be updated or deleted by modifying the contents of the field or deselecting the "Publish" checkbox, and pressing the "Publish" button again.

##### Ordering of published annotations

Threaded discussion comments are published first, in date order; then submission form fields (in the order they appear in the form); then decision form fields (in the order they appear in the form).

This ordering can be overridden by adding `HYPOTHESIS_REVERSE_FIELD_ORDER=true` to the `.env` file. This will not change the ordering of threaded discussion comments, but will reverse the order of all other annotations. This is occasionally useful if you wish fields to appear with a top-to-bottom ordering within the context of a bottom-to-top chronological listing (e.g. if annotations will become TRiP listings).

Note that publishing of review fields to hypothes.is is not yet supported.

#### Publishing Hypothesis annotations with DocMaps

Alternatively (or as well), you can specify one or more Hypothesis annotations to create for each published manuscript, each containing whatever field or combination of fields you choose, by providing a file `config/journal/docmaps_scheme.json` on your server. This mechanism allows more complex selections of data to be published; furthermore, a [DocMap](https://docmaps.knowledgefutures.org/) will also be created at time of publishing, which can be retrieved using kotahi's public API (see below). An example file, [`config/journal/example_docmaps_scheme.json`](https://github.com/eLifePathways/Kotahi/blob/main/packages/server/config/journal/example_docmaps_scheme.json), is supplied.

The `docmaps_scheme.json` file specifies the _actions_ to perform when a manuscript is published, complete with participant information and directives to determine how the outputs are generated. Essentially, its structure is copied into the `actions` node of a full DocMap, expanding any templated values and replacing special directives with generated data.

Three special directives (with double-underscore prefix) may be present in each `output` node of the JSON. These are:

- `__contentVenues`: an array of venues to publish to. Currently only 'hypothesis' is supported.
- `__content`: a template string specifying the content (typically a data field or fields) to publish.
- `__tag` (optional): a tag (string) to apply to the annotation in Hypothesis.

[Handlebars](https://handlebarsjs.com/guide/) templates can be included in any string value in the `docmaps_scheme.json` file, to allow insertion of manuscript data. All fields from submission and decision forms can be referenced by their internal name, e.g. `{{submission.$authors}}` or `{{decision.$verdict}}`. Other supported fields are:

- `{{title}}`: The manuscript title, an alias for `{{submission.$title}}`
- `{{uri}}`: The preprint location, either taken from `submission.$sourceUri` or failing that, a DOI link derived from `submission.$doi`
- `{{doi}}`: The preprint's DOI, an alias for `{{submission.$doi}}`
- `{{status}}`: The manuscript status

A typical use-case is a follows:

1. An evaluation of a preprint is completed in Kotahi.
2. An editor hits the 'Publish' button, causing the fields containing the evaluation to be published as a Hypothesis annotation, and a DocMap to be generated.
3. An automated external service scrapes the new annotation from Hypothesis. This service then queries the `docmap` API in Kotahi, passing the preprint's URI as the parameter.
4. Kotahi returns the requested docmap, which contains supplementary information needed by the external service, e.g. the participant who authored the evaluation.

##### Annotations can also be viewed in Kotahi

Whenever a Hypothesis annotation is generated by Kotahi, the same content is also duplicated as a publicly-accessible page hosted in Kotahi. DocMaps generated by Kotahi will contain a link to this page, as well as a link to the Hypothesis annotation.

## Production tools

The Production page provides tools for semantic tagging of manuscripts uploaded to Kotahi, facilitating export of structured data such as JATS. It also provides controls to download the manuscript and metadata as PDF, HTML or JATS.

#### Citation manager

One of the "Back matter" tools is named "Reference". Highlight one or more references in a reference list and click "Reference" to obtain structured-data for them. Suggested structured data will be sought from CrossRef and AnyStyle, and a list icon will appear to the right of the citation once all suggestions have arrived. Then you may click on the reference to be shown the list of suggestions: choose the best one or edit it manually. Typically there will be at least one correct suggestion you can use without editing.

The suggestion you choose (or edit) will be formatted with CiteProc to match your organisation's chosen citation style. Structured data will also be stored for that citation, so that rich citation data can be exported to JATS.

##### Setting up CrossRef

CrossRef searches for possible matching citations from a large database of citations, all with semantic structure.

You must provide a valid email address in `Configuration > Production > Email to use for citation search`. Here you can also choose citation style and locale for formatting.

## API

Kotahi exposes a graphql API for external access. The available queries are:

- `manuscriptsPublishedSinceDate(startDate: DateTime, limit: Int, groupName: String): [PublishedManuscript!]!` returns published manuscripts for the specified group, with an optional startDate and/or limit. `groupName` can be omitted if there is only one active group.
- `publishedManuscript(id: ID!): PublishedManuscript` returns a single published manuscript by ID, or null if this manuscript is not published or not found.
- `unreviewedPreprints(token: String!, groupName: String): [Preprint!]!` returns a list of manuscripts with the `readyToEvaluate` label, for the specified group. `groupName` can be omitted if there is only one active group.
- `docmap(externalId: String!, groupName: String): String!` returns a [DocMap](https://docmaps.knowledgefutures.org/) from the specified group, representing the relationship between a given preprint (`externalId` is the preprint's URL) and related artifacts such as evaluations that have been published from Kotahi. See above for how to enable this. `groupName` can be omitted if there is only one active group.

Consult the code [here](https://github.com/eLifePathways/Kotahi/blob/main/packages/server/api/graphql/manuscript/manuscript.graphql) and [here](https://github.com/eLifePathways/Kotahi/blob/main/packages/server/api/graphql/docmap/docmap.graphql) for details, or the [graphql sandbox](https://studio.apollographql.com/sandbox/explorer), when your dev environment is running.

While these queries are publicly exposed and don't need a JWT token, the `unreviewedPreprints` query expects a `token` parameter for authentication; this must match a secret token set in the `KOTAHI_API_TOKENS` environment variable in the `.env` file. Tokens may contain any characters other than commas, and may not start or end with whitespace. Multiple tokens may be stored, separated by commas. We recommend that each token contain a human-readable identifier and a strong random string, e.g.:

```
KOTAHI_API_TOKENS="Alice ZSR2YyyMFB1y55, Bob J0m7j4JfSxOtZ2, Catherine 3BV3K+1p4PRJ5A"
```

Bob's token would then be `"Bob J0m7j4JfSxOtZ2"`.

The `unreviewedPreprints` query returns an `id` and `shortId`, and the following fields if they are present in your submission form:

- `submission.$title` ('Title' field)
- `submission.$abstract` ('Abstract' field)
- `submission.$authors` ('Authors' field)
- `submission.$doi` ('DOI' field)
- `submission.$sourceUri` ('Manuscript source URI' field)

## Translations

### How do I modify wording or add languages?

You can customise UI wording by supplying the `packages/client/config/translation/translationOverrides.js` file to affect all multitenancy groups, or else by supplying `packages/client/config/translation/<groupName>/translationOverrides.js` to affect just the named group (use the same group name supplied in the `INSTANCE_GROUPS` setting in your `.env` file). Copy the template provided in `packages/client/config/translation/translationOverrides.example.js`.

This allows you to modify terminology as appropriate for your organisation, e.g. changing 'editor' to 'curator'. You can also use this file to add new languages. Further instructions are in the template file.

Note that this file does not let you translate forms, tasks, email templates or templates for exporting manuscripts to PDF or Flax: all of these should instead be modified directly via the UI.

To see what languages are currently available in Kotahi, visit your profile page.

## Going further

### How do I set the logo and branding colours?

`app/brandConfig.json` allows logo, colors and brand name to be specified. Colors must be specified in hex format, e.g. "#9e9e9e".

## INSTANCE_GROUPS and Multitenancy

`INSTANCE_GROUPS` is a required setting, which determines what multitenanted "groups" should run within a single instance of Kotahi. Each group has its own data, workflow, branding and other settings. You can use multiple groups to run different journals or publishing teams within a single instance of Kotahi, or to experiment with different workflows.

The `INSTANCE_GROUPS` setting in the `.env` file should contain one or more _group specifications_ separated by commas. Each _group specification_ consists of a _group name_ followed by a colon followed by a _group type_, e.g. `ourjournal:journal`. The _group name_ (before the colon) may only contain lowercase `a`-`z`, `0`-`9` and `_` characters. The _group type_ (after the colon) must be either 'journal', 'prc', 'preprint1' or 'preprint2'.

Example setting for running a single group only:

```
INSTANCE_GROUPS=myjournal:journal
```

Example setting for running multiple groups:

```
INSTANCE_GROUPS=myjournal:journal,mypreprints:prc,trial_workflow:prc
```

### URLs determined by _group name_

Each group must have a different _group name_, and this _group name_ determines the URLs of the group's pages. E.g., the dashboard for a group named "myjournal" will be at `https://domain/myjournal/dashboard`. If you wish a group to have the same URLs as were used in Kotahi prior to version 2.0, you must name that group 'kotahi'.

With only a single group, the root URL `https://domain` will redirect to the frontpage `https://domain/groupname` listing recent publications, and the Login/Dashboard link. If there are multiple groups active, the root URL will be a page allowing the user to select which group they wish to navigate to; recent publications will be listed at `https://domain/groupname`, and login will be at `https://domain/groupname/login`.

### Adding or archiving groups

To add a new group, you must stop all containers, change the `INSTANCE_GROUPS` setting by adding a new _group specification_ separated by a comma, then start the containers again. The new group will be created (or revived from archive if the _group name_ matches an old, archived group) with the specified _group type_. You can then configure the group via the UI, using the Configuration Manager, Form Builders and Task Template Builder.

To archive a group you no longer wish to have active, stop all containers, remove that group's specification from `INSTANCE_GROUPS`, and restart containers.

### Upgrading from old versions

When upgrading from an earlier version of Kotahi prior to 2.0, it is recommended to specify only a single group, with the _group name_ "kotahi" and the same _group type_ as previously specified for the `INSTANCE_NAME` setting. This will keep existing settings and page URLs unchanged. See [CHANGES.md](https://github.com/eLifePathways/Kotahi/blob/main/CHANGES.md#2023-08-18-version-200) for instructions. You can later change or add groups as you wish.

### Configuring the Manuscripts table for your group

The columns displayed in the Manuscripts table (viewable by Group Managers only) are determined in the Config Manager, by the setting "List columns to display on the Manuscripts page". Here you should enter a comma-separated list consisting of field-names and/or special column names. E.g.:

```
titleAndAbstract, created, updated, status, submission.$customStatus, author
```

Field names for your particular group can be viewed in the submission form builder (Forms > Submission), by clicking on each field and locating its "Internal field name". If the field in question is a dropdown selection or radio buttons, the resulting column will allow you to filter manuscripts by values in that field.

Some commonly used fields include:

- `submission.$title`: manuscript title.
- `submission.$abstract`: manuscript abstract.
- `submission.$authors`: list of authors.
- `submission.$customStatus`: a status from your own custom-defined workflow. You can filter manuscripts by this status.

You can also include special columns:

- `titleAndAbstract`: This compactly displays the manuscript title (`submission.$title`) plus an information icon you can hover over to see the abstract (`submission.$abstract`) if there is one. If a source URL is recorded for the manuscript, clicking the title will take you to that URL. You can also sort manuscripts based on the titles in this column.
- `shortId`: A human-friendly serial number by which manuscripts can be uniquely identified within your group.
- `created`: The date and time the manuscript was first entered into Kotahi.
- `updated`: The date and time the manuscript was last updated in Kotahi.
- `lastUpdated`: The date and time of the most recent update by a _reviewer_ of the manuscript.
- `status`: The status of the manuscript.
- `manuscriptVersions`: A count of how many versions of the manuscript there are in Kotahi.
- `submitter`: Details of the user who submitted the manuscript.
- `editor`: Details of all users who are editors of the manuscript (including handling editors and senior editors).
- `actions`: Usually included as the last column, this provides links allowing you to view manuscript details, view the production page, publish the manuscript or archive it. The set of actions available depends on other configuration options, as well as manuscript status.
