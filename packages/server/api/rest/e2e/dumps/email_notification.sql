DO $$
DECLARE
  g_id UUID;
  admin_team_id UUID;
  gm_team_id UUID;
  user_team_id UUID;
BEGIN
SELECT id INTO g_id FROM groups WHERE name='prc' LIMIT 1;
SELECT id INTO admin_team_id FROM teams
  WHERE global IS TRUE AND role='admin' LIMIT 1;
SELECT id INTO gm_team_id FROM teams
  WHERE object_id=g_id AND role='groupManager' LIMIT 1;
SELECT id INTO user_team_id FROM teams
  WHERE object_id=g_id AND role='user' LIMIT 1;

UPDATE configs SET form_data = '{"user": {"isAdmin": false, "kotahiApiTokens": "test:123456"}, "report": {"showInMenu": true}, "review": {"showSummary": true}, "dashboard": {"showSections": ["submission", "review", "editor"], "loginRedirectUrl": "/dashboard"}, "manuscript": {"labelColumn": true, "tableColumns": "titleAndAbstract, created, updated, status, submission.$customStatus, author", "newSubmission": true, "paginationCount": 10, "archivePeriodDays": 60, "autoImportHourUtc": 21, "semanticScholarImportsRecencyPeriodDays": 42}, "publishing": {"webhook": {"ref": "test", "url": "https://someserver/webhook-address", "token": "test"}, "crossref": {"login": "test", "password": "test", "doiPrefix": "10.12345/", "licenseUrl": "test", "registrant": "test", "useSandbox": true, "journalName": "test", "depositorName": "test", "depositorEmail": "test@coko.foundation", "journalHomepage": "test", "publicationType": "article", "journalAbbreviatedName": "test", "publishedArticleLocationPrefix": "test"}, "hypothesis": {"group": null, "apiKey": null, "reverseFieldOrder": true, "shouldAllowTagging": true}}, "submission": {"allowAuthorsSubmitNewVersion": true}, "taskManager": {"teamTimezone": "Etc/UTC"}, "controlPanel": {"showTabs": ["Team", "Decision", "Reviews", "Manuscript text", "Metadata", "Tasks & Notifications"], "hideReview": true, "editorsCanPublish": true, "groupManagersCanPublish": true, "sharedReview": true, "displayManuscriptShortId": true}, "instanceName": "prc", "notification": {}, "groupIdentity": {"logoPath": "/biophysics-colab.png", "brandName": "Colab", "primaryColor": "#bc2325", "secondaryColor": "#bc2325"}, "eventNotification": {"reviewerInvitationPrimaryEmailTemplate": "ae7e01ca-fa91-4155-a248-a8b9f38c80a3"}}'
WHERE group_id = g_id;

INSERT INTO "public"."users" ("id", "created", "updated", "admin", "email", "username", "password_hash", "teams", "password_reset_token", "password_reset_timestamp", "type", "profile_picture", "online", "last_online") VALUES
('716a83b2-9749-4933-9418-fca2544f5282', '2022-08-10 02:19:19.125+00', '2022-08-10 02:22:49.437+00', NULL, 'emily@kotahiexample.com', 'Emily Clay', NULL, NULL, NULL, NULL, 'user', NULL, NULL, NULL),
('9160da05-15ce-4836-8cb2-45c6c1855318', '2022-08-10 02:15:11.329+00', '2022-08-10 02:15:29.074+00', 't', 'elaineb@example.com', 'Elaine Barnes', NULL, NULL, NULL, NULL, 'user', NULL, NULL, NULL),
('5b861dfb-02df-4be1-bc67-41a21611f5e7', '2022-05-14 10:31:35.715+00', '2022-08-23 14:55:02.854+00', NULL, 'joanep@example.com' , 'Joane Pilger' , NULL, NULL, NULL, NULL, 'user', NULL, NULL, NULL),
('f9b1ed7f-f288-4c3f-898c-59e84b1c8e69', '2022-05-13 10:54:12.651+00', '2022-08-23 14:55:09.39+00' , 't' , 'sineads@example.com', 'Sinead Sullivan', NULL, NULL, NULL, NULL, 'user', NULL, NULL, NULL),
('41d52254-a2b8-4ea4-9ded-bfbfe9671578', '2022-09-14 02:51:58.817+00', '2022-09-14 02:53:20.544+00', NULL, 'sherry@example.com' , 'Sherry Crofoot', NULL, NULL, NULL, NULL, 'user', NULL, NULL, NULL),
('7f2fb549-51c0-49d5-844d-8a2fbbbbc0ad', '2022-09-14 02:50:09.737+00', '2022-09-14 02:50:25.118+00', NULL, 'gale@example.com'   , 'Gale Davis'  , NULL, NULL, NULL, NULL, 'user', NULL, NULL, NULL),
('dcabc94f-eb6e-49bb-97d3-fc1a38f9408c', '2022-09-14 02:51:21.741+00', '2022-09-14 02:51:29.283+00', NULL, 'david@example.com'  , 'David Miller' , NULL, NULL, NULL, NULL, 'user', NULL, NULL, NULL);


