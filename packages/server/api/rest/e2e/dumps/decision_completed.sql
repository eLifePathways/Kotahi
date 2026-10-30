DO $$
DECLARE
  g_id UUID;
BEGIN
SELECT object_id  INTO g_id FROM team_members JOIN teams ON teams.id  = team_members.team_id WHERE object_type = 'group' LIMIT 1;

-- -------------------------------------------------------------
-- Senior Editor Assigned 
-- -------------------------------------------------------------
-- Existing Manuscripts record is updated
INSERT INTO "public"."manuscripts" ("id", "created", "updated", "parent_id", "submitter_id", "status", "decision", "authors", "meta", "submission", "published", "type", "evaluations_hypothesis_map", "is_imported", "import_source", "import_source_server", "short_id", "submitted_date", "is_hidden","form_fields_to_publish", "searchable_text", "search_tsvector", "group_id") VALUES
('908587ed-c5f8-4532-aa56-bc94f805d336', '2022-09-13 14:07:25.565+00', '2022-09-14 06:47:32.971+00', NULL, 'ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', 'revise', 'revise', NULL, '{}', '{"$doi": "", "cover": "", "$title": "test pdf", "topics": [], "Funding": "", "$abstract": "", "datacode": "", "objectType": "", "references": "", "$authors": "", "dateAccepted": "", "dateReceived": "", "copyrightYear": "", "datePublished": "", "DecisionLetter": "", "copyrightHolder": "", "reviewingEditor": "", "EditorsEvaluation": "", "competingInterests": "", "copyrightStatement": "", "authorContributions": "", "AuthorCorrespondence": ""}', NULL, 'Manuscript', NULL, NULL, NULL, NULL, 12, '2022-09-13 14:07:32.475+00', false, '[]', 'test pdf', '"2":9B "demo":4B,7B "kotahi":3B,6B "pdf":2A "test":1A', g_id);
INSERT INTO "public"."files" ("id", "created", "updated", "type", "name", "stored_objects", "tags", "reference_id", "object_id", "alt", "upload_status", "caption") VALUES
('c3a9c3ee-9822-46da-97e6-e12bb8af6c1c', '2022-09-13 14:07:25.575+00', '2022-09-13 14:07:25.575+00', 'file', 'test-pdf.pdf', '[{"id": "1c28e52b-f5aa-443e-999a-41605340e37c", "key": "915c52f62e1f.pdf", "size": 187018, "type": "original", "mimetype": "application/pdf", "extension": "pdf", "imageMetadata": null}]', '["manuscript"]', NULL, '908587ed-c5f8-4532-aa56-bc94f805d336', NULL, NULL, NULL);
INSERT INTO "public"."channels" ("id", "manuscript_id", "created", "updated", "topic", "type", "group_id") VALUES
('90c5f618-ccc4-4be2-8a79-f396ca5582c7', '908587ed-c5f8-4532-aa56-bc94f805d336', '2022-09-13 14:07:25.575+00', '2022-09-13 14:07:25.575+00', 'Manuscript discussion', 'all', g_id),
('f1bdad7f-de4c-4833-87d5-27aa2838197f', '908587ed-c5f8-4532-aa56-bc94f805d336', '2022-09-13 14:07:25.575+00', '2022-09-13 14:07:25.575+00', 'Editorial discussion', 'editorial', g_id);
INSERT INTO "public"."messages" ("id", "user_id", "channel_id", "created", "updated", "content") VALUES
('43a31e42-3da6-4078-bc69-52565db09caf', 'ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', 'f1bdad7f-de4c-4833-87d5-27aa2838197f', '2022-09-13 14:07:32.462+00', '2022-09-13 14:07:32.462+00', 'Submission Confirmation Email sent by Kotahi to Emily Clay');
INSERT INTO "public"."teams" ("id", "created", "updated", "display_name", "role", "global", "type", "object_id", "object_type") VALUES
('62469169-e185-43e3-965c-3e4ecf3dcbcb', '2022-09-15 06:52:52.933+00', '2022-09-15 06:52:52.933+00', 'Author', 'author', 'f', 'team', '908587ed-c5f8-4532-aa56-bc94f805d336', 'manuscript'),
('84b65fa6-0ca9-42ee-92dc-e8c98307456b', '2022-09-15 06:53:16.324+00', '2022-09-15 06:53:16.324+00', 'Senior Editor', 'seniorEditor', 'f', 'team', '908587ed-c5f8-4532-aa56-bc94f805d336', 'manuscript');
INSERT INTO "public"."team_members" ("id", "created", "updated", "team_id", "user_id", "is_shared") VALUES
('e150f9c6-903a-4753-9934-26c4a74be188', '2022-09-13 14:07:25.582+00', '2022-09-13 14:07:25.582+00', '62469169-e185-43e3-965c-3e4ecf3dcbcb', 'ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', NULL);

