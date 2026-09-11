DO $$
DECLARE
  g_id UUID;
  admin_team_id UUID;
  ga_team_id UUID;
  gm_team_id UUID;
  user_team_id UUID;
  channel_id UUID;
BEGIN

INSERT INTO teams (id, object_id, object_type, display_name, role, global, type)
  values (gen_random_uuid(), null, null, 'Admin', 'admin', true, 'team');


SELECT id INTO g_id FROM groups WHERE name='prc' LIMIT 1;
SELECT id INTO admin_team_id FROM teams
  WHERE global IS TRUE AND role='admin' LIMIT 1;
SELECT id INTO ga_team_id FROM teams
  WHERE object_id=g_id AND role='groupAdmin' LIMIT 1;
SELECT id INTO gm_team_id FROM teams
  WHERE object_id=g_id AND role='groupManager' LIMIT 1;
SELECT id INTO user_team_id FROM teams
  WHERE object_id=g_id AND role='user' LIMIT 1;
SELECT id INTO channel_id FROM channels WHERE group_id=g_id AND topic='System-wide discussion';

UPDATE configs SET form_data = '{"user": {"isAdmin": false, "kotahiApiTokens": "test:123456"}, "report": {"showInMenu": true}, "review": {"showSummary": true}, "dashboard": {"showSections": ["submission", "review", "editor"], "loginRedirectUrl": "/dashboard"}, "manuscript": {"labelColumn": true, "tableColumns": "titleAndAbstract, created, updated, status, submission.$customStatus, author", "newSubmission": true, "paginationCount": 10, "archivePeriodDays": 60, "autoImportHourUtc": 21, "semanticScholarImportsRecencyPeriodDays": 42}, "publishing": {"webhook": {"ref": "test", "url": "https://someserver/webhook-address", "token": "test"}, "crossref": {"login": "test", "password": "test", "doiPrefix": "10.12345/", "licenseUrl": "test", "registrant": "test", "useSandbox": true, "journalName": "test", "depositorName": "test", "depositorEmail": "test@coko.foundation", "journalHomepage": "test", "publicationType": "article", "journalAbbreviatedName": "test", "publishedArticleLocationPrefix": "test"}, "hypothesis": {"group": null, "apiKey": null, "reverseFieldOrder": true, "shouldAllowTagging": true}}, "submission": {"allowAuthorsSubmitNewVersion": true}, "taskManager": {"teamTimezone": "Etc/UTC"}, "controlPanel": {"showTabs": ["Team", "Decision", "Reviews", "Manuscript text", "Metadata", "Tasks & Notifications"], "hideReview": true, "sharedReview": true, "editorsCanPublish": true, "groupManagersCanPublish": true, "displayManuscriptShortId": true}, "instanceName": "prc", "notification": {}, "groupIdentity": {"logoPath": "/biophysics-colab.png", "brandName": "Colab", "primaryColor": "#bc2325", "secondaryColor": "#bc2325"}, "eventNotification": {"reviewerInvitationPrimaryEmailTemplate": "ae7e01ca-fa91-4155-a248-a8b9f38c80a3"}}'
WHERE group_id = g_id;