INSERT INTO "public"."identities" ("id", "user_id", "created", "updated", "type", "identifier", "name", "aff", "oauth", "is_default") VALUES
(gen_random_uuid(), '9160da05-15ce-4836-8cb2-45c6c1855318', '2022-08-10 02:15:11.34+00', '2022-08-10 02:15:11.34+00', 'orcid', '0000-0002-5641-5729', 'Elaine Barnes', '', '{"accessToken": "f249c0af-fe12-417b-acf2-24049cde3e9f", "refreshToken": "a2069211-47f9-42fc-99af-c6e6e3386a5b"}', 't'),
(gen_random_uuid(), '716a83b2-9749-4933-9418-fca2544f5282', '2022-08-10 02:19:19.129+00', '2022-08-10 02:19:19.129+00', 'orcid','0000-0002-0564-2016', 'Emily Clay', '', '{"accessToken": "0e90d1c2-41bf-4c46-8211-aef6d5a09ee3", "refreshToken": "103bc52b-4ee4-455b-a2ca-7f2cbc5649a8"}', 't'),
(gen_random_uuid(), '5b861dfb-02df-4be1-bc67-41a21611f5e7', '2022-07-29 05:15:21.654+00', '2022-07-29 05:15:21.624+00', 'orcid', '0000-0003-1838-2441', 'Joane Pilger'   , '', '{"accesstoken": "26fbc6b6-4421-40c5-ba07-d8c665f6704b", "refreshtoken": "4211bbf5-85ae-4980-833a-3f3deabcec6a"}', 't'),
(gen_random_uuid(), 'f9b1ed7f-f288-4c3f-898c-59e84b1c8e69', '2022-05-13 10:54:12.655+00', '2022-05-13 10:54:12.655+00', 'orcid', '0000-0002-5641-5729', 'Sinead Sullivan', '', '{"accessToken": "e85acf35-dcbf-45b1-9bc3-5efb80a95ca9", "refreshToken": "3bd13cb6-b0c5-42df-98da-c0037185d085"}', 't'),
(gen_random_uuid(), '41d52254-a2b8-4ea4-9ded-bfbfe9671578', '2022-09-14 02:51:58.82+00' , '2022-09-14 02:51:58.82+00' , 'orcid', '0000-0002-7645-9921', 'Sherry Crofoot' , '', '{"accessToken": "1b6e59f2-276a-46f0-8198-b55e6ecf49d5", "refreshToken": "8fa0d45f-8e19-40e5-a93b-9088ed62f325"}', 't'),
(gen_random_uuid(), '7f2fb549-51c0-49d5-844d-8a2fbbbbc0ad', '2022-09-14 02:50:09.747+00', '2022-09-14 02:50:09.747+00', 'orcid', '0000-0001-5956-7341', 'Gale Davis'     , '', '{"accessToken": "1300952c-a4cc-4c44-ba23-df4295571689", "refreshToken": "f4ed08d1-930e-43f0-9463-0a45428d08f5"}', 't'),
(gen_random_uuid(), 'dcabc94f-eb6e-49bb-97d3-fc1a38f9408c', '2022-09-14 02:51:21.743+00', '2022-09-14 02:51:21.743+00', 'orcid', '0000-0002-9601-2254', 'David Miller'   , '', '{"accessToken": "a0829b38-4732-4f7c-961d-eac592dbfb07", "refreshToken": "581792f0-a925-4cdb-a491-a519af67273c"}', 't');