INSERT INTO "public"."channel_members" ("id", "created", "updated", "user_id", "channel_id", "last_viewed", "last_alert_triggered_time") VALUES 
(gen_random_uuid(), '2023-07-27 06:58:30.249+00', '2023-07-27 06:58:53.829+00', '5b861dfb-02df-4be1-bc67-41a21611f5e7', 'f1bdad7f-de4c-4833-87d5-27aa2838197f', '2023-07-27 06:58:53.829+00', NULL),
(gen_random_uuid(), '2023-07-27 06:58:30.249+00', '2023-07-27 06:58:53.829+00', '85e1300e-003c-4e96-987b-23812f902477', 'f1bdad7f-de4c-4833-87d5-27aa2838197f', '2023-07-27 06:58:53.829+00', NULL),
(gen_random_uuid(), '2023-07-27 06:58:30.249+00', '2023-07-27 06:58:53.829+00', 'ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', '90c5f618-ccc4-4be2-8a79-f396ca5582c7', '2023-07-27 06:58:53.829+00', NULL),
(gen_random_uuid(), '2023-07-27 06:58:30.249+00', '2023-07-27 06:58:53.829+00', 'f9b1ed7f-f288-4c3f-898c-59e84b1c8e69', 'f1bdad7f-de4c-4833-87d5-27aa2838197f', '2023-07-27 06:58:53.829+00', NULL),
(gen_random_uuid(), '2023-07-27 06:58:30.249+00', '2023-07-27 06:58:53.829+00', '41d52254-a2b8-4ea4-9ded-bfbfe9671578', 'f1bdad7f-de4c-4833-87d5-27aa2838197f', '2023-07-27 06:58:53.829+00', NULL),
(gen_random_uuid(), '2023-07-27 06:58:30.249+00', '2023-07-27 06:58:53.829+00', '7f2fb549-51c0-49d5-844d-8a2fbbbbc0ad', 'f1bdad7f-de4c-4833-87d5-27aa2838197f', '2023-07-27 06:58:53.829+00', NULL),
(gen_random_uuid(), '2023-07-27 06:58:30.249+00', '2023-07-27 06:58:53.829+00', 'dcabc94f-eb6e-49bb-97d3-fc1a38f9408c', 'f1bdad7f-de4c-4833-87d5-27aa2838197f', '2023-07-27 06:58:53.829+00', NULL);

