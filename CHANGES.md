## Changes

### Version 2025.06.02-0

The following environment variables have been dropped:
- `GMAIL_NOTIFICATION_EMAIL_AUTH`
- `GMAIL_NOTIFICATION_EMAIL_SENDER_NAME`
- `GMAIL_NOTIFICATION_PASSWORD`
- `USE_COLAB_EMAIL`
- `NOTIFICATION_EMAIL_AUTOMATED`
- `NOTIFICATION_EMAIL_CC_ENABLED`

Email provider setup is now configured through the email settings in the admin settings. The email provider can now be any SMTP provider, not just gmail.

### Version 4.0.0

The `GMAIL_NOTIFICATION_EMAIL_SENDER` variable has been renamed to `GMAIL_NOTIFICATION_EMAIL_SENDER_NAME`.

There is a new optional environment variable `POSTGRES_CA_CERT`, which can accept an encoded ca cert to verify the database connection.  
In order to create the encoded value, assuming that you've downloaded your certificate, run `base64 -w0 ca-certificate.crt` and set the output as the value of the variable.  
Note that using this variable will override the value of `POSTGRES_ALLOW_SELF_SIGNED_CERTIFICATES`, effectively setting it to false.

### Version 3.9.0

We now offer pre-built production images for both kotahi server and kotahi client. You can find them on dockerhub as `cokoapps/kotahi-server` and `cokoapps/kotahi-client`. Tags will be the version that is being published (eg. `cokoapps/kotahi-server:3.9.0`).

The `S3_PROTOCOL`, `S3_HOST` and `S3_PORT` variables have been dropped. Use `S3_URL` instead of them.
eg. 
```sh
# Before

S3_PROTOCOL=https
S3_HOST=mystoragedomain.com
S3_PORT=5050

# After
S3_URL=https://mystoragedomain.com:5050
```

There's a new (optional) `S3_REGION` environment variable that let's you control the storage provider's region setting.

If you were previously adding the `pgcrypto` extension to your databases manually, that is no longer necessary. The extension is still necessary, but its addition will happen automatically.