INSERT INTO "public"."teams" ("id", "created", "updated", "name", "role", "members", "owners", "global", "type", "object_id", "object_type") VALUES
('0c00d183-ed7e-4273-b0a2-eb56c75de1f4', '2022-08-10 02:15:29.063+00', '2022-08-10 02:15:29.063+00', 'Author', 'author', NULL, NULL, NULL, 'team', '10bc66ee-dc1a-4ac2-82d1-b37cd8e0fc15', 'manuscript');
-- ('125d6ad4-b81e-4320-9934-f29289cb49d6', '2022-08-10 02:15:29.063+00', '2022-08-10 02:15:29.063+00', 'User', 'user', NULL, NULL, false, 'team', 'a6303daa-fc03-4257-99e5-f4579fea4be8', 'Group'),
-- ('eb61876a-fee2-44cf-a6a9-9cdca2f1b398', '2022-08-10 02:15:29.063+00', '2022-08-10 02:15:29.063+00', 'Group Manager', 'groupManager', NULL, NULL, false, 'team', 'a6303daa-fc03-4257-99e5-f4579fea4be8', 'Group');


INSERT INTO "public"."team_members" ("id", "created", "updated", "status", "team_id", "user_id", "alias_id", "is_shared") VALUES
(gen_random_uuid(), '2022-08-10 02:15:29.071+00', '2022-08-10 02:15:29.071+00', NULL, user_team_id, '716a83b2-9749-4933-9418-fca2544f5282', NULL, NULL),
(gen_random_uuid(), '2022-08-10 02:15:29.071+00', '2022-08-10 02:15:29.071+00', NULL, user_team_id, '9160da05-15ce-4836-8cb2-45c6c1855318', NULL, NULL),
(gen_random_uuid(), '2022-08-10 02:15:29.071+00', '2022-08-10 02:15:29.071+00', NULL, '0c00d183-ed7e-4273-b0a2-eb56c75de1f4', '9160da05-15ce-4836-8cb2-45c6c1855318', NULL, NULL),
(gen_random_uuid(), '2022-08-10 02:15:29.071+00', '2022-08-10 02:15:29.071+00', NULL, gm_team_id, '9160da05-15ce-4836-8cb2-45c6c1855318', NULL, NULL),
(gen_random_uuid(), '2022-08-10 02:15:29.071+00', '2022-08-10 02:15:29.071+00', NULL, user_team_id, '5b861dfb-02df-4be1-bc67-41a21611f5e7', NULL, NULL),
(gen_random_uuid(), '2022-08-10 02:15:29.071+00', '2022-08-10 02:15:29.071+00', NULL, user_team_id, 'f9b1ed7f-f288-4c3f-898c-59e84b1c8e69', NULL, NULL),
(gen_random_uuid(), '2022-08-10 02:15:29.071+00', '2022-08-10 02:15:29.071+00', NULL, user_team_id, '41d52254-a2b8-4ea4-9ded-bfbfe9671578', NULL, NULL),
(gen_random_uuid(), '2022-08-10 02:15:29.071+00', '2022-08-10 02:15:29.071+00', NULL, user_team_id, '7f2fb549-51c0-49d5-844d-8a2fbbbbc0ad', NULL, NULL),
(gen_random_uuid(), '2022-08-10 02:15:29.071+00', '2022-08-10 02:15:29.071+00', NULL, user_team_id, 'dcabc94f-eb6e-49bb-97d3-fc1a38f9408c', NULL, NULL);

INSERT INTO "public"."manuscripts" ("id", "created", "updated", "parent_id", "submitter_id", "status", "decision", "authors", "meta", "submission", "published", "type", "evaluations_hypothesis_map", "is_imported", "import_source", "import_source_server", "short_id", "submitted_date", "form_fields_to_publish", "group_id") VALUES
('10bc66ee-dc1a-4ac2-82d1-b37cd8e0fc15', '2022-08-10 02:15:29.046+00', '2022-08-10 02:18:54.218+00', NULL, '9160da05-15ce-4836-8cb2-45c6c1855318', 'submitted', NULL, NULL, '{}', '{"$doi": "", "$sourceUri": "www.kotahi-test-example.com/doi", "$title": "Demo Title", "$customStatus": "", "topics": [], "journal": "", "ourTake": "<p class=\"paragraph\">luctus vel augue a, fermentum volutpat mauris. Curabitur ultrices purus id mauris gravida aliquet. Quisque scelerisque ut massa eu sollicitudin. Sed egestas nibh ac lacinia facilisis.</p>", "$abstract": "<p class=\"paragraph\">ABSTRACT Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis eleifend odio et convallis posuere. Aliquam quis porta erat, in hendrerit lorem. Fusce eu mauris tortor ABSTRACT</p>", "$editDate": "2022-08-10", "keywords": "In hac habitasse platea dictumst", "firstAuthor": " Nulla enim nulla", "limitations": "<p class=\"paragraph\">Donec aliquam leo vitae est lacinia, non elementum felis tempus</p>", "mainFindings": "<p class=\"paragraph\">Morbi sit amet dolor eget odio interdum efficitur vitae et leo.</p>", "datePublished": "12/12/12", "reviewCreator": "Pellentesque tincidunt ", "studyStrengths": "<p class=\"paragraph\">Curabitur vel fermentum sem.</p>"}', NULL, 'Manuscript', NULL, NULL, NULL, NULL, 1, '2022-08-10 02:18:54.218+00', '[]', g_id);