-- -------------------------------------------------------------
-- Reviewers Invited 
-- -------------------------------------------------------------
INSERT INTO "public"."reviews" ("id", "created", "updated", "is_decision", "user_id", "manuscript_id", "type", "is_hidden_from_author", "is_hidden_reviewer_name", "can_be_published_publicly", "json_data") VALUES
('35c327cb-8320-4619-a7cd-003033bc5a5d', '2022-09-14 05:42:07.657+00', '2022-09-14 05:42:07.657+00', 'f', '5b861dfb-02df-4be1-bc67-41a21611f5e7', '908587ed-c5f8-4532-aa56-bc94f805d336', 'Review', 't', 't', 'f', '{"comment": "<p class=\"paragraph\">Disparity of the time-frame for negative and positive trial is too high. The article has a time-lag bias</p>"}'),
('8ec28451-31fc-46cb-bbcf-90ca9ba1ffff', '2022-09-14 05:41:51.664+00', '2022-09-14 05:41:51.664+00', 'f', 'ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', '908587ed-c5f8-4532-aa56-bc94f805d336', 'Review', 't', 't', 'f', '{"comment": "<p class=\"paragraph\">The paper looks good to me overall! I appreciate the meticulous presentation of data.</p>"}'),
('d892b8d3-41ba-432a-9142-f010eeb95825', '2022-09-14 05:42:20.529+00', '2022-09-14 05:42:20.529+00', 'f', '41d52254-a2b8-4ea4-9ded-bfbfe9671578', '908587ed-c5f8-4532-aa56-bc94f805d336', 'Review', 't', 't', NULL, '{}'),
('8724608a-bcfe-429b-b542-0a0059d55e6e', '2022-09-14 15:14:22.012+00', '2022-09-14 15:14:22.012+00', 'f', '7f2fb549-51c0-49d5-844d-8a2fbbbbc0ad', '908587ed-c5f8-4532-aa56-bc94f805d336', 'Review', 't', 't', 'f', '{"comment": "<p class=\"paragraph\">Please use a linear scale instead of a logarithmic one.</p>"}');
INSERT INTO "public"."teams" ("id", "created", "updated", "display_name", "role", "global", "type", "object_id", "object_type") VALUES
('4f26aac1-3f96-43d4-a41e-595b363fa524', '2022-09-13 14:46:58.148+00', '2022-09-13 14:46:58.148+00', 'Reviewers', 'reviewer', 'f', 'team', '908587ed-c5f8-4532-aa56-bc94f805d336', 'manuscript');
INSERT INTO "public"."team_members" ("id", "created", "updated", "status", "team_id", "user_id", "is_shared") VALUES
('63335151-176b-4142-80c9-1ea594d9edab', '2022-09-14 05:02:35.031+00', '2022-09-14 05:02:35.031+00', 'accepted', '4f26aac1-3f96-43d4-a41e-595b363fa524', '41d52254-a2b8-4ea4-9ded-bfbfe9671578', NULL),
('9b658252-fb7d-4f06-bca1-803783d5095b', '2022-09-14 05:02:38.57+00', '2022-09-14 05:02:38.57+00', 'invited', '4f26aac1-3f96-43d4-a41e-595b363fa524', 'dcabc94f-eb6e-49bb-97d3-fc1a38f9408c', NULL),
('a11d610c-4f0b-4747-9682-41dfee5b1316', '2022-09-14 05:02:36.849+00', '2022-09-14 15:14:26.379+00', 'completed', '4f26aac1-3f96-43d4-a41e-595b363fa524', '7f2fb549-51c0-49d5-844d-8a2fbbbbc0ad', NULL),
('d178722c-17c6-45b8-985b-a34ab39c61f5', '2022-09-13 14:47:01.485+00', '2022-09-13 14:47:01.485+00', 'rejected', '4f26aac1-3f96-43d4-a41e-595b363fa524', 'f9b1ed7f-f288-4c3f-898c-59e84b1c8e69', NULL),
('dae43250-ede2-462b-8fc9-7ef1054946db', '2022-09-13 14:46:59.657+00', '2022-09-14 05:42:15.728+00', 'completed', '4f26aac1-3f96-43d4-a41e-595b363fa524', '5b861dfb-02df-4be1-bc67-41a21611f5e7', NULL),
('e1c8af8d-fe86-48fd-afba-b5279705d5a5', '2022-09-13 14:46:58.15+00', '2022-09-14 05:42:05.211+00', 'completed', '4f26aac1-3f96-43d4-a41e-595b363fa524', 'ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', NULL);
INSERT INTO "public"."team_members" ("id", "created", "updated", "team_id", "user_id", "is_shared") VALUES
('910db2fa-0975-4f9e-93e5-49a88879a42c', '2022-09-13 14:46:57.459+00', '2022-09-13 14:46:57.459+00', '84b65fa6-0ca9-42ee-92dc-e8c98307456b', '85e1300e-003c-4e96-987b-23812f902477', NULL);

-- -------------------------------------------------------------
-- Three Reviews Completed 
-- -------------------------------------------------------------
-- New Revised Manuscript Recored is added 
INSERT INTO "public"."manuscripts" ("id", "created", "updated", "parent_id", "submitter_id", "status", "decision", "authors", "meta", "submission", "published", "type", "evaluations_hypothesis_map", "is_imported", "import_source", "import_source_server", "short_id", "submitted_date", "form_fields_to_publish", "group_id") VALUES
('2bca7987-b4d9-4a33-aa1a-ab4666d0942a', '2022-09-14 06:45:34.099+00', '2022-09-14 06:45:47.042+00', '908587ed-c5f8-4532-aa56-bc94f805d336', 'ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', 'accepted', 'accepted', NULL, '{}', '{"$doi": "", "cover": "", "$title": "test pdf", "topics": [], "Funding": "", "$abstract": "", "datacode": "", "objectType": "dataset", "references": "", "$authors": "", "dateAccepted": "", "dateReceived": "", "copyrightYear": "", "datePublished": "", "DecisionLetter": "", "copyrightHolder": "", "reviewingEditor": "", "EditorsEvaluation": "", "competingInterests": "", "copyrightStatement": "", "authorContributions": "", "AuthorCorrespondence": ""}', NULL, 'Manuscript', NULL, NULL, NULL, NULL, 12, '2022-09-13 14:07:32.475+00', '[]', g_id);