-- Add users to the tests
INSERT INTO "public"."users" ("id", "created", "updated", "admin", "email", "username", "password_hash", "teams", "password_reset_token", "password_reset_timestamp", "type", "profile_picture", "online", "last_online", "recent_tab", "preferred_language") VALUES
('5b861dfb-02df-4be1-bc67-41a21611f5e7', '2022-05-14 10:31:35.715+00', '2022-08-23 14:55:02.854+00', NULL, 'joanep@example.com' , 'Joane Pilger' , NULL, NULL, NULL, NULL, 'user', NULL, NULL, NULL, 'submissions', 'en-US'),
('85e1300e-003c-4e96-987b-23812f902477', '2020-07-21 14:35:38.381+00', '2022-08-23 14:55:16.435+00', 't', 'elaineb@example.com', 'Elaine Barnes', NULL, NULL, NULL, NULL, 'user', NULL, NULL, NULL, 'submissions', 'en-US'),
('ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', '2022-05-13 10:55:50.523+00', '2022-08-23 14:54:54.91+00' , NULL, 'emilyc@example.com' , 'Emily Clay' , NULL, NULL, NULL, NULL, 'user', NULL, NULL, NULL, 'submissions', 'en-US'),
('f9b1ed7f-f288-4c3f-898c-59e84b1c8e69', '2022-05-13 10:54:12.651+00', '2022-08-23 14:55:09.39+00' , 't' , 'sineads@example.com', 'Sinead Sullivan', NULL, NULL, NULL, NULL, 'user', NULL, NULL, NULL, 'submissions', 'en-US'),
('41d52254-a2b8-4ea4-9ded-bfbfe9671578', '2022-09-14 02:51:58.817+00', '2022-09-14 02:53:20.544+00', NULL, 'sherry@example.com' , 'Sherry Crofoot', NULL, NULL, NULL, NULL, 'user', NULL, NULL, NULL, 'submissions', 'en-US'),
('7f2fb549-51c0-49d5-844d-8a2fbbbbc0ad', '2022-09-14 02:50:09.737+00', '2022-09-14 02:50:25.118+00', NULL, 'gale@example.com'   , 'Gale Davis'  , NULL, NULL, NULL, NULL, 'user', NULL, NULL, NULL, 'submissions', 'en-US'),
('dcabc94f-eb6e-49bb-97d3-fc1a38f9408c', '2022-09-14 02:51:21.741+00', '2022-09-14 02:51:29.283+00', NULL, 'david@example.com'  , 'David Miller' , NULL, NULL, NULL, NULL, 'user', NULL, NULL, NULL, 'submissions', 'en-US'),
('231717dd-ba09-43d4-ac98-9d5542b27a0c', '2020-07-22 14:18:36.597+02', '2020-07-24 16:43:54.939+02', true, NULL, 'Test Account', NULL, NULL, NULL, NULL, 'user', NULL, NULL, NULL, 'profile', 'en-US');