Note that there's a new major version (`2.0.0`) of the pagedjs microservice. If you switch to that, there are a couple of environment variables that you need to change. Check that repo's [changelog](https://github.com/Coko-Foundation/pagedjs-microservice/blob/main/CHANGELOG.md) for details. Both versions 1 and 2 will work with kotahi.

### Version 3.8.0

We've changed how translation overrides work a little. Instead of mounting files on the client container, you now need to mount your override files on the server container, under `config/translation`. This will enable us to provide pre-built client images in the near future.

### Version 3.7.0

Client and server are now two separate containers in production. This means that your main url (eg. myapp.com) should now point to the client deployment, not the server. You can see the [production compose file](https://github.com/eLifePathways/Kotahi/blob/3.7.0/docker-compose.production.yml?ref_type=tags) for reference. Both client and server need to have separate, publicly accessible urls.

eg. If on your deployment, you are running the client on `localhost:4000` and the server on `localhost:3000`, in your nginx or equivalent configuration you will need to point eg. myapp.com to `localhost:4000` and server.myapp.com (or whatever new url you want) to `localhost:3000`.

Running the client and server independently lets you scale the client and server independently according to your needs. It also allows you to run them on completely different machines, if you so wish.

It's important to note the changed environment variables in this release.
The following variables were dropped:
- `SERVER_PROTOCOL`
- `SERVER_HOST`
- `CLIENT_PROTOCOL`
- `CLIENT_HOST`
- `PUBLIC_CLIENT_PROTOCOL`
- `PUBLIC_CLIENT_HOST`
- `PUBLIC_CLIENT_PORT`

The following variables were added:
- `SERVER_URL`: The public url of the server
- `CLIENT_URL`: The public url of the client

The following variables have been renamed:
- `CLIENT_YJS_WEBSOCKET_URL` -> `YJS_WEBSOCKET_SERVER_URL`

If you're a developer, we've also added the variable `E2E_TESTING_API`. This enables api access to cypress tests in order to seed and clear the database while running. This variable is blocked if `NODE_ENV` is `production` and MUST NOT be true in any deployment.

Make sure you reach out at our [support forum](https://forum.kotahi.community/c/kotahi/8) if you need further assistance or are having deployment issues.

### Version 3.6.0

There is a new integration with datacite which can optionally be configured via environment variables (but also through the config manager in the ui).  
The new environment variables are:

- `ROR_URL`
- `DATACITE_LOGIN`
- `DATACITE_PASSWORD`
- `DOI_PREFIX`
- `DATACITE_USE_SANDBOX`

### Version 3.5.0

There is a new feature that leverages yjs to enable collaborative editing on some text editors. This feature opens a new websocket connection, which needs a couple of new environment variables to function:

- `WS_YJS_SERVER_PORT`: This tells the server which port to open for the yjs websocket server.
- `CLIENT_YJS_WEBSOCKET_URL`: This tells the client where the publicly accessible url for the yjs websocket server is.

For example:

- Open the yjs server at port 5010 with the environment variable `WS_YJS_SERVER_PORT=5010`.
- Tell the client where it can find the yjs server with the variable `CLIENT_YJS_WEBSOCKET_URL=wss://mykotahideployment.com/yjs`.
- Map the url `wss://mykotahideployment.com/yjs` to `localhost:5010` in your nginx config or equivalent.

### Version 3.2.0

If you have a `translationOverrides.js` file, it must be moved from `config/` folder to `packages/client/config/translation/` folder.

**Development instances only:** Any dev instances hosted on `localhost` will need to their 'Redirect URIs' changed in ORCID, to be able to log in. Alternately, if your port is 4000, you can just change the `ORCID_CLIENT_ID` in your `.env` file to the one supplied in the `.env.example` file, and no further changes should be required.

To change 'Redirect URIs' in ORCID, follow the [instructions in the FAQ](https://github.com/eLifePathways/Kotahi/blob/3.2.0/FAQ.md#how-do-i-setup-orcid-for-development), and replace any Redirect URIs mentioning "localhost" with equivalent URIs containing `127.0.0.1`.

#### Renaming a Group Name

To rename an existing group or change the default first group name 'kotahi', follow these steps:

##### Step 1: Update Group Name in the Database

Run the following SQL command to replace the group name from 'kotahi' to your desired group name:

```sql
UPDATE groups SET name='unused' WHERE name='<desired-group-name>'; -- Move existing group (if any) out of the way

UPDATE groups SET name='<desired-group-name>' WHERE name='kotahi'; -- Rename 'kotahi' to your desired name
```

Replace `<desired-group-name>` with the desired group name you wish to replace 'kotahi' with.

##### Step 2: Update Group Name .env File

Update the group name in the `.env` file.

- Open the `.env` file in your project.
- Locate the `INSTANCE_GROUPS` variable.
- Replace the 'kotahi' group name with the desired group name.
- After updating the `.env` file, redeploy the application to apply the changes.

Note: Ensure that you follow the [instructions in the FAQ](https://github.com/eLifePathways/Kotahi/blob/3.2.0/FAQ.md#instance_groups-and-multitenancy) regarding `INSTANCE_GROUPS` and group specifications.

### Version 3.1.0

If you have any plugin packages, they should be moved from `config/plugins/` folder to `packages/server/config/plugins/` folder, along with the `plugins_manifest.json` file.

### 2024-01-25: Version 3.0.0

- The following instance archtypes used in the codebase have been renamed

1. aperture -> journal
2. colab -> prc
3. elife -> preprint1
4. ncrc -> preprint2

Prior upgrading Kotahi, please ensure the instance archetypes have been renamed in `INSTANCE_GROUPS` in the .env file.

- `NOTIFICATION_EMAIL_CC_ENABLED=` variable to enable/disable carbon copies (CC) has been **deprecated**. Group Managers can manually add a CC from the Emails>Email template>CC field
- `NOTIFICATION_EMAIL_AUTOMATED=` variable to enable/disable automated notification has been **deprecated**. Group Managers can manually select email templates from 'Event Notifications' from configuration manager

### 2023-09-28: Version 2.1.0

#### Citation manager

Instances affected: **All with `aperture` or `colab` groups, that use the Production page**

A citation manager has been introduced to the Production page, for correcting and formatting citations and to faciliate better export to JATS. It uses AnyStyle and CrossRef services to provide suggested structured matches to existing citations, and CiteProc to format the citations.

##### Setting up CrossRef

In the Configuration page a new "Production" section contains "Email to use for citation search". You must provide a valid email address here. You can also choose citation style and locale for formatting.

##### Setting up AnyStyle (optional)

AnyStyle is an optional component of the tool, useful when CrossRef doesn't find a good match to a citation. To use AnyStyle, you must set up an AnyStyle server and database -- see `docker-compose.yml` for setup.
Then add the following to your .env, substituting your own secrets:

```
SERVICE_ANYSTYLE_CLIENT_ID=59a3392b-0c4f-4318-bbe2-f86eff6d3de4
SERVICE_ANYSTYLE_SECRET=asldkjLKJLaslkdf897kjhKUJH
SERVICE_ANYSTYLE_PROTOCOL=http
SERVICE_ANYSTYLE_HOST=anystyle
SERVICE_ANYSTYLE_PORT=4567
```

For a non-local AnyStyle server, the host will be `subdomain.domain`, and protocol will typically be `http`.

#### Imports

Instances affected: **Colab Biophysics organization _only_**

Set `USE_COLAB_BIOPHYSICS_IMPORT=true` in the `.env` file. Without this, imports specific to the Colab Biophysics organization will now be disabled. Note that for these imports to run, the group archetype must also be `colab`.

Previously, all groups using the `colab` archetype performed these imports, despite them being intended for one organization only.

In future we intend to move all imports into plugins, using the import [plugin architecture](https://github.com/eLifePathways/Kotahi/wiki/Plugins).

### 2023-08-18: Version 2.0.0

Instances affected: **all**.<br/>

#### Multitenancy

`INSTANCE_NAME` environment variable is no longer used (but may be retained in case rollback is required). Instead, the variable `INSTANCE_GROUPS` must be supplied when upgrading Kotahi to version 2.0.0 or later.

`INSTANCE_GROUPS` is a required setting, which determines what multitenanted "groups" should run within a single instance of Kotahi. Typically, when upgrading an existing instance to 2.0.0, `INSTANCE_GROUPS` should specify a single group, though you may subsequently add further groups separated by commas to create new mulitenanted groups, each with their own data, workflow, branding and other settings (see the [FAQ](https://github.com/eLifePathways/Kotahi/blob/3.2.0/FAQ.md#instance_groups-and-multitenancy) for details).

`INSTANCE_GROUPS` must contain one or more _group specifications_ separated by commas. Each _group specification_ consists of a _group name_ followed by a colon followed by a _group type_, e.g. `ourjournal:aperture`. The _group name_ (before the colon) may only contain lowercase `a`-`z`, `0`-`9` and the `_` character. The _group type_ (after the colon) must be either 'aperture', 'colab', 'elife' or 'ncrc'. (These _group types_ will be given more descriptive and generic names in the near future.)

Typically, to keep URLs to pages unchanged it is recommended that the _group name_ "kotahi" be used: thus, if you had `INSTANCE_NAME=aperture`, you would set `INSTANCE_GROUPS=kotahi:aperture`.

#### Flax CMS

Kotahi now also includes an inbuilt Flax content management system for generating a static website of published manuscripts and evaluations. The environment variables to support this are detailed below. Flax and Kotahi require separate DNS configurations if you wish to make Flax accessible without using a port number in the URL. A group's Flax site can be accessed (after at least one manuscript has been published) at `<FLAX_SITE_URL>/<group name>`; e.g. in local development, with the _group name_ "kotahi", the Flax site can be accessed at `http://localhost:8081/kotahi`.

#### Summary of required changes

For all existing instances, _prior to upgrading_, **configure DNS for Flax**, to point your chosen Flax domain/subdomain to your server on the flax site port. Add the following environment variables to the `.env` file:

1. `INSTANCE_GROUPS=kotahi:<group type>` where <group type> is whatever `INSTANCE_NAME` was set to.
2. `FLAX_EXPRESS_PORT=8082`
3. `FLAX_EXPRESS_HOST=kotahi-flax-site`
4. `FLAX_SITE_PORT=8081`
5. `FLAX_CLIENT_API_URL=http://client:4000`
6. `FLAX_SITE_URL=<flax site origin>` For local development, <flax site origin> is `http://localhost:8081`; for a production site it's whatever subdomain and domain you wish to configure for it.

These are typical values, but other ports etc can be chosen as desired.

### 2023-06-27

For the Aperture Neuro group _only_, you must add the following to the `.env` file prior to upgrade:

```
USE_APERTURE_EMAIL=true
```

### 2022-10-18

Instances affected: **all**.<br/>
`TEAM_TIMEZONE` should be set to the [tz database name](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) of your team's main timezone (e.g. `Europe/London` if your head office is in UK). This allows correct calculation of days remaining on tasks in your task list, and will have other uses in future.

For colab instance archetype:

1. Set `SEMANTIC_SCHOLAR_IMPORTS_RECENCY_PERIOD_DAYS=42` in ENV to configure the recency period of Semantic Scholar recommended preprints

### 2022-10-14

For colab instance archetype:

1. Set `ALLOW_MANUAL_IMPORT=true` to make the 'Refresh' button appear on the manuscripts page, allowing editors and admins to manually start an import of preprints from bioRxiv.
2. Set `AUTO_IMPORT_HOUR_UTC` to an integer from `0 to 23` to cause a daily automatic import of preprints at that hour UTC.
3. Set `ARCHIVE_PERIOD_DAYS` to an integer value to cause unselected manuscripts to be automatically archived after that number of days to which they were imported into Kotahi. This feature is dependent on `AUTO_IMPORT_HOUR_UTC` also being set (see above), and archiving will occur at the same hour of the day as imports.

### 2022-08-01

eLife only: To publish fields to Hypothesis in reverse order, so that they appear in top-to-bottom order in the TRiP listing, add `HYPOTHESIS_REVERSE_FIELD_ORDER=true` to the `.env` file. See FAQ.md for details.

### 2022-07-14

Fields for publishing are now specified in the form-builder, rather than via `HYPOTHESIS_PUBLISH_FIELDS` in the `.env` file. If `HYPOTHESIS_PUBLISH_FIELDS` is not specified, no action is necessary. Otherwise, to retain your existing publishing options, you should:

1. Determine what fields are selected in `HYPOTHESIS_PUBLISH_FIELDS`. Fields are separated by commas, and may consist of either a field name, or a field name and a tag separated by a colon (e.g. `fieldName:hypothesis tag`). You may also have a special `decision` or `reviews` pseudo-field specified. For full details of these old settings, [see here](https://github.com/eLifePathways/Kotahi/blob/c51b72ec81e74aab915c46f0bdadc3975cc61bd9/FAQ.md#hypothesis).
2. For each ordinary field that was specified in `HYPOTHESIS_PUBLISH_FIELDS`, locate that field in the submission form in the form-builder, and enable "Include when sharing or publishing".
3. If a tag was specified for that field, enter it in the "Hypothes.is tag" text box.
4. If the `decision` pseudo-field was specified, locate the field in your decision form with the internal name "comment": enable "Include when sharing or publishing", and set a hypothes.is tag if one was specified.
5. If the `reviews` pseudo-field was specified, do the same for the review form.
6. You may remove `HYPOTHESIS_PUBLISH_FIELDS` from the `.env` file.

Instances publishing to Hypothes.is should add the following to their .env file:

```
HYPOTHESIS_ALLOW_TAGGING=true
```

### 2022-07-07

- Instances affected: **Kotahi Dev**, **Aperture**, **Aperture Neuro**, and **CoLab** <br />
  Following the conventions of configuration, <br />
  `NOTIFICATION_EMAIL_CC_ENABLED` and `USE_COLAB_EMAIL` will now be using `true` and `false` as values removing the quotes "". <br />

  ```
  NOTIFICATION_EMAIL_CC_ENABLED=false
  USE_COLAB_EMAIL=false
  ```

  ```
  NOTIFICATION_EMAIL_CC_ENABLED=true
  USE_COLAB_EMAIL=true
  ```

### 2022-06-29

- Instances affected: **Kotahi Dev**, **Aperture**, **Aperture Neuro**, and **CoLab** <br />
  `NOTIFICATION_EMAIL_CC_ENABLED`: A true value means Kotahi will use CC in automated email notifications. <br />
  ```
  NOTIFICATION_EMAIL_CC_ENABLED="false"
  ```
  <br />
- Instances affected: **Colab Biophysics** <br />
  `USE_COLAB_EMAIL`: A true value means Kotahi will use email templates for CoLab, otherwise, it will use generic email templates.
  ```
  USE_COLAB_EMAIL="false"
  ```

### 2022-05-26

- Instances affected: **elife** and **Colab Biophysics** <br />
  `HYPOTHESIS_GROUP=`(this is the Hypothe.is group id) <br />
  `HYPOTHESIS_PUBLISH_FIELDS=`(submission form and endpoint field mapping)

- **Colab Biophysics** Gmail .env variables have been updated.
  ```
  GMAIL_NOTIFICATION_EMAIL_AUTH=
  GMAIL_NOTIFICATION_EMAIL_SENDER=
  GMAIL_NOTIFICATION_PASSWORD=
  ```

### 2022-04-13

For dev instances, remove the old `minio/minio` image and container:
`docker image rm -f minio/minio`
Then rebuild containers.
