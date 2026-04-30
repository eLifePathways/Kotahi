const { useTransaction } = require('@coko/server')

const EmailTemplate = require('../emailTemplate.model')

exports.up = async () => {
  return useTransaction(async trx => {
    if (
      process.env.USE_COLAB_EMAIL &&
      process.env.USE_COLAB_EMAIL.toLowerCase() === 'true'
    ) {
      await updateAuthorInvitationEmailContent(trx)
      await updateReviewerInvitationEmailContent(trx)
      await updateNewReviewerRevisedPreprintInvitationEmailContent(trx)
    }
  })
}

const updateAuthorInvitationEmailContent = async trx => {
  const updatedBody = `<p>Dear {{ recipientName }}</p>
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
    </p>`

  const numUpdated = await EmailTemplate.query(trx)
    .whereRaw(`email_content->>'description' = 'Author Invitation'`)
    .patch({
      email_content: EmailTemplate.raw(
        `jsonb_set(email_content, '{body}', ?::jsonb)`,
        [JSON.stringify(updatedBody)],
      ),
    })

  // eslint-disable-next-line no-console
  console.info(
    `Updated ${numUpdated} rows for author invitation email template`,
  )
}

const updateReviewerInvitationEmailContent = async trx => {
  const updatedBody = `<p>Dear {{ recipientName }}</p>
    <p>
      I’m a member of the launch team for <a href="https://www.sciencecolab.org/" target="_blank">Biophysics Colab</a>, a collaboration of biophysicists working in partnership with eLife to improve how research is evaluated. Later this year, we will launch a ‘publish, review, curate’ service that will support authors to create citeable, indexed versions of their work from published preprints. Until then, we are leveraging the knowledge and expertise of the global biophysics community to provide a <b>free preprint review service</b> that provides constructive, journal-agnostic feedback to authors.
    </p>
    <p>
      We are currently reviewing the recent preprint by {{ authorName }} and colleagues ({{{ manuscriptTitleLink }}}), following the authors’ approval. Providing you have no potential conflicts of interest, which might include reviewing this work for a traditional journal, we’re hoping you’ll be available to review the preprint for Biophysics Colab within the next two weeks. We would ask you to follow the guidelines below when formulating your feedback then participate in a discussion with the other reviewers to consolidate the various advice into a single report. With the authors’ permission, we will post this consolidated feedback on their bioRxiv publication, and highlight the work and our feedback on eLife’s Sciety platform. 
    </p>
    <p>
      We would not publish your individual report and your name would only be associated with the feedback if you agree to sign the consolidated report. However, we are encouraged that 96% of our reviewers have chosen to reveal their identities, as is evident in <a href="https://sciety.org/lists/ee7e738a-a1f1-465b-807c-132d273ca952" target="_blank">our public evaluations</a>. Please also bear in mind that the collaborative nature of peer review at Biophysics Colab would involve your identity being revealed to the other reviewers.
    </p>
    <p>
      Would you be able to review this preprint for Biophysics Colab? If so, please accept our invitation using the link below (see instructions at the foot of this message). If you need longer than two weeks, or have any questions about this request, please feel free to contact Lesley Anson (<a href="mailto:lesley@sciencecolab.org" target="_blank">lesley@sciencecolab.org</a>). If you’re unavailable, we’d be grateful if you let us know via the decline link, which will present a feedback field where you can suggest alternative reviewers such as postdoctoral scientists in your lab.
    </p>
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
    </p>`

  const numUpdated = await EmailTemplate.query(trx)
    .whereRaw(`email_content->>'description' = 'Reviewer Invitation'`)
    .patch({
      email_content: EmailTemplate.raw(
        `jsonb_set(email_content, '{body}', ?::jsonb)`,
        [JSON.stringify(updatedBody)],
      ),
    })

  // eslint-disable-next-line no-console
  console.info(
    `Updated ${numUpdated} rows for reviewer invitation email template`,
  )
}

const updateNewReviewerRevisedPreprintInvitationEmailContent = async trx => {
  const updatedBody = `<p>Dear {{ recipientName }}</p>
    <p>Dear {{ recipientName }}</p>
    <p>I’m a member of the launch team for <a href="http://www.sciencecolab.org/" target="_blank">Biophysics Colab</a>, a collaboration of biophysicists working in partnership with eLife to improve how research is evaluated. Later this year, we will launch a ‘publish, review, curate’ service that will support authors to create citeable, indexed versions of their work from published preprints. Until then, we are leveraging the knowledge and expertise of the global biophysics community to provide a <b>free preprint review service</b> that provides constructive, journal-agnostic feedback to authors.</p>
    <p>We are currently reviewing the preprint {{{ manuscriptTitleLink }}}, which the authors have revised in response to our earlier peer review report. You can access the report and the authors response by clicking on the title of the paper in our list of <a href="https://sciety.org/lists/ee7e738a-a1f1-465b-807c-132d273ca952" target="_blank">evaluated articles on Sciety</a>. Providing you have no potential conflicts of interest, we’re hoping you’ll be available to review the revised preprint for Biophysics Colab within the next two weeks. We would ask you to follow the guidelines below when formulating your feedback then participate in a discussion with the other reviewers to consolidate the various advice into a single report. With the authors’ permission, we will post this consolidated report on both bioRxiv and Sciety.</p>
    <p>We would not publish your individual report and your name would only be associated with the feedback if you agree to sign the consolidated report. However, we are encouraged that 96% of our reviewers have chosen to reveal their identities, as is evident in <a href="https://sciety.org/lists/ee7e738a-a1f1-465b-807c-132d273ca952" target="_blank">our public evaluations</a>. Please also bear in mind that the collaborative nature of peer review at Biophysics Colab would involve your identity being revealed to the other reviewers.</p>
    <p>Would you be able to review this revised preprint for Biophysics Colab? If so, please accept our invitation using the link below (see instructions at the foot of this email). If you need longer than two weeks, or have any questions about this request, please feel free to contact Lesley Anson (<a href="mailto:lesley@sciencecolab.org">lesley@sciencecolab.org</a>). If you’re unavailable, we’d be grateful if you let us know via the decline link, which will present a feedback field where you can suggest alternative reviewers such as postdoctoral scientists in your lab.</p>
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
    </p>`

  const numUpdated = await EmailTemplate.query(trx)
    .whereRaw(
      `email_content->>'description' = 'Reviewer invitation - new reviewer for a revised preprint'`,
    )
    .patch({
      email_content: EmailTemplate.raw(
        `jsonb_set(email_content, '{body}', ?::jsonb)`,
        [JSON.stringify(updatedBody)],
      ),
    })

  // eslint-disable-next-line no-console
  console.info(
    `Updated ${numUpdated} rows for new reviewer invitation for revised preprint email template`,
  )
}