INSERT INTO "public"."identities" ("id", "user_id", "created", "updated", "type", "identifier", "name", "aff", "oauth", "is_default") VALUES
(gen_random_uuid(), '5b861dfb-02df-4be1-bc67-41a21611f5e7', '2022-07-29 05:15:21.654+00', '2022-07-29 05:15:21.624+00', 'orcid', '0000-0003-1838-2441', 'Joane Pilger'   , '', '{"accesstoken": "26fbc6b6-4421-40c5-ba07-d8c665f6704b", "refreshtoken": "4211bbf5-85ae-4980-833a-3f3deabcec6a"}', 't'),
(gen_random_uuid(), '85e1300e-003c-4e96-987b-23812f902477', '2020-07-21 14:35:38.384+00', '2020-07-21 14:35:39.358+00', 'orcid', '0000-0002-9429-4446', 'Elaine Barnes'  , '', '{"accessToken": "dcf07bc7-e59c-41b3-9ce0-924ac20aeeea", "refreshToken": "ae49d6a1-8e62-419d-8767-4a3ec22c1950"}', 't'),
(gen_random_uuid(), 'ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', '2022-05-13 10:55:50.525+00', '2022-05-13 10:55:50.525+00', 'orcid', '0000-0002-0564-2016', 'Emily Clay'     , '', '{"accessToken": "67cdb60a-7713-45df-8004-ca4ab38e9014", "refreshToken": "6c54414e-8b88-4814-84f9-f3067ad3078e"}', 't'),
(gen_random_uuid(), 'f9b1ed7f-f288-4c3f-898c-59e84b1c8e69', '2022-05-13 10:54:12.655+00', '2022-05-13 10:54:12.655+00', 'orcid', '0000-0002-5641-5729', 'Sinead Sullivan', '', '{"accessToken": "e85acf35-dcbf-45b1-9bc3-5efb80a95ca9", "refreshToken": "3bd13cb6-b0c5-42df-98da-c0037185d085"}', 't'),
(gen_random_uuid(), '41d52254-a2b8-4ea4-9ded-bfbfe9671578', '2022-09-14 02:51:58.82+00' , '2022-09-14 02:51:58.82+00' , 'orcid', '0000-0002-7645-9921', 'Sherry Crofoot' , '', '{"accessToken": "1b6e59f2-276a-46f0-8198-b55e6ecf49d5", "refreshToken": "8fa0d45f-8e19-40e5-a93b-9088ed62f325"}', 't'),
(gen_random_uuid(), '7f2fb549-51c0-49d5-844d-8a2fbbbbc0ad', '2022-09-14 02:50:09.747+00', '2022-09-14 02:50:09.747+00', 'orcid', '0000-0001-5956-7341', 'Gale Davis'     , '', '{"accessToken": "1300952c-a4cc-4c44-ba23-df4295571689", "refreshToken": "f4ed08d1-930e-43f0-9463-0a45428d08f5"}', 't'),
(gen_random_uuid(), 'dcabc94f-eb6e-49bb-97d3-fc1a38f9408c', '2022-09-14 02:51:21.743+00', '2022-09-14 02:51:21.743+00', 'orcid', '0000-0002-9601-2254', 'David Miller'   , '', '{"accessToken": "a0829b38-4732-4f7c-961d-eac592dbfb07", "refreshToken": "581792f0-a925-4cdb-a491-a519af67273c"}', 't'),
(gen_random_uuid(), '231717dd-ba09-43d4-ac98-9d5542b27a0c', '2020-07-22 14:18:36.611+02', '2020-07-22 14:18:37.745+02', 'orcid', '0000-0003-2536-230X', 'Test Account', NULL, '{"accessToken": "eb551178-79e5-4189-8c5f-0a553092a9b5", "refreshToken": "4506fa5f-bd77-4867-afb4-0b07ea5302d6"}', 't');

INSERT INTO "public"."team_members" ("id", "created", "updated", "team_id", "user_id", "is_shared") VALUES
(gen_random_uuid(), '2022-08-10 02:15:29.071+00', '2022-08-10 02:15:29.071+00', user_team_id, '5b861dfb-02df-4be1-bc67-41a21611f5e7', NULL),
(gen_random_uuid(), '2022-08-10 02:15:29.071+00', '2022-08-10 02:15:29.071+00', user_team_id, 'ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', NULL),
(gen_random_uuid(), '2022-08-10 02:15:29.071+00', '2022-08-10 02:15:29.071+00', user_team_id, '41d52254-a2b8-4ea4-9ded-bfbfe9671578', NULL),
(gen_random_uuid(), '2022-08-10 02:15:29.071+00', '2022-08-10 02:15:29.071+00', user_team_id, '7f2fb549-51c0-49d5-844d-8a2fbbbbc0ad', NULL),
(gen_random_uuid(), '2022-08-10 02:15:29.071+00', '2022-08-10 02:15:29.071+00', user_team_id, 'dcabc94f-eb6e-49bb-97d3-fc1a38f9408c', NULL),
(gen_random_uuid(), '2022-08-10 02:15:29.071+00', '2022-08-10 02:15:29.071+00', user_team_id, 'f9b1ed7f-f288-4c3f-898c-59e84b1c8e69', NULL),
(gen_random_uuid(), '2022-08-10 02:15:29.071+00', '2022-08-10 02:15:29.071+00', user_team_id, '85e1300e-003c-4e96-987b-23812f902477', NULL),
(gen_random_uuid(), '2023-01-17 19:09:08.683+00', '2023-01-17 19:09:08.683+00', user_team_id, '231717dd-ba09-43d4-ac98-9d5542b27a0c', NULL),
(gen_random_uuid(), '2022-08-10 02:15:29.071+00', '2022-08-10 02:15:29.071+00', gm_team_id, 'f9b1ed7f-f288-4c3f-898c-59e84b1c8e69', NULL),
(gen_random_uuid(), '2022-08-10 02:15:29.071+00', '2022-08-10 02:15:29.071+00', gm_team_id, '85e1300e-003c-4e96-987b-23812f902477', NULL),
(gen_random_uuid(), '2023-01-17 19:09:08.683+00', '2023-01-17 19:09:08.683+00', gm_team_id, '231717dd-ba09-43d4-ac98-9d5542b27a0c', NULL),
(gen_random_uuid(), '2022-08-10 02:15:29.071+00', '2022-08-10 02:15:29.071+00', ga_team_id, 'f9b1ed7f-f288-4c3f-898c-59e84b1c8e69', NULL),
(gen_random_uuid(), '2022-08-10 02:15:29.071+00', '2022-08-10 02:15:29.071+00', ga_team_id, '85e1300e-003c-4e96-987b-23812f902477', NULL),
(gen_random_uuid(), '2023-01-17 19:09:08.683+00', '2023-01-17 19:09:08.683+00', ga_team_id, '231717dd-ba09-43d4-ac98-9d5542b27a0c', NULL),
(gen_random_uuid(), '2022-08-10 02:15:29.071+00', '2022-08-10 02:15:29.071+00', admin_team_id, 'f9b1ed7f-f288-4c3f-898c-59e84b1c8e69', NULL);

