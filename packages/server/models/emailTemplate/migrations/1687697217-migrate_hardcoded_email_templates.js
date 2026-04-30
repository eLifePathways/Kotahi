const { useTransaction } = require('@coko/server')

const EmailTemplate = require('../emailTemplate.model')
const TaskEmailNotification = require('../../taskEmailNotification/taskEmailNotification.model')
const TaskEmailNotificationLog = require('../../taskEmailNotificationLog/taskEmailNotificationLog.model')

const defaultEmailTemplates = require('../../../config/defaultEmailTemplates')

const existingEmailTemplates = async () => {
  let templates = []

  if (
    process.env.USE_APERTURE_EMAIL &&
    process.env.USE_APERTURE_EMAIL.toLowerCase() === 'true'
  ) {
    templates = [
      {
        emailTemplateKey: 'reviewInvitationEmailTemplate',
        description: 'Peer-Review Invitation Assignment notification',
        subject: 'Aperture Neuro Peer-Reviewer Invitation Email',
        cc: 'aperture@humanbrainmapping.org',
        ccEditors: false,
        body: `<p>
        <p>Dear {{ recipientName }},</p>
        <p>I am writing to invite you to peer-review a new submission for Aperture Neuro, a new open access publishing platform powered by the Organization for Human Brain Mapping. I would like to invite you to review the following Research Object:</p>
        <p>“{{ manuscriptNumber }}; {{ manuscriptTitle }}, {{ authorName }}”</p>
        <p>If you are interested in reviewing this submission, please complete the following:</p>
        <ol>
          <li>Complete this Survey at <a href="https://www.surveymonkey.com/r/ApertureInvite" target="_blank">https://www.surveymonkey.com/r/ApertureInvite</a> indicating whether you accept the review.</li>
          <li>Log into {{{ loginLink }}} with your Orcid ID and set up your profile. Once your profile is set up, you will receive a notification that the submission is ready to review.</li>
        </ol>
        <p>If you have questions about Aperture, the review process, or the submission, please contact the journal manager at <a href="mailto:aperture@humanbrainmapping.org">aperture@humanbrainmapping.org</a>.</p>
        <p>Thank you,</p>
        <p>{{ senderName }}</p>
        <p>Handling Editor <br>
        Aperture Neuro
        </p>
      </p>`,
      },
      {
        emailTemplateKey: 'adhocEditorAssignmentEmailTemplate',
        description: 'Adhoc EIC - Handling Editor Assignment notification',
        subject: 'Aperture Neuro Submission Ready for Handling Editor',
        cc: 'aperture@humanbrainmapping.org',
        ccEditors: false,
        body: `<p>
        <p>Dear {{ recipientName }},</p>
        <p>You have been assigned the following Research Object to Handle:</p>
        <p>“{{ manuscriptNumber }}; {{ manuscriptTitle }}, {{ authorName }}”</p>
        <p>To access the submission please log onto the Aperture Submission Kotahi platform at {{{ loginLink }}}.</p>
        <p>If you have any questions or trouble accessing the submission, please contact the Journal Manager at <a href="mailto:aperture@humanbrainmapping.org">aperture@humanbrainmapping.org</a>.</p>
        <p>Sincerely,</p>
        <p>Ad-hoc Editor-in-Chief <br>
        Aperture Neuro
        </p>
      </p>`,
      },
      {
        emailTemplateKey: 'authorInvitationEmailTemplate',
        type: 'authorInvitation',
        description: 'Author Invitation',
        subject: 'Kotahi | Permission to review',
        ccEditors: false,
        body: `<p>Dear {{ recipientName }},</p>
        <p>
          The manuscript titled ‘{{ manuscriptTitle }}’ has been selected for peer review. Click on the link below to accept or decline the invitation;
        </p>
        <p>{{{ acceptInviteLink }}}</p>
        <p>{{{ declineInviteLink }}}</p>
        <p>
          Please note; that you will require an ORCID account in order to log in. If you don’t already have an account, it takes 2 mins to <a href="https://orcid.org/register" target="_blank">register a new ORCID account here</a>. <br>
        </p>
        <p>Regards, <br>
          Kotahi team
        </p>`,
      },
      {
        emailTemplateKey: 'genericTaskNotificationEmailTemplate',
        description: 'Kotahi task notification',
        subject: 'Kotahi | Task notification',
        ccEditors: false,
        body: `<p>
        <p>Dear {{ recipientName }}</p>
        <p>A task requires your attention<br />
        {{{ manuscriptLink }}}
        </p>
        <p>Regards, <br>
          Kotahi team
        </p>`,
      },
      {
        emailTemplateKey: 'deputyEditorAssignmentEmailTemplate',
        description:
          'Mallar Chakravarty - Handling Editor Assignment notification template',
        subject: 'Aperture Neuro Submission Ready for Handling Editor',
        cc: 'aperture@humanbrainmapping.org',
        ccEditors: false,
        body: `<p>
        <p>Dear {{ recipientName }},</p>
        <p>You have been assigned the following Research Object to Handle:</p>
        <p>“{{ manuscriptNumber }}; {{ manuscriptTitle }}, {{ authorName }}”</p>
        <p>To access the submission please log onto the Aperture Submission Kotahi platform at {{{ loginLink }}}.</p>
        <p>If you have any questions or trouble accessing the submission, please contact the Journal Manager at <a href="mailto:aperture@humanbrainmapping.org">aperture@humanbrainmapping.org</a>.</p>
        <p>Thank you,</p>
        <p>Mallar Chakravarty, PhD</p>
        <p>Deputy Editor-in-Chief <br>
        Aperture Neuro
        </p>
      </p>`,
      },
      {
        emailTemplateKey: 'messageNotificationEmailTemplate',
        description: 'Message notification',
        subject: 'Aperture Neuro – Message Notification',
        cc: 'aperture@humanbrainmapping.org',
        ccEditors: false,
        body: `<p>
        <p>Dear {{ recipientName }},</p>
        <p>You have a message in Aperture Neuro regarding the Submission:</p>
        <p>“{{ manuscriptNumber }}; {{ manuscriptTitle }}, {{ authorName }}”</p>
        <p>Please log into the Aperture Neuro Submission Platform at {{{ loginLink }}} to review and respond to the message.</p>
        <p>Thank you,</p>
        <p>Aperture Neuro Team</p>
      </p>`,
      },
      {
        emailTemplateKey: 'reviewAssignmentEmailTemplate',
        description: 'Review Assignment notification',
        subject: 'Aperture Neuro – Submission Ready for Review',
        cc: 'aperture@humanbrainmapping.org',
        ccEditors: false,
        body: `<p>
        <p>Dear {{ recipientName }},</p>
        <p>Thank you for agreeing to review for Aperture Neuro. You have now been assigned to the following submission:</p>
        <p>“{{ manuscriptNumber }}; {{ manuscriptTitle }}, {{ authorName }}”</p>
        <p>You can access the full manuscript to review by logging into your dashboard at {{{ loginLink }}}.</p>
        <p>For any questions please contact the journal manager at <a href="mailto:aperture@humanbrainmapping.org">aperture@humanbrainmapping.org</a>.</p>
        <p>Thank you,</p>
        <p>Journal Manager <br>
        Aperture Neuro
        </p>
      </p>`,
      },
      {
        emailTemplateKey: 'reviewCompleteEmailTemplate',
        description: 'Review Complete notification',
        subject: 'Aperture Neuro – Review Process Complete',
        cc: 'aperture@humanbrainmapping.org',
        ccEditors: false,
        body: `<p>
        <p>Dear {{ recipientName }},</p>
        <p>I am pleased to report that Aperture Submission "{{ manuscriptTitle }}" has completed the Peer-Review phase. The next step is to make a recommendation to the Editor-in-Chief based on your personal assessment of the work and the feedback received from the Peer-Reviewers.</p>
        <p>To access the submission please log onto the Aperture Submission Kotahi platform at {{{ loginLink }}}. Please make your final recommendation using the Chat Feature.</p>
        <p>Thank you,</p>
        <p>Journal Manager <br>
        Aperture Neuro
        </p>
      </p>`,
      },
      {
        emailTemplateKey: 'reviewerInvitationEmailTemplate',
        type: 'reviewerInvitation',
        description: 'Reviewer Invitation',
        subject: 'Kotahi | Reviewer invitation',
        ccEditors: false,
        body: `<p>
        <p>Dear {{ recipientName }},</p>
        <p>
          You have been selected to peer review the manuscript titled “{{ manuscriptTitle }}”. Click on the link below to accept or decline the invitation;
        </p>
        <p>
          {{{ acceptInviteLink }}}
        </p>
        <p>
          {{{ declineInviteLink }}}
        </p>
        <p>
          Please note; that you will require an ORCID account in order to log in. If you don’t already have an account, it takes 2 mins to <a href="https://orcid.org/register" target="_blank">register a new ORCID account here</a>. <br>
        </p>
        <p>Regards, <br>
          Kotahi team
        </p>
      </p>`,
      },
      {
        emailTemplateKey: 'editorAssignmentEmailTemplate',
        description: 'Tonya White - Handling Editor Assignment notification',
        subject: 'Aperture Neuro Submission Ready for Handling Editor',
        cc: 'aperture@humanbrainmapping.org',
        ccEditors: false,
        body: `<p>
        <p>Dear {{ recipientName }},</p>
        <p>You have been assigned the following Research Object to Handle:</p>
        <p>“{{ manuscriptNumber }}; {{ manuscriptTitle }}, {{ authorName }}”</p>
        <p>To access the submission please log onto the Aperture Submission Kotahi platform at {{{ loginLink }}}.</p>
        <p>If you have any questions or trouble accessing the submission, please contact the Journal Manager at <a href="mailto:aperture@humanbrainmapping.org">aperture@humanbrainmapping.org</a>.</p>
        <p>Sincerely,</p>
        <p>Ad-hoc Editor-in-Chief <br>
        Aperture Neuro
        </p>
      </p>`,
      },
      {
        emailTemplateKey: 'reviewRejecEmailTemplate',
        description: 'Reviewer Rejected',
        subject: 'Reviewer has rejected review invitation',
        cc: 'aperture@humanbrainmapping.org',
        ccEditors: false,
        type: 'systemEmail',
        body: `<p>
        <p>Dear {{ recipientName }},</p>
        <p>Reviewer {{ reviewerName }} has rejected your review invitation. Please log into the publishing platform and invite another reviewer to the submission:</p>
        <p>“{{ manuscriptNumber }}; {{ manuscriptTitle }}, {{ authorName }}”</p>
        <p>Thank you,</p>
        <p>Aperture Neuro Team</p>
      </p>`,
      },
      {
        emailTemplateKey: 'evaluationCompleteEmailTemplate',
        description: 'Evaluation Completed',
        subject: 'The review of “{{ manuscriptTitle }}” is complete.',
        cc: 'aperture@humanbrainmapping.org',
        ccEditors: false,
        type: 'systemEmail',
        body: `<p>
        <p>Dear {{ recipientName }},</p>
        <p>Thank you for your submission to Aperture Neuro. The review of “{{ manuscriptNumber }}; {{ manuscriptTitle }}, {{ authorName }}” is complete. Click on the link below to access your feedback.</p>
        <p>{{{ loginLink }}}</p>
        <p>Thank you,</p>
        <p>Journal Manager <br>
        Aperture Neuro
        </p>
      </p>`,
      },
      {
        emailTemplateKey: 'submissionConfirmationEmailTemplate',
        description: 'Submission Confirmation',
        subject: 'Aperture Neuro – Received Research Object Submission',
        cc: 'aperture@humanbrainmapping.org',
        ccEditors: false,
        type: 'systemEmail',
        body: `<p>
        <p>Dear {{ recipientName }},</p>
        <p>Thank you for your submission.</p>
        <p>“{{ manuscriptNumber }}; {{ manuscriptTitle }}, {{ authorName }}”</p>
        <p>We have successfully received your Research Object, and it is currently under review. You can check the status of your submission at any time by logging into the publishing platform and navigating to your dashboard.</p>
        <p>If you have any questions, please contact the Aperture Neuro Journal Manager, at <a href="mailto:aperture@humanbrainmapping.org">aperture@humanbrainmapping.org</a>.</p>
        <p>Thank you,</p>
        </p>Journal Manager <br>
        Aperture Neuro
        </p>
      </p>`,
      },
      {
        emailTemplateKey: 'chatNotification',
        description: 'Chat notification',
        subject: 'Kotahi | Discussion notification',
        ccEditors: false,
        type: 'systemEmail',
        body: `<p>
        <p>Dear {{ recipientName }}</p>

        <p>You have new discussion messages. Click here to reply; {{{ discussionUrl }}}</p>
        <p>Want to change your notifications settings? Login to Kotahi and go to your profile page<br></p>
        <p>Regards, <br>
          Kotahi team
        </p>`,
      },
    ]
  } else if (
    process.env.USE_COLAB_EMAIL &&
    process.env.USE_COLAB_EMAIL.toLowerCase() === 'true'
  ) {
    templates = [
      {
        emailTemplateKey: 'authorInvitationEmailTemplate',
        type: 'authorInvitation',
        description: 'Author Invitation',
        subject:
          'Interest in your preprint from Biophysics Colab (in partnership with eLife)',
        cc: 'lesley@sciencecolab.org, swartzk@ninds.nih.gov',
        ccEditors: true,
        body: `<p>Dear {{ recipientName }}</p>
          <p>
            I'm writing to tell you about a new project that I hope you’ll be interested in, and offer you an opportunity to get involved.
          </p>
          <p>
          I’m a member of the launch team for <a href="https://www.sciencecolab.org/" target="_blank">Biophysics Colab</a>, a collaboration of biophysicists working in partnership with eLife to improve how research is evaluated. Later this year, we will launch a ‘publish, review, curate’ service that will support authors to create citeable, indexed versions of their work from published preprints. Until then, we are leveraging the knowledge and expertise of the global biophysics community to provide a <b>free preprint review service</b> that provides constructive, journal-agnostic feedback to authors.
          </p>
          <p>
            We were interested to read your recent preprint “{{ manuscriptTitle }}” and would be grateful for an opportunity to review it. We would share our consolidated feedback with you at the earliest convenience, then offer you the opportunity to associate it with your preprint on bioRxiv and eLife’s <a href="https://sciety.org/groups/biophysics-colab/lists" target="_blank">Sciety</a> platform. You would be under no obligation to publicly share the report, but we hope you will choose to do so.
          </p>
          <p>
            Your agreement to our service would not constitute submission to a journal therefore you would be at liberty to submit your paper for review elsewhere. Indeed, we realise you may have already done so, and this would not preclude your participation in our scheme. Furthermore, some authors have found that <a href="https://sciety.org/lists/ee7e738a-a1f1-465b-807c-132d273ca952" target="_blank">our public evaluations</a> have facilitated publication of their studies in traditional journals.
          </p>
          <p>
          Would you be interested in receiving expert feedback on your preprint? If so, please accept our invitation using the link below (see instructions at the foot of this message). If not, we’d be grateful if you let us know via the decline link. We’d be happy to arrange a video call if you’d like to learn more about Biophysics Colab before making a decision.
          </p>
          <p>{{{ acceptInviteLink }}}</p>
          <p>{{{ declineInviteLink }}}</p>
          <p>
            Please note that you will require an ORCID account in order to log in to our platform. If you don’t already have an ORCID, it takes two minutes to create one <a href="https://orcid.org/register" target="_blank">here</a>. <br>
          </p>
          <p>
            I look forward to hearing from you.
          </p>
          <p>
            Best regards <br>
            {{ senderName }}
          </p>
          <p>
            On behalf of Biophysics Colab <br>
            <a href="https://www.sciencecolab.org/" target="_blank">www.sciencecolab.org</a>
          </p>
          <h3 style="margin-bottom: 2px;">Instructions for authors </h3>
          <p style="margin-top: 2px;">
            After clicking on ‘Accept invitation’, you will be asked to log in to our peer review platform using your ORCID account. If you don’t have an ORCID, it takes two minutes to create one <a href="https://orcid.org/register" target="_blank">here</a>. <br>
          </p>
          <p>
            Once logged in, please click on the name of the preprint on your dashboard, complete the submission information, then select ‘submit your research object’.</p>
          <p>
            Note that you can log in to our platform at any time by visiting<br>
            {{{ loginLink }}}
          </p>`,
      },
      {
        emailTemplateKey: 'consolidatedReportWithAuthorsTemplate',
        description: 'Share consolidated report with authors',
        subject: 'Report from Biophysics Colab',
        cc: 'lesley@sciencecolab.org, swartzk@ninds.nih.gov',
        ccEditors: true,
        body: `<p>
          <p>Dear {{ recipientName }}</p>

          <p>Thank you for the opportunity to review your recent preprint “{{ manuscriptTitle }}”.</p>

          <p>I’m pleased to let you know that experts in the field have now reviewed and discussed the work, and have approved a consolidated report that you can view at {{{ manuscriptLink }}}.</p>

          <p>You’ll see that we have not made any judgements about the suitability of your study for a particular journal, but have articulated its strengths and provided feedback that we believe will tighten its interpretation. I’d be happy to discuss the points we’ve raised, particularly if there’s been a misunderstanding.</p>

          <p>After considering our advice, we recommend that you take three actions:</p>

          <ol>
            <li>
              <p>Make the report publicly available</p>
              <p>We hope you’ll agree that it will be informative for other researchers to post our consolidated report on bioRxiv and highlight your work and our feedback in our list of <a href="https://sciety.org/lists/ee7e738a-a1f1-465b-807c-132d273ca952" target="_blank">evaluated articles on Sciety</a>. You can request this using the chat function after logging in to our platform and we will arrange for the report (including the names of all signatories but excluding minor and presentational issues) to be posted at the earliest opportunity.</p>
              <p>Of course, you are under no obligation to make the report public and can instead request that it remain confidential. Please note, however, that we ask our reviewers to treat the consolidated report as a confidential document until the point of public posting, and therefore ask that you share it only with your co-authors until such a time.</p>
            </li>
            <li>
              <p>Post your response to the report</p>
              <p>We would naturally be happy to post your response to the reviewers’ comments alongside the consolidated report on both bioRxiv and Sciety; simply provide your response after logging in to our platform ({{{ manuscriptLink }}}) and we will post it at the first opportunity. Please use “block quote" from the drop-down styling menu to quote from our report</p>
            </li>
            <li>
              <p>Submit a revised preprint for curation</p>
              <p>We anticipate that you will want to revise your manuscript after reading our advice and encourage you to upload any revision as a revised preprint. This will provide us with an opportunity to ‘curate’ your study by posting our overall evaluation of the work, as we have outlined in the preliminary evaluation statement available at {{{ manuscriptLink }}}. If you are ready to finalise your work in this way, please log in to our platform and click on ‘Submit new version’ so that we can revise our evaluation statement appropriately and post it on bioRxiv and Sciety. If your revision addresses the essential revisions outlined in our consolidated report, we’ll add our endorsement to the evaluation and include the study in our list of <a href="https://sciety.org/lists/5ac3a439-e5c6-4b15-b109-92928a740812" target="_blank">endorsed articles on Sciety</a>.</p>
            </li>
          </ol>
          <p>Alternatively, if you would like further advice from our reviewing team before finalising your study, simply request that when you upload your revised preprint using the chat function.</p>
          <p>Thank you for the opportunity to review your interesting preprint.</p>
          <p></p>
          <p>Best regards<br/>{{ senderName }}</p>
          <p>On behalf of Biophysics Colab <br>
            <a href="https://www.sciencecolab.org/" target="_blank">www.sciencecolab.org</a>
          <p>`,
      },
      {
        emailTemplateKey: 'authorFollowUpSubmitRevisedPreprintTemplate',
        description: 'Follow-up with author to submit revised preprint',
        subject: 'We welcome submission of your revised preprint',
        cc: 'lesley@sciencecolab.org, swartzk@ninds.nih.gov',
        ccEditors: true,
        body: `<p>
          <p>Dear {{ recipientName }}</p>
          <p>Thank you for supporting Biophysics Colab and our mission to improve how research is evaluated by making our peer review report and your response to the comments publicly available.</p>
          <p>If you wish to seek further advice from our reviewing team on a revised version of your preprint, simply log in to our platform {{{ manuscriptLink }}} and click on ‘Submit new version’. The same action can be used if you would like to submit a final version for curation, in which case, we would post our evaluation statement on bioRxiv and Sciety. If this final version of your work addresses the points we outlined as essential in our consolidated report, we’d be happy to add our endorsement to the evaluation and include the work in our list of <a href="https://sciety.org/lists/5ac3a439-e5c6-4b15-b109-92928a740812" target="_blank">endorsed articles on Sciety</a>.</p>
          <p>We look forward to hearing how you would like to proceed.</p>
          <p>Best regards<br/>{{ senderName }}</p>
          <p>
            On behalf of Biophysics Colab <br>
            <a href="https://www.sciencecolab.org/" target="_blank">www.sciencecolab.org</a>
          <p>`,
      },
      {
        emailTemplateKey: 'genericTaskManagerUpdateNotificationTemplate',
        description: 'Task Manager Update Notification',
        subject: 'Biophysics Colab task notification',
        cc: 'lesley@sciencecolab.org, swartzk@ninds.nih.gov',
        ccEditors: false,
        body: `<p>
          <p>Dear {{ recipientName }}</p>
          <p>A Biophysics Colab task requires your attention. Please visit {{{ manuscriptLink }}} to action.</p>
          <p>Thank you</p>
          <p>On behalf of Biophysics Colab <br>
            <a href="https://www.sciencecolab.org/" target="_blank">www.sciencecolab.org</a>
          <p>`,
      },
      {
        emailTemplateKey: 'reportPublishedTemplate',
        description: 'Report published',
        subject: 'Report from Biophysics Colab now published',
        cc: 'lesley@sciencecolab.org, swartzk@ninds.nih.gov',
        ccEditors: false,
        body: `<p>
          <p>Dear {{ recipientName }}</p>
          <p>The report for the preprint by {{ authorName }} and colleagues has now been published and can be viewed in the list of <a href="https://sciety.org/lists/ee7e738a-a1f1-465b-807c-132d273ca952" target="_blank">articles evaluated by Biophysics Colab</a>.</p>
          <p>Thank you</p>
          <p>On behalf of Biophysics Colab <br>
            <a href="https://www.sciencecolab.org/" target="_blank">www.sciencecolab.org</a>
          <p>`,
      },
      {
        emailTemplateKey: 'reportsSharedTemplate',
        description: 'Report(s) shared',
        subject: 'Report(s) for Biophysics Colab available to view',
        cc: 'lesley@sciencecolab.org, swartzk@ninds.nih.gov',
        ccEditors: false,
        body: `<p>
          <p>Dear {{ recipientName }}</p>
          <p>One or more reports for a preprint to which you are assigned are available to view at {{{ manuscriptLink }}}. Please log in to read these reports and provide your comments using the chat function.</p>
          <p>Thank you</p>
          <p>On behalf of Biophysics Colab <br>
            <a href="https://www.sciencecolab.org/" target="_blank">www.sciencecolab.org</a>
          <p>`,
      },
      {
        emailTemplateKey: 'reviewInvitationEmailTemplate',
        type: 'reviewerInvitation',
        description: 'Reviewer Invitation',
        subject:
          'Opportunity to review for Biophysics Colab (in partnership with eLife)',
        cc: 'lesley@sciencecolab.org, swartzk@ninds.nih.gov',
        ccEditors: true,
        body: `<p>Dear {{ recipientName }}</p>

          <p>I hope you’ve had an opportunity to consider our request to act as a reviewer for the recent preprint {{{ manuscriptTitleLink }}}.</p>

          <p>We understand that our new and innovative service might require additional introduction and therefore encourage you to find out more by visiting our <a href="https://www.sciencecolab.org/biophysics-colab" target="_blank">website</a>. We’d also be happy to arrange a video call at your convenience to answer any questions. Simply email <a href="mailto:lesley@sciencecolab.org" target="_blank">lesley@sciencecolab.org</a> to arrange this.</p>

          <p>If you are available to provide expert feedback, please accept our invitation using the link below. If not, we’d be grateful if you let us know via the decline link.</p>

          <p>{{{ acceptInviteLink }}}</p>
          <p>{{{ declineInviteLink }}}</p>
          <p>
          I look forward to hearing from you.
          </p>

          <p>
            Best regards <br>
            {{ senderName }}
          </p>

          <p>
            On behalf of Biophysics Colab <br>
            <a href="https://www.sciencecolab.org/" target="_blank">www.sciencecolab.org</a>
          </p>

          <h3 style="margin-bottom: 2px;">Instructions for reviewers</h3>

          <p>
          After clicking on ‘Accept invitation’, you will be asked to log in to our peer review platform using your ORCID account. If you don’t have an ORCID, it takes two minutes to create one <a href="https://orcid.org/register" target="_blank">here</a>. <br>
          </p>

          <p>Once logged in, please click on ‘do review’ for the appropriate preprint on your dashboard to access the review form.</p>

          <p>Note that you can log in to our platform at any time by visiting<br>
          {{{ loginLink }}}
          </p>`,
      },
      {
        emailTemplateKey: 'reviewerInvitationRevisedPreprintTemplate',
        type: 'reviewerInvitation',
        description:
          'Reviewer invitation - new reviewer for a revised preprint',
        subject:
          'Opportunity to review a preprint for Biophysics Colab (in partnership with eLife)',
        cc: 'lesley@sciencecolab.org, swartzk@ninds.nih.gov',
        ccEditors: true,
        body: `<p>Dear {{ recipientName }}</p>
          <p>I’m a member of the launch team for <a href="http://www.sciencecolab.org/" target="_blank">Biophysics Colab</a>, a collaboration of biophysicists working in partnership with eLife to improve how research is evaluated. Later this year, we will launch a ‘publish, review, curate’ service that will support authors to create citeable, indexed versions of their work from published preprints. Until then, we are leveraging the knowledge and expertise of the global biophysics community to provide a <b>free preprint review service</b> that provides constructive, journal-agnostic feedback to authors.</p>
          <p>We are currently reviewing the preprint {{{ manuscriptTitleLink }}}, which the authors have revised in response to our earlier peer review report. You can access the report and the authors response by clicking on the title of the paper in our list of <a href="https://sciety.org/lists/ee7e738a-a1f1-465b-807c-132d273ca952" target="_blank">evaluated articles on Sciety</a>. Providing you have no potential conflicts of interest, we’re hoping you’ll be available to review the revised preprint for Biophysics Colab within the next two weeks. We would ask you to follow the guidelines below when formulating your feedback then participate in a discussion with the other reviewers to consolidate the various advice into a single report. With the authors’ permission, we will post this consolidated report on both bioRxiv and Sciety.</p>
          <p>We would not publish your individual report and your name would only be associated with the feedback if you agree to sign the consolidated report. However, we are encouraged that 96% of our reviewers have chosen to reveal their identities, as is evident in <a href="https://sciety.org/lists/ee7e738a-a1f1-465b-807c-132d273ca952" target="_blank">our public evaluations</a>. Please also bear in mind that the collaborative nature of peer review at Biophysics Colab would involve your identity being revealed to the other reviewers.</p>
          <p>Would you be able to review this revised preprint for Biophysics Colab? If so, please accept our invitation using the link below. If you need longer than two weeks, or have any questions about this request, please feel free to contact Lesley Anson (<a href="mailto:lesley@sciencecolab.org">lesley@sciencecolab.org</a>). If you’re unavailable, we’d be grateful if you let us know via the decline link, which will present a feedback field where you can suggest alternative reviewers such as postdoctoral scientists in your lab.</p>
          <p>
            {{{ acceptInviteLink }}}
          </p>
          <p>
            {{{ declineInviteLink }}}
          </p>
          <p>Please note that you will require an ORCID account in order to log in to our platform. If you don’t already have an ORCID, it takes two minutes to create one <a href="https://orcid.org/register" target="_blank">here</a>.</p>
          <p>I look forward to hearing from you.</p>
          <p>Best regards<br/>{{ senderName }}</p>
          <p>
            On behalf of Biophysics Colab <br>
            <a href="https://www.sciencecolab.org/" target="_blank">www.sciencecolab.org</a>
          <p>

          <h3 style="margin-bottom: 2px;">Instructions for reviewers</h3>
          <p>After clicking on ‘Accept invitation’, you will be asked to log in to our peer review platform using your ORCID account. If you don’t have an ORCID, it takes two minutes to create one <a href="https://orcid.org/register" target="_blank">here</a>.</p>
          <p>Once logged in, please click on ‘do review’ for the appropriate preprint on your dashboard to access the review form.</p>
          <p style="margin-top: 2px;">Our primary goal is to deliver objective feedback on published preprints that is independent of the criteria applied by conventional journals. Our reports detail three types of recommendation: revisions that we consider to be essential for the results to support the conclusions; optional suggestions for the authors to consider; and minor corrections or presentational issues (see below). All these recommendations should help to strengthen the manuscript, but authors can decide which advice to follow. If a revised preprint addresses the revisions that we define as essential, we offer to publicly endorse the work. <br /> <br />
            <u>General assessment</u>: <br />
            Please provide a paragraph summarising your overall assessment of the study, written for both experts and a general audience. Please mention: <br />
            &nbsp;&nbsp; -   	The objectives of the study <br />
            &nbsp;&nbsp; -   	Key findings and major conclusions <br />
            &nbsp;&nbsp; -   	Your opinion of its strengths and weaknesses <br /> <br />
            <u>Recommendations</u>: <br />
            Please list recommendations for improving the rigour and credibility of the work under the following three categories: <br />
            &nbsp;&nbsp; -   	Essential revisions <br />
            &nbsp;&nbsp; -   	Optional suggestions <br />
            &nbsp;&nbsp; -   	Minor and presentational issues <br /> <br />
            <u>Your relevant expertise</u>: <br />
            Please succinctly state your relevant expertise (we will not reveal your name if you prefer to remain anonymous).
          </p>`,
      },
      {
        emailTemplateKey: 'reviewerInvitationReReviewTemplate',
        description: 'Reviewer invitation - re-review',
        type: 'reviewerInvitation',
        subject: 'Request to review a revised preprint for Biophysics Colab',
        cc: 'lesley@sciencecolab.org, swartzk@ninds.nih.gov',
        ccEditors: true,
        body: `<p>
          <p>Dear {{ recipientName }}</p>
          <p>Thank you for sharing your time and expertise during your recent review of the preprint “{{ manuscriptTitle }}”.</p>
          <p>After carefully considering our advice, the authors have published a revised preprint in bioRxiv (which is available at {{{ manuscriptTitleLink }}}) and submitted a response to the various comments in our report: {{{ manuscriptLink }}}</p>
          <p>I’d be interested to hear your thoughts on the appropriateness of the authors’ response and whether you feel the conclusions in the revised preprint are robust and therefore suitable for endorsement by Biophysics Colab. I’d be grateful if you could indicate your willingness to re-review this work by accepting our invitation using the link below.</p>
          <p>{{{ acceptInviteLink }}}</p>
          <p>{{{ declineInviteLink }}}</p>
          <p>After considering the revisions, please complete the relevant fields in the review form by selecting ‘do review’.</p>
          <p>Don’t hesitate to let me know if you’d like to discuss the revisions in a video call.</p>
          <p>Best regards<br/>{{ senderName }}</p>
          <p>
            On behalf of Biophysics Colab <br>
            <a href="https://www.sciencecolab.org/" target="_blank">www.sciencecolab.org</a>
          <p>`,
      },
      {
        emailTemplateKey: 'thanksForAgreeingToReviewTemplate',
        description: 'Thank reviewer for agreeing to participate',
        subject: 'Thank you for supporting Biophysics Colab',
        cc: 'lesley@sciencecolab.org, swartzk@ninds.nih.gov',
        ccEditors: true,
        body: `<p>Thank you for agreeing to review the preprint by {{ authorName }} and colleagues for Biophysics Colab. I look forward to receiving your report, formatted as described below, by the agreed date. Please submit your report by completing the different fields in the review form, which you can access here; {{{ manuscriptLink }}}</p>
          <p>When all the reviewers have submitted their feedback, I’ll begin to consolidate the advice into a single report that we can discuss as a reviewing group (either electronically or via a video call). You can decide whether to sign this consolidated report after it has been finalised.</p>

          <p>We respectfully ask that you treat the consolidated report as a confidential document until it is publicly associated with the preprint, and we will ask the authors to do the same.</p>

          <p>I look forward to receiving your advice.</p>

          <p>
            Best regards <br />
            {{ senderName }}
          </p>

          <p>
            On behalf of Biophysics Colab <br />
            <a href="https://www.sciencecolab.org/" target="_blank">www.sciencecolab.org</a>
          </p>
          <h3 style="margin-bottom: 2px;">Instructions for reviewers</h3>
          <p style="margin-top: 2px;">Our primary goal is to deliver objective feedback on published preprints that is independent of the criteria applied by conventional journals. Our reports detail three types of recommendation: revisions that we consider to be essential for the results to support the conclusions; optional suggestions for the authors to consider; and minor corrections or presentational issues (see below). All these recommendations should help to strengthen the manuscript, but authors can decide which advice to follow. If a revised preprint addresses the revisions that we define as essential, we offer to publicly endorse the work. <br /> <br />
            <u>General assessment</u>: <br />
            Please provide a paragraph summarising your overall assessment of the study, written for both experts and a general audience. Please mention: <br />
            &nbsp;&nbsp; -   	The objectives of the study <br />
            &nbsp;&nbsp; -   	Key findings and major conclusions <br />
            &nbsp;&nbsp; -   	Your opinion of its strengths and weaknesses <br /> <br />
            <u>Recommendations</u>: <br />
            Please list recommendations for improving the rigour and credibility of the work under the following three categories: <br />
            &nbsp;&nbsp; -   	Essential revisions <br />
            &nbsp;&nbsp; -   	Optional suggestions <br />
            &nbsp;&nbsp; -   	Minor and presentational issues <br /> <br />
            <u>Your relevant expertise</u>: <br />
            Please succinctly state your relevant expertise (we will not reveal your name if you prefer to remain anonymous).
          </p>`,
      },
      {
        emailTemplateKey: 'notifyAuthorEmailTemplate',
        description: 'Share evaluation with author',
        subject: 'Evaluation from Biophysics Colab',
        cc: 'lesley@sciencecolab.org, swartzk@ninds.nih.gov',
        ccEditors: true,
        body: `<p>
          <p>Dear {{ recipientName }}</p>
          <p>Thank you for submitting your revised preprint “{{ manuscriptTitle }}” to Biophysics Colab for our further evaluation.</p>
          <p>Having now considered and discussed the work, we have drafted an evaluation statement that you can view at {{{ manuscriptLink }}}.</P>
          <p>Please let us know if you have any feedback on this statement. Otherwise, we will aim to post it on bioRxiv within the next week.</P>
          </P>Thank you for the opportunity to re-evaluate your study.</P
          <p>
          Best regards <br>
          {{ senderName }}
          </p>
          <p>
          On behalf of Biophysics Colab <br>
          <a href="https://www.sciencecolab.org/" target="_blank">www.sciencecolab.org</a>
          </p>`,
      },
      {
        emailTemplateKey: 'evaluationPublishedEmailTemplate',
        description: 'Evaluation published',
        subject: 'Evaluation from Biophysics Colab now published',
        cc: 'lesley@sciencecolab.org, swartzk@ninds.nih.gov',
        ccEditors: false,
        body: `<p>
          <p>Dear {{ recipientName }}</p>

        <p>The evaluation for the preprint by {{ authorName }} and colleagues has now been published.</p>

        <p>Thank you</p>
        <p>
          On behalf of Biophysics Colab <br>
          <a href="https://www.sciencecolab.org/" target="_blank">www.sciencecolab.org</a>
        <p>`,
      },
      {
        emailTemplateKey: 'chatNotification',
        description: 'Chat notification',
        subject: 'Kotahi | Discussion notification',
        ccEditors: false,
        type: 'systemEmail',
        body: `<p>
          <p>Dear {{ recipientName }}</p>

          <p>You have new discussion messages. Click here to reply; {{{ discussionUrl }}}</p>
          <p>Want to change your notifications settings? Login to Kotahi and go to your profile page<br></p>
          <p>Regards, <br>
            Kotahi team
          </p>`,
      },
    ]
  } else {
    templates = defaultEmailTemplates
  }

  return templates
}