-- Channels for discussion are created after assigning Editor
INSERT INTO "public"."channels" ("id", "manuscript_id", "created", "updated", "topic", "type", "group_id") VALUES
('1ff6e083-2174-4a71-903f-1ad65c9e05b9', '2bca7987-b4d9-4a33-aa1a-ab4666d0942a', '2022-09-14 06:45:34.109+00', '2022-09-14 06:45:34.109+00', 'Editorial discussion', 'editorial', g_id),
('b7f43fb6-b0a5-42b6-ba45-c61d0c096ac2', '2bca7987-b4d9-4a33-aa1a-ab4666d0942a', '2022-09-14 06:45:34.108+00', '2022-09-14 06:45:34.108+00', 'Manuscript discussion', 'all', g_id);

-- New files are uploaded from the decision
INSERT INTO "public"."files" ("id", "created", "updated", "type", "name", "stored_objects", "tags", "reference_id", "object_id", "alt", "upload_status", "caption") VALUES
('62813649-bfca-47d5-9b73-c23ffef4bd69', '2022-09-14 06:45:26.576+00', '2022-09-14 06:45:26.576+00', 'file', 'test-pdf.pdf', '[{"id": "be87a3a1-d272-41b7-b677-35dd6dc15fcd", "key": "1432776e3bed.pdf", "size": 187018, "type": "original", "mimetype": "application/pdf", "extension": "pdf"}]', '["decision"]', NULL, '62879dfb-c04f-4206-abf3-1f7060794e39', NULL, NULL, NULL),
('9eed538f-4f91-4f42-8484-58aba35ad206', '2022-09-14 06:45:43.271+00', '2022-09-14 06:45:43.271+00', 'file', 'test-pdf.pdf', '[{"id": "691e2229-e873-4f6d-8867-d40240e75d36", "key": "261a6a639a35.pdf", "size": 187018, "type": "original", "mimetype": "application/pdf", "extension": "pdf"}]', '["decision"]', NULL, '0d16a291-cc62-46b6-a5cb-87d137690f62', NULL, NULL, NULL),
('d72af2a6-85d5-41d2-8c1e-0b7c71bb45b4', '2022-09-14 06:45:34.109+00', '2022-09-14 06:45:34.109+00', 'file', 'test-pdf.pdf', '[{"id": "1c28e52b-f5aa-443e-999a-41605340e37c", "key": "915c52f62e1f.pdf", "size": 187018, "type": "original", "mimetype": "application/pdf", "extension": "pdf", "imageMetadata": null}]', '["manuscript"]', NULL, '2bca7987-b4d9-4a33-aa1a-ab4666d0942a', NULL, NULL, NULL);

-- New messages for Submission Confirmation, Editor Decision added
INSERT INTO "public"."messages" ("id", "user_id", "channel_id", "created", "updated", "content") VALUES
('0a6501b5-ed55-4166-a664-6253b3b5a25a', 'ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', '1ff6e083-2174-4a71-903f-1ad65c9e05b9', '2022-09-14 06:45:43.889+00', '2022-09-14 06:45:43.889+00', 'Editor Decision sent by Kotahi to emily016'),
('d39c164d-3087-40db-99ab-a6006842839a', 'ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', '1ff6e083-2174-4a71-903f-1ad65c9e05b9', '2022-09-14 06:45:38.993+00', '2022-09-14 06:45:38.993+00', 'Submission Confirmation Email sent by Kotahi to emily016'),
('eb0d465c-5525-49d7-b9c9-e345d8009159', 'ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', 'f1bdad7f-de4c-4833-87d5-27aa2838197f', '2022-09-14 06:45:27.734+00', '2022-09-14 06:45:27.734+00', 'Editor Decision sent by Kotahi to emily016');