INSERT INTO "public"."channels" ("id", "manuscript_id", "created", "updated", "topic", "type", "group_id") VALUES
(gen_random_uuid(), '10bc66ee-dc1a-4ac2-82d1-b37cd8e0fc15', '2022-08-10 02:15:29.063+00', '2022-08-10 02:15:29.063+00', 'Editorial discussion', 'editorial', g_id),
(gen_random_uuid(), '10bc66ee-dc1a-4ac2-82d1-b37cd8e0fc15', '2022-08-10 02:15:29.063+00', '2022-08-10 02:15:29.063+00', 'Manuscript discussion', 'all', g_id);

INSERT INTO "public"."files" ("id", "created", "updated", "type", "name", "stored_objects", "tags", "reference_id", "object_id", "alt", "upload_status", "caption") VALUES
('d0009388-f77b-45ca-9fea-7c426f93d888', '2022-08-10 02:15:29.063+00', '2022-08-10 02:15:29.063+00', 'file', 'demo.pdf', '[{"id": "cb186b0b-bbf6-467c-a939-7c9f8a87f627", "key": "fb9f7bfc1da0.pdf", "size": 115209, "type": "original", "mimetype": "application/pdf", "extension": "pdf", "imageMetadata": null}]', '["manuscript"]', NULL, '10bc66ee-dc1a-4ac2-82d1-b37cd8e0fc15', NULL, NULL, NULL);

-- Teams every manuscript has, one per manuscript role
INSERT INTO "public"."teams" ("id", "created", "updated", "display_name", "role", "global", "type", "object_id", "object_type") VALUES
('4bff8a7c-40a2-5e4f-8767-a349fbf34f43', '2022-08-10 02:15:29.046+00', '2022-08-10 02:15:29.046+00', 'Reviewers', 'reviewer', 'f', 'team', '10bc66ee-dc1a-4ac2-82d1-b37cd8e0fc15', 'manuscript'),
('1e8c5ca1-06f5-5240-9c08-ef8a864428e0', '2022-08-10 02:15:29.046+00', '2022-08-10 02:15:29.046+00', 'Collaborative Reviewers', 'collaborativeReviewer', 'f', 'team', '10bc66ee-dc1a-4ac2-82d1-b37cd8e0fc15', 'manuscript'),
('377ff055-c128-52cd-9899-f2e66ee8fcd2', '2022-08-10 02:15:29.046+00', '2022-08-10 02:15:29.046+00', 'Editor', 'editor', 'f', 'team', '10bc66ee-dc1a-4ac2-82d1-b37cd8e0fc15', 'manuscript'),
('5cc3ad77-b987-56ce-803e-20288ea62f7f', '2022-08-10 02:15:29.046+00', '2022-08-10 02:15:29.046+00', 'Senior Editor', 'seniorEditor', 'f', 'team', '10bc66ee-dc1a-4ac2-82d1-b37cd8e0fc15', 'manuscript'),
('b0bf09dd-a388-5b40-bd62-8379eb18a2bb', '2022-08-10 02:15:29.046+00', '2022-08-10 02:15:29.046+00', 'Handling Editor', 'handlingEditor', 'f', 'team', '10bc66ee-dc1a-4ac2-82d1-b37cd8e0fc15', 'manuscript'),
('7144b487-d15c-5ed7-9c8c-18a4d5cdbe8c', '2022-08-10 02:15:29.046+00', '2022-08-10 02:15:29.046+00', 'Managing Editor', 'managingEditor', 'f', 'team', '10bc66ee-dc1a-4ac2-82d1-b37cd8e0fc15', 'manuscript');

END $$