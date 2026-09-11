import { type Db } from '@coko/server'

/**
 * Rewrites the trigger that builds the search columns so that:
 * - we do not search from tables other than manuscripts and the form config
 *    (eg. team members, invitations, users)
 * - custom form fields that have options (eg. radio buttons, select) are
 *    searchable by their labels (what the users can see) and not their internal
 *    option values
 */

const previousTriggerFunctionSql = `
  CREATE OR REPLACE FUNCTION manuscripts_searchable_text_trigger() RETURNS trigger AS $$
  DECLARE
    a TEXT;
    b TEXT;
    c TEXT;
    authors JSON;
    author JSON;
    authorstext TEXT := '';
    member RECORD;
    memberstext TEXT := '';
    invitee RECORD;
    inviteestext TEXT := '';
    submittertext TEXT := '';
  BEGIN
    authors := COALESCE(NULLIF(new.submission->>'$authors',''), '[]')::JSON;
    FOR author IN SELECT * FROM json_array_elements(authors) LOOP
      authorstext = concat(
        authorstext,
        concat_ws(', ',
          concat_ws(' ', author->>'firstName', author->>'lastName'),
          author->>'email',
          author->>'affiliation'
        ),
        '; '
      );
    END LOOP;

    FOR member IN SELECT username, email
      FROM teams t, team_members tm, users u
      WHERE t.object_id = new.id AND tm.team_id = t.id AND u.id = tm.user_id
    LOOP
      memberstext := concat(memberstext, member.username, ' ', member.email, '; ');
    END LOOP;

    FOR invitee IN SELECT invited_person_name, to_email
      FROM invitations i
      WHERE i.manuscript_id = new.id
    LOOP
      inviteestext := concat(inviteestext, invitee.invited_person_name, ' ', invitee.to_email, '; ');
    END LOOP;

    submittertext := (SELECT concat_ws(', ', username, email) FROM users WHERE users.id = new.submitter_id);

    a := concat_ws(E'\\n',
      new.submission->>'$title',
      new.submission->>'$abstract',
      new.submission->>'$doi'
    );
    b := concat_ws(E'\\n',
      authorstext,
      memberstext,
      inviteestext,
      submittertext,
      new.short_id,
      concatenate_text_values(new.submission - '$authors' - '$title' - '$abstract' - '$doi')
    );
    c := concat(new.meta->>'source');

    new.search_tsvector :=
      setweight(to_tsvector('english', a), 'A') ||
      setweight(to_tsvector('english', b), 'B') ||
      setweight(to_tsvector('english', c), 'C');
    new.searchable_text := concat_ws(E'\\n', a, b, c);

    RETURN new;
  END
  $$ LANGUAGE plpgsql;
`

const newTriggerFunctionSql = `
  CREATE OR REPLACE FUNCTION manuscripts_searchable_text_trigger() RETURNS trigger AS $$
  DECLARE
    a TEXT;
    b TEXT;
    c TEXT;
    option_labels_text TEXT := '';
    form_fields JSONB;
    form_field JSONB;
    field_name TEXT;
  BEGIN
    -- Highest ranking ('A') searchable text includes title, abstract, DOI
    a := concat_ws(E'\\n',
      new.submission->>'$title',
      new.submission->>'$abstract',
      new.submission->>'$doi'
    );

    -- Resolve the label(s) of any currently-selected option(s) on fields that have an 'options'
    -- list, so users can search by what they see (the label) rather than the stored option code.
    SELECT structure->'children' INTO form_fields
    FROM forms
    WHERE group_id = new.group_id AND purpose = 'submit' AND category = 'submission'
    LIMIT 1;

    IF form_fields IS NOT NULL THEN
      FOR form_field IN SELECT * FROM jsonb_array_elements(form_fields) LOOP
        IF jsonb_typeof(form_field->'options') = 'array'
           AND (form_field->>'name') LIKE 'submission.%' THEN
          field_name := substring(form_field->>'name' FROM 12);

          IF jsonb_exists(new.submission, field_name) THEN
            option_labels_text := concat_ws(E'\\n', option_labels_text,
              CASE jsonb_typeof(new.submission->field_name)
                WHEN 'array' THEN (
                  SELECT string_agg(COALESCE(
                    (SELECT o->>'label' FROM jsonb_array_elements(form_field->'options') o WHERE o->>'value' = elem.value),
                    elem.value
                  ), ' ')
                  FROM jsonb_array_elements_text(new.submission->field_name) AS elem(value)
                )
                ELSE COALESCE(
                  (SELECT o->>'label' FROM jsonb_array_elements(form_field->'options') o WHERE o->>'value' = (new.submission->>field_name)),
                  new.submission->>field_name
                )
              END
            );
          END IF;
        END IF;
      END LOOP;
    END IF;

    -- Middle ranking ('B') searchable text includes the manuscript's short ID, resolved option
    -- labels, plus all text fields (and sub-fields) from the submission object not covered above
    -- -- including authors.
    b := concat_ws(E'\\n',
      new.short_id,
      option_labels_text,
      concatenate_text_values(new.submission - '$title' - '$abstract' - '$doi')
    );
    -- Lowest ranking ('C') searchable text is the manuscript's typeset body (Wax editor HTML)
    c := concat(new.meta->>'source');

    new.search_tsvector :=
      setweight(to_tsvector('english', a), 'A') ||
      setweight(to_tsvector('english', b), 'B') ||
      setweight(to_tsvector('english', c), 'C');
    new.searchable_text := concat_ws(E'\\n', a, b, c);

    RETURN new;
  END
  $$ LANGUAGE plpgsql;
`

export async function up(db: Db): Promise<void> {
  await db.raw(newTriggerFunctionSql)

  // Force the trigger to regenerate search_tsvector/searchable_text on all existing rows.
  await db.raw('update manuscripts set updated = updated;')
}

export async function down(db: Db): Promise<void> {
  await db.raw(previousTriggerFunctionSql)
  await db.raw('update manuscripts set updated = updated;')
}