-- New reviews added
INSERT INTO "public"."reviews" ("id", "created", "updated", "is_decision", "user_id", "manuscript_id", "type", "is_hidden_from_author", "is_hidden_reviewer_name", "can_be_published_publicly", "json_data") VALUES
('0d16a291-cc62-46b6-a5cb-87d137690f62', '2022-09-14 06:45:41.913+00', '2022-09-14 06:45:41.913+00', 't', '85e1300e-003c-4e96-987b-23812f902477', '2bca7987-b4d9-4a33-aa1a-ab4666d0942a', 'Review', 'f', 'f', 'f', '{"files": ["9eed538f-4f91-4f42-8484-58aba35ad206"], "comment": "<p class=\"paragraph\">Great Paper!</p>", "$verdict": "accept"}'),
('62879dfb-c04f-4206-abf3-1f7060794e39', '2022-09-14 06:45:21.694+00', '2022-09-14 06:45:21.694+00', 't', '85e1300e-003c-4e96-987b-23812f902477', '908587ed-c5f8-4532-aa56-bc94f805d336', 'Review', 'f', 'f', 'f', '{"files": ["62813649-bfca-47d5-9b73-c23ffef4bd69"], "comment": "<p class=\"paragraph\">Please fix Foo in the Paper!</p>", "$verdict": "revise"}');

-- Teams every manuscript has, one per manuscript role
INSERT INTO "public"."teams" ("id", "created", "updated", "display_name", "role", "global", "type", "object_id", "object_type") VALUES
('57ca6227-89b3-5d1b-bd8a-8a44b3318bec', '2022-09-13 14:07:25.565+00', '2022-09-13 14:07:25.565+00', 'Collaborative Reviewers', 'collaborativeReviewer', 'f', 'team', '908587ed-c5f8-4532-aa56-bc94f805d336', 'manuscript'),
('f4690e4a-dbd8-5540-be3d-c66ff8d1a64f', '2022-09-13 14:07:25.565+00', '2022-09-13 14:07:25.565+00', 'Editor', 'editor', 'f', 'team', '908587ed-c5f8-4532-aa56-bc94f805d336', 'manuscript'),
('9612cc38-a2bd-5a93-acf5-0b9b92a08823', '2022-09-13 14:07:25.565+00', '2022-09-13 14:07:25.565+00', 'Handling Editor', 'handlingEditor', 'f', 'team', '908587ed-c5f8-4532-aa56-bc94f805d336', 'manuscript'),
('5f85f7fc-6eb8-5da3-9028-a70522248bb2', '2022-09-13 14:07:25.565+00', '2022-09-13 14:07:25.565+00', 'Managing Editor', 'managingEditor', 'f', 'team', '908587ed-c5f8-4532-aa56-bc94f805d336', 'manuscript'),
('1410ad09-d5d7-5b47-8aa8-554a3492f19e', '2022-09-14 06:45:34.099+00', '2022-09-14 06:45:34.099+00', 'Author', 'author', 'f', 'team', '2bca7987-b4d9-4a33-aa1a-ab4666d0942a', 'manuscript'),
('ec0c49dd-81f7-53cd-9901-e9bb19e3304c', '2022-09-14 06:45:34.099+00', '2022-09-14 06:45:34.099+00', 'Reviewers', 'reviewer', 'f', 'team', '2bca7987-b4d9-4a33-aa1a-ab4666d0942a', 'manuscript'),
('2ef62541-41c3-59f6-be50-27d046910920', '2022-09-14 06:45:34.099+00', '2022-09-14 06:45:34.099+00', 'Collaborative Reviewers', 'collaborativeReviewer', 'f', 'team', '2bca7987-b4d9-4a33-aa1a-ab4666d0942a', 'manuscript'),
('c1ac234a-e1de-5e0f-9e83-5943f6dbc0c3', '2022-09-14 06:45:34.099+00', '2022-09-14 06:45:34.099+00', 'Editor', 'editor', 'f', 'team', '2bca7987-b4d9-4a33-aa1a-ab4666d0942a', 'manuscript'),
('928155be-3460-59aa-b680-f992a280c45a', '2022-09-14 06:45:34.099+00', '2022-09-14 06:45:34.099+00', 'Senior Editor', 'seniorEditor', 'f', 'team', '2bca7987-b4d9-4a33-aa1a-ab4666d0942a', 'manuscript'),
('256e65ea-1aee-5cb3-ab90-d596acf7b8df', '2022-09-14 06:45:34.099+00', '2022-09-14 06:45:34.099+00', 'Handling Editor', 'handlingEditor', 'f', 'team', '2bca7987-b4d9-4a33-aa1a-ab4666d0942a', 'manuscript'),
('a95c649e-5ef3-568d-ad23-40b5d27119ad', '2022-09-14 06:45:34.099+00', '2022-09-14 06:45:34.099+00', 'Managing Editor', 'managingEditor', 'f', 'team', '2bca7987-b4d9-4a33-aa1a-ab4666d0942a', 'manuscript');

END $$;
