DO $$
DECLARE
  g_id UUID;
BEGIN
 SELECT object_id  INTO g_id FROM team_members JOIN teams ON teams.id  = team_members.team_id WHERE object_type = 'group' LIMIT 1;

-- New Manuscript is Added
INSERT INTO "public"."files" ("id", "created", "updated", "type", "name", "stored_objects", "tags", "reference_id", "object_id", "alt", "upload_status", "caption") VALUES
('c3a9c3ee-9822-46da-97e6-e12bb8af6c1c', '2022-09-13 14:07:25.575+00', '2022-09-13 14:07:25.575+00', 'file', 'test-pdf.pdf', '[{"id": "1c28e52b-f5aa-443e-999a-41605340e37c", "key": "915c52f62e1f.pdf", "size": 187018, "type": "original", "mimetype": "application/pdf", "extension": "pdf", "imageMetadata": null}]', '["manuscript"]', NULL, '908587ed-c5f8-4532-aa56-bc94f805d336', NULL, NULL, NULL);
INSERT INTO "public"."manuscripts" ("id", "created", "updated", "parent_id", "submitter_id", "status", "decision", "authors", "meta", "submission", "published", "type", "evaluations_hypothesis_map", "is_imported", "import_source", "import_source_server", "short_id", "submitted_date", "is_hidden","form_fields_to_publish", "searchable_text", "search_tsvector", "group_id") VALUES
('908587ed-c5f8-4532-aa56-bc94f805d336', '2022-09-13 14:07:25.565+00', '2022-09-13 14:07:32.971+00', NULL, 'ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', 'submitted', NULL, NULL, '{}', '{"$doi": "", "cover": "", "$title": "test pdf", "topics": [], "Funding": "", "$abstract": "", "datacode": "", "objectType": "", "references": "", "$authors": "", "dateAccepted": "", "dateReceived": "", "copyrightYear": "", "datePublished": "", "DecisionLetter": "", "copyrightHolder": "", "reviewingEditor": "", "EditorsEvaluation": "", "competingInterests": "", "copyrightStatement": "", "authorContributions": "", "AuthorCorrespondence": ""}', NULL, 'Manuscript', NULL, NULL, NULL, NULL, 12, '2022-09-13 14:07:32.475+00', false, '[]', 'test pdf', '"2":9B "demo":4B,7B "kotahi":3B,6B "pdf":2A "test":1A', g_id);

-- Channels for the new Manuscript
INSERT INTO "public"."channels" ("id", "manuscript_id", "created", "updated", "topic", "type", "group_id") VALUES
('90c5f618-ccc4-4be2-8a79-f396ca5582c7', '908587ed-c5f8-4532-aa56-bc94f805d336', '2022-09-13 14:07:25.575+00', '2022-09-13 14:07:25.575+00', 'Manuscript discussion', 'all', g_id),
('f1bdad7f-de4c-4833-87d5-27aa2838197f', '908587ed-c5f8-4532-aa56-bc94f805d336', '2022-09-13 14:07:25.575+00', '2022-09-13 14:07:25.575+00', 'Editorial discussion', 'editorial', g_id);
INSERT INTO "public"."messages" ("id", "user_id", "channel_id", "created", "updated", "content") VALUES
('43a31e42-3da6-4078-bc69-52565db09caf', 'ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', 'f1bdad7f-de4c-4833-87d5-27aa2838197f', '2022-09-13 14:07:32.462+00', '2022-09-13 14:07:32.462+00', 'Submission Confirmation Email sent by Kotahi to Emily Clay');

INSERT INTO "public"."channel_members" ("id", "created", "updated", "user_id", "channel_id", "last_viewed", "last_alert_triggered_time") VALUES 
(gen_random_uuid(), '2023-07-27 06:58:30.249+00', '2023-07-27 06:58:53.829+00', '5b861dfb-02df-4be1-bc67-41a21611f5e7', 'f1bdad7f-de4c-4833-87d5-27aa2838197f', '2023-07-27 06:58:53.829+00', NULL),
(gen_random_uuid(), '2023-07-27 06:58:30.249+00', '2023-07-27 06:58:53.829+00', '85e1300e-003c-4e96-987b-23812f902477', 'f1bdad7f-de4c-4833-87d5-27aa2838197f', '2023-07-27 06:58:53.829+00', NULL),
(gen_random_uuid(), '2023-07-27 06:58:30.249+00', '2023-07-27 06:58:53.829+00', 'ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', '90c5f618-ccc4-4be2-8a79-f396ca5582c7', '2023-07-27 06:58:53.829+00', NULL),
(gen_random_uuid(), '2023-07-27 06:58:30.249+00', '2023-07-27 06:58:53.829+00', 'f9b1ed7f-f288-4c3f-898c-59e84b1c8e69', 'f1bdad7f-de4c-4833-87d5-27aa2838197f', '2023-07-27 06:58:53.829+00', NULL),
(gen_random_uuid(), '2023-07-27 06:58:30.249+00', '2023-07-27 06:58:53.829+00', '41d52254-a2b8-4ea4-9ded-bfbfe9671578', 'f1bdad7f-de4c-4833-87d5-27aa2838197f', '2023-07-27 06:58:53.829+00', NULL),
(gen_random_uuid(), '2023-07-27 06:58:30.249+00', '2023-07-27 06:58:53.829+00', '7f2fb549-51c0-49d5-844d-8a2fbbbbc0ad', 'f1bdad7f-de4c-4833-87d5-27aa2838197f', '2023-07-27 06:58:53.829+00', NULL),
(gen_random_uuid(), '2023-07-27 06:58:30.249+00', '2023-07-27 06:58:53.829+00', 'dcabc94f-eb6e-49bb-97d3-fc1a38f9408c', 'f1bdad7f-de4c-4833-87d5-27aa2838197f', '2023-07-27 06:58:53.829+00', NULL);

-- New Team is created and Team Members are added
INSERT INTO "public"."teams" ("id", "created", "updated", "display_name", "role", "global", "type", "object_id", "object_type") VALUES
('62469169-e185-43e3-965c-3e4ecf3dcbcb', '2022-09-15 06:52:52.933+00', '2022-09-15 06:52:52.933+00', 'Author', 'author', 'f', 'team', '908587ed-c5f8-4532-aa56-bc94f805d336', 'manuscript'),
('84b65fa6-0ca9-42ee-92dc-e8c98307456b', '2022-09-15 06:53:16.324+00', '2022-09-15 06:53:16.324+00', 'Senior Editor', 'seniorEditor', NULL, 'team', '908587ed-c5f8-4532-aa56-bc94f805d336', 'manuscript');
INSERT INTO "public"."team_members" ("id", "created", "updated", "team_id", "user_id", "is_shared") VALUES
('9589d580-f183-44eb-8a61-96352df56692', '2022-09-13 14:08:06.689+00', '2022-09-13 14:08:06.689+00', '84b65fa6-0ca9-42ee-92dc-e8c98307456b', '85e1300e-003c-4e96-987b-23812f902477', NULL),
('e150f9c6-903a-4753-9934-26c4a74be188', '2022-09-13 14:07:25.582+00', '2022-09-13 14:07:25.582+00', '62469169-e185-43e3-965c-3e4ecf3dcbcb', 'ba84de0d-d3d5-49e9-ae1b-e8a265789fbe', NULL);

END $$;