-- INSERT INTO "public"."channel_members" ("id", "created", "updated", "user_id", "channel_id", "last_viewed", "last_alert_triggered_time") VALUES 
-- (gen_random_uuid(), '2023-07-27 06:58:30.249+00', '2023-07-27 06:58:53.829+00', '5b861dfb-02df-4be1-bc67-41a21611f5e7', channel_id, '2023-07-27 06:58:53.829+00', NULL),
-- (gen_random_uuid(), '2023-07-27 06:58:30.249+00', '2023-07-27 06:58:53.829+00', '85e1300e-003c-4e96-987b-23812f902477', channel_id, '2023-07-27 06:58:53.829+00', NULL),
-- (gen_random_uuid(), '2023-07-27 06:58:30.249+00', '2023-07-27 06:58:53.829+00', 'ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', channel_id, '2023-07-27 06:58:53.829+00', NULL),
-- (gen_random_uuid(), '2023-07-27 06:58:30.249+00', '2023-07-27 06:58:53.829+00', 'f9b1ed7f-f288-4c3f-898c-59e84b1c8e69', channel_id, '2023-07-27 06:58:53.829+00', NULL),
-- (gen_random_uuid(), '2023-07-27 06:58:30.249+00', '2023-07-27 06:58:53.829+00', '41d52254-a2b8-4ea4-9ded-bfbfe9671578', channel_id, '2023-07-27 06:58:53.829+00', NULL),
-- (gen_random_uuid(), '2023-07-27 06:58:30.249+00', '2023-07-27 06:58:53.829+00', '7f2fb549-51c0-49d5-844d-8a2fbbbbc0ad', channel_id, '2023-07-27 06:58:53.829+00', NULL),
-- (gen_random_uuid(), '2023-07-27 06:58:30.249+00', '2023-07-27 06:58:53.829+00', 'dcabc94f-eb6e-49bb-97d3-fc1a38f9408c', channel_id, '2023-07-27 06:58:53.829+00', NULL),
-- (gen_random_uuid(), '2023-07-27 06:58:30.249+00', '2023-07-27 06:58:53.829+00', '231717dd-ba09-43d4-ac98-9d5542b27a0c', channel_id, '2023-07-27 06:58:53.829+00', NULL);

END $$