exports.up = async () => {
  try {
    return useTransaction(async trx => {
      await trx.schema.alterTable(EmailTemplate.tableName, table => {
        table.text('email_template_key')
      })
      await trx.schema.alterTable(TaskEmailNotification.tableName, table => {
        table
          .uuid('email_template_id')
          .nullable()
          .references('id')
          .inTable(EmailTemplate.tableName)
      })
      await trx.schema.alterTable(
        TaskEmailNotificationLog.tableName,

        table => {
          table
            .uuid('email_template_id')
            .nullable()
            .references('id')
            .inTable(EmailTemplate.tableName)

          table.string('email_template_key').nullable().alter()
        },
      )

      const emailTemplatesForInstance = await existingEmailTemplates()

      // Map the emailTemplatesForInstance array to create an array of objects that match the EmailTemplate model structure
      const emailTemplatesData = emailTemplatesForInstance.map(template => ({
        emailTemplateType: template.type,
        emailContent: {
          subject: template.subject,
          cc: template.cc,
          ccEditors: template.ccEditors,
          body: template.body,
          description: template.description,
        },
        emailTemplateKey: template.emailTemplateKey,
      }))

      // Insert email templates into the database
      await EmailTemplate.query(trx).insertGraph(emailTemplatesData)

      const emailTemplateIds = await EmailTemplate.query(trx)

      const taskEmailNotifications =
        await TaskEmailNotification.query(trx).whereNotNull(
          'email_template_key',
        )

      for (const notification of taskEmailNotifications) {
        const emailTemplateId = emailTemplateIds.find(
          template =>
            template.emailTemplateKey === notification.emailTemplateKey,
        )?.id

        // eslint-disable-next-line no-await-in-loop
        await TaskEmailNotification.query(trx).findById(notification.id).patch({
          emailTemplateId,
        })
      }

      const emailTemplateIdsx = await EmailTemplate.query(trx)
        .select('id')
        .whereIn(
          'email_template_key',
          TaskEmailNotificationLog.query(trx)
            .select('email_template_key')
            .whereNotNull('email_template_key'),
        )

      const taskEmailNotificationsx =
        await TaskEmailNotificationLog.query(trx).whereNotNull(
          'email_template_key',
        )

      for (const notification of taskEmailNotificationsx) {
        const emailTemplateId = emailTemplateIdsx.find(
          template =>
            template.emailTemplateKey === notification.emailTemplateKey,
        )?.id

        // eslint-disable-next-line no-await-in-loop
        await TaskEmailNotificationLog.query(trx)
          .findById(notification.id)
          .patch({
            emailTemplateId,
          })
      }

      await trx.schema.alterTable(EmailTemplate.tableName, table => {
        table.dropColumn('email_template_key')
      })
    })
  } catch (error) {
    throw new Error(error)
  }
}
