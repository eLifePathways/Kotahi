/* eslint-disable promise/always-return, promise/catch-or-return */
/* eslint-disable cypress/no-unnecessary-waiting */

import { manuscripts } from '../../support/routes'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { Menu } from '../../page-object/page-component/menu'

describe.skip('manuscripts page tests', () => {
  beforeEach(() => {
    const restoreUrl = Cypress.config('restoreUrl')
    const seedFormsUrl = Cypress.config('seedFormsUrl')

    cy.request('POST', `${restoreUrl}/initial_state_other`)
    cy.request('POST', seedFormsUrl)

    // login as admin
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, manuscripts)
    })
    cy.awaitDisappearSpinner()
    ManuscriptsPage.getTableHeader().should('be.visible')
  })

  context('elements visibility', () => {
    it('submit button, live chat button and dashboard page should be visible', () => {
      ManuscriptsPage.getSubmitButton().should('be.visible')
      ManuscriptsPage.getLiveChatButton().should('be.visible')
      Menu.getDashboardButton().should('be.visible')
    })

    it('evaluation button should be visible and publish button should not be visible for unsubmitted articles', () => {
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      // fill the submit form and submit it
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInTitle(data.articleId)
      })
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.getEvaluationButton()
        .scrollIntoView()
        .should('be.visible')
      ManuscriptsPage.getOptionWithText('Publish').should('not.exist')
    })

    it('label & topics should be visible on manuscripts page', () => {
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      // fill the submit form and submit it
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.clickCustomStatusDropdown()
        SubmissionFormPage.selectDropdownOption(1)
        SubmissionFormPage.clickTopicsCheckboxWithText(data.topic)
        SubmissionFormPage.clickTopicsCheckboxWithText('Epidemiology')
        Menu.clickManuscriptsAndAssertPageLoad()
        ManuscriptsPage.getArticleTopic(0).should(
          'contain',
          data.topic.toLowerCase(),
        )
        ManuscriptsPage.getArticleTopic(1).should('contain', 'epidemiology')
        ManuscriptsPage.getArticleLabel()
          .scrollIntoView()
          .should('be.visible')
          .and('contain', 'evaluated')
      })
    })

    it('editors column should be visible', () => {
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      // fill the submit form and submit it
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInTitle(data.articleId)
      })
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.getTableHead(-2)
        .scrollIntoView()
        .should('contain', 'Editor')
        .and('be.visible')
    })

    it('journal column should be visible', () => {
      ManuscriptsPage.getTableHead(1)
        .should('contain', 'Journal')
        .and('be.visible')
    })
  })

  context('unsubmitted article tests', () => {
    beforeEach(() => {
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
    })

    it('word count button should be visible & display info', () => {
      SubmissionFormPage.getWordCountInfo().its('length').should('eq', 7)

      for (let i = 0; i < 7; i++) {
        SubmissionFormPage.getWordCountInfo()
          .eq(i)
          .scrollIntoView()
          .should('be.visible')
      }

      SubmissionFormPage.fillInOurTake('word count test')
      SubmissionFormPage.getWordCountInfo()
        .eq(0)
        .should('contain', '3')
        .and('contain', 'Words')
    })

    it('unsubmitted article is evaluated', () => {
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInTitle(data.title)
      })
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.clickEvaluation()
      cy.url().should('contain', 'evaluation')
      SubmissionFormPage.getDoi().should('have.value', '')
      SubmissionFormPage.getOurTakeContent().should('be.eq', '')
      SubmissionFormPage.getStudyDesignDropdown().should('have.value', '')
      SubmissionFormPage.getStudySettingContent().should('have.value', '')
      SubmissionFormPage.getMainFindingsContent().should('have.value', '')
      SubmissionFormPage.getStudyStrengthsContent().should('have.value', '')
      SubmissionFormPage.getLimitationsContent().should('have.value', '')
      SubmissionFormPage.getValueAddedContent().should('have.value', '')
      SubmissionFormPage.getCustomStatusDropdown().should('have.value', '')
      SubmissionFormPage.checkEditDateIsUpdated()
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInDoi(data.doi)
        SubmissionFormPage.fillInTitle(data.articleId)
        SubmissionFormPage.fillInOurTake(data.ourTake)
        SubmissionFormPage.clickStudyDesignDropdown()
        SubmissionFormPage.selectDropdownOption(0)
        SubmissionFormPage.fillInMainFindings(data.mainFindings)
        SubmissionFormPage.fillInStudyStrengths(data.studyStrengths)
        SubmissionFormPage.fillInLimitations(data.limitations)
        SubmissionFormPage.fillInValueAdded(data.valueAdded)
        SubmissionFormPage.clickCustomStatusDropdown()
        SubmissionFormPage.selectDropdownOption(0)
        SubmissionFormPage.clickTopicsCheckboxWithText(data.topic)
        SubmissionFormPage.fillInFirstAuthor(data.creator)
        SubmissionFormPage.fillInDatePublished(data.date)
        SubmissionFormPage.fillInJournal(data.journal)
        SubmissionFormPage.fillInReviewer(data.creator)
        SubmissionFormPage.fillInReviewCreator(data.creator)
        SubmissionFormPage.clickSubmitResearchAndWaitPageLoad()
        ManuscriptsPage.getStatus(0).should('eq', 'Evaluated')
        ManuscriptsPage.getArticleTopic(0)
          .should('be.visible')
          .should('contain', data.topic.toLowerCase())
        ManuscriptsPage.getArticleLabel().should('contain', 'ready to evaluate')
      })
    })

    it('journal field data should be visible in the table', () => {
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInJournal(data.journal)
        Menu.clickManuscriptsAndAssertPageLoad()
        ManuscriptsPage.getTableRowsCount().should('eq', 1)
        ManuscriptsPage.getTableJournal().should('contain', data.journal)
      })
    })
    it('article URL should be visible in the table', () => {
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInDoi(data.doi)
        SubmissionFormPage.fillInTitle(data.articleId)
        Menu.clickManuscriptsAndAssertPageLoad()
        ManuscriptsPage.getTableRowsCount().should('eq', 1)
        ManuscriptsPage.getArticleTitleByRow(0)
          .find('a')
          .should('have.attr', 'href', data.doi)
      })
    })
  })

  context('submitted and evaluated article tests', () => {
    beforeEach(() => {
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      // fill the submit form and submit it
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInDoi(data.doi)
        SubmissionFormPage.fillInTitle(data.articleId)
        SubmissionFormPage.fillInOurTake(data.ourTake)
        SubmissionFormPage.clickStudyDesignDropdown()
        SubmissionFormPage.selectDropdownOption(0)
        SubmissionFormPage.fillInMainFindings(data.mainFindings)
        SubmissionFormPage.fillInStudyStrengths(data.studyStrengths)
        SubmissionFormPage.fillInLimitations(data.limitations)
        SubmissionFormPage.fillInValueAdded(data.valueAdded)
        SubmissionFormPage.clickCustomStatusDropdown()
        SubmissionFormPage.selectDropdownOption(0)
        SubmissionFormPage.clickTopicsCheckboxWithText(data.topic)
        SubmissionFormPage.fillInFirstAuthor(data.creator)
        SubmissionFormPage.fillInDatePublished(data.date)
        SubmissionFormPage.fillInJournal(data.journal)
        SubmissionFormPage.fillInReviewer(data.creator)
        SubmissionFormPage.checkEditDateIsUpdated()
        SubmissionFormPage.fillInReviewCreator(data.creator)

        SubmissionFormPage.waitThreeSec()
        SubmissionFormPage.clickSubmitResearchAndWaitPageLoad()
      })
    })

    it('manuscripts page should contain the correct details after submission', () => {
      cy.url().should('contain', 'manuscripts')
      ManuscriptsPage.getStatus(0).should('eq', 'Submitted')
      ManuscriptsPage.getManuscriptsPageTitle().should('be.visible')
      ManuscriptsPage.getEvaluationButton()
        .scrollIntoView()
        .should('be.visible')
      ManuscriptsPage.selectOptionWithText('Control').should('not.exist')
      ManuscriptsPage.getOptionWithText('View').should('be.visible')
      ManuscriptsPage.getOptionWithText('Delete').should('be.visible')
      ManuscriptsPage.getOptionWithText('Publish').should('not.exist')
      cy.fixture('submission_form_data').then(data => {
        ManuscriptsPage.getArticleTopic(0)
          .scrollIntoView()
          .should('be.visible')
          .should('contain', data.topic.toLowerCase())
        ManuscriptsPage.getArticleTitleByRow(0)
          .find('a')
          .should('have.attr', 'href', data.doi)
      })
      ManuscriptsPage.getArticleLabel().should('contain', 'ready to evaluate')
    })

    it('evaluate article and check status is changed and publish button is visible', () => {
      ManuscriptsPage.getStatus(0).should('eq', 'Submitted')
      ManuscriptsPage.clickEvaluation()

      SubmissionFormPage.clickSubmitResearchAndWaitPageLoad()

      ManuscriptsPage.getStatus(0).should('eq', 'Evaluated')
      ManuscriptsPage.getOptionWithText('Publish')
        .scrollIntoView()
        .should('be.visible')
    })

    it('evaluation changes should be visible', () => {
      cy.fixture('submission_form_data').then(data => {
        ManuscriptsPage.getStatus(0).should('eq', 'Submitted')
        ManuscriptsPage.clickEvaluation()
        SubmissionFormPage.fillInValueAdded('Evaluated')
        SubmissionFormPage.clickTopicsCheckboxContainsText('Vaccine')

        SubmissionFormPage.waitThreeSec()
        SubmissionFormPage.clickSubmitResearchAndWaitPageLoad()
        ManuscriptsPage.clickEvaluation()
        SubmissionFormPage.checkEditDateIsUpdated()
        SubmissionFormPage.getValueAddedField().should(
          'not.have.text',
          data.valueAdded,
        )
        SubmissionFormPage.getValueAddedField().should('have.text', 'Evaluated')
      })
    })
  })

  context('filter and sort articles', () => {
    beforeEach(() => {
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      cy.fixture('form_option').then(data => {
        SubmissionFormPage.fillInTitle('123')
        SubmissionFormPage.clickElementFromFormOptionList(8)
        SubmissionFormPage.selectDropdownOption(0)
        SubmissionFormPage.clickTopicsCheckboxWithText(
          data.preprint2.topicTypes.vaccines,
        )
        SubmissionFormPage.fillInJournal('123')
        Menu.clickManuscriptsAndAssertPageLoad()
        ManuscriptsPage.clickSubmit()
        NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
        SubmissionFormPage.fillInTitle('abc')
        SubmissionFormPage.clickElementFromFormOptionList(8)
        SubmissionFormPage.selectDropdownOption(1)
        SubmissionFormPage.clickTopicsCheckboxWithText(
          data.preprint2.topicTypes.ecologyAndSpillover,
        )
        SubmissionFormPage.clickTopicsCheckboxWithText(
          data.preprint2.topicTypes.diagnostics,
        )
        SubmissionFormPage.fillInJournal('abc')
        Menu.clickManuscriptsAndAssertPageLoad()
        ManuscriptsPage.clickSubmit()
        NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
        SubmissionFormPage.fillInTitle('def')
        SubmissionFormPage.clickElementFromFormOptionList(8)
        SubmissionFormPage.selectDropdownOption(0)
        SubmissionFormPage.clickTopicsCheckboxWithText(
          data.preprint2.topicTypes.modeling,
        )
        SubmissionFormPage.clickTopicsCheckboxWithText(
          data.preprint2.topicTypes.diagnostics,
        )
        SubmissionFormPage.fillInJournal('def')
        Menu.clickManuscriptsAndAssertPageLoad()
      })
    })

    it('filter article after topic and url contain that topic', () => {
      cy.fixture('form_option').then(data => {
        cy.wait(3000)
        ManuscriptsPage.clickArticleTopic(-1)
        ManuscriptsPage.getTableRowsCount().should('eq', 1)
        cy.url().should('contain', data.preprint2.topicTypes.vaccines)
        ManuscriptsPage.getArticleTopic(0).should(
          'contain',
          data.preprint2.topicTypes.vaccines.toLowerCase(),
        )
        Menu.clickManuscriptsAndAssertPageLoad()
        ManuscriptsPage.clickArticleTopic(1)
        ManuscriptsPage.getTableRowsCount().should('eq', 2)
        cy.url().should('contain', data.preprint2.topicTypes.diagnostics)
        ManuscriptsPage.getArticleTopic(0).should(
          'contain',
          data.preprint2.topicTypes.modeling.toLowerCase(),
        )
        ManuscriptsPage.getArticleTopic(1).should(
          'contain',
          data.preprint2.topicTypes.diagnostics.toLowerCase(),
        )
        ManuscriptsPage.getArticleTopic(2).should(
          'contain',
          data.preprint2.topicTypes.ecologyAndSpillover.toLowerCase(),
        )
        ManuscriptsPage.getArticleTopic(3).should(
          'contain',
          data.preprint2.topicTypes.diagnostics.toLowerCase(),
        )
        Menu.clickManuscriptsAndAssertPageLoad()
        ManuscriptsPage.clickArticleTopic(0)
        ManuscriptsPage.getTableRowsCount().should('eq', 1)
        cy.url().should('contain', 'modeling')
        ManuscriptsPage.getArticleTopic(0).should(
          'contain',
          data.preprint2.topicTypes.modeling.toLowerCase(),
        )
        ManuscriptsPage.getArticleTopic(1).should(
          'contain',
          data.preprint2.topicTypes.diagnostics.toLowerCase(),
        )
      })
    })

    it('filter article by label from dropdown list, and url should contain that label', () => {
      ManuscriptsPage.getArticleLabel().should('have.length', 3)
      ManuscriptsPage.getTableRow().eq(2).should('be.visible')
      ManuscriptsPage.getLabelRow(0).should('contain', 'ready to evaluate')
      ManuscriptsPage.getLabelRow(1).should('contain', 'evaluated')
      ManuscriptsPage.getLabelRow(2).should('contain', 'ready to evaluate')
      ManuscriptsPage.clickTableHead(6)
      ManuscriptsPage.selectDropdownOptionWithText('Ready to evaluate')
      ManuscriptsPage.getArticleLabel().should('have.length', 2)
      ManuscriptsPage.getLabelRow(0).scrollIntoView().should('be.visible')
      ManuscriptsPage.getLabelRow(1).scrollIntoView().should('be.visible')
      ManuscriptsPage.getLabelRow(0).should('contain', 'ready to evaluate')
      ManuscriptsPage.getLabelRow(1).should('contain', 'ready to evaluate')
      cy.url().should('contain', 'readyToEvaluate')
    })

    it('filter article by topic from dropdown list, and url should contain that topic', () => {
      cy.fixture('form_option').then(data => {
        ManuscriptsPage.getTableRowsCount().should('eq', 3)
        ManuscriptsPage.clickTableHead(4)
        ManuscriptsPage.selectDropdownOptionWithText(
          data.preprint2.topicTypes.diagnostics.toLowerCase(),
        )
        ManuscriptsPage.getTableRowsCount().should('eq', 2)
        ManuscriptsPage.getArticleTopic(0).should(
          'contain',
          data.preprint2.topicTypes.modeling.toLowerCase(),
        )
        ManuscriptsPage.getArticleTopic(1).should(
          'contain',
          data.preprint2.topicTypes.diagnostics.toLowerCase(),
        )
        ManuscriptsPage.getArticleTopic(2).should(
          'contain',
          data.preprint2.topicTypes.ecologyAndSpillover.toLowerCase(),
        )
        ManuscriptsPage.getArticleTopic(3).should(
          'contain',
          data.preprint2.topicTypes.diagnostics.toLowerCase(),
        )
        cy.url().should('contain', data.preprint2.topicTypes.diagnostics)
      })
    })

    it('filter article after label and url contain that label', () => {
      cy.wait(3000)
      ManuscriptsPage.clickArticleLabel(-1)
      ManuscriptsPage.getTableRowsCount().should('eq', 2)
      cy.url().should('contain', 'readyToEvaluate')
      ManuscriptsPage.getLabelRow(0).should('contain', 'ready to evaluate')
      ManuscriptsPage.getLabelRow(1).should('contain', 'ready to evaluate')
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.clickArticleLabel(1)
      ManuscriptsPage.getTableRowsCount().should('eq', 1)
      cy.url().should('contain', 'evaluated')
      ManuscriptsPage.getLabelRow(0).should('contain', 'evaluated')
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.clickArticleLabel(0)
      ManuscriptsPage.getTableRowsCount().should('eq', 2)
      cy.url().should('contain', 'readyToEvaluate')
      ManuscriptsPage.getLabelRow(0).should('contain', 'ready to evaluate')
      ManuscriptsPage.getLabelRow(1).should('contain', 'ready to evaluate')
    })

    it('sort article by Description', () => {
      ManuscriptsPage.getTableHead(0).should('contain', 'Description')
      ManuscriptsPage.getArticleTitleByRow(0).should('contain', 'def')
      ManuscriptsPage.getArticleTitleByRow(1).should('contain', 'abc')
      ManuscriptsPage.getArticleTitleByRow(2).should('contain', '123')
      ManuscriptsPage.clickTableHead(0)
      ManuscriptsPage.getArticleTitleByRow(0).should('contain', '123')
      ManuscriptsPage.getArticleTitleByRow(1).should('contain', 'abc')
      ManuscriptsPage.getArticleTitleByRow(2).should('contain', 'def')
    })
    it('sort article by Journal', () => {
      ManuscriptsPage.getTableHead(1).should('contain', 'Journal')
      ManuscriptsPage.getArticleTitleByRow(0).should('contain', 'def')
      ManuscriptsPage.getArticleTitleByRow(1).should('contain', 'abc')
      ManuscriptsPage.getArticleTitleByRow(2).should('contain', '123')
      ManuscriptsPage.clickTableHead(1)
      ManuscriptsPage.getArticleTitleByRow(0).should('contain', '123')
      ManuscriptsPage.getArticleTitleByRow(1).should('contain', 'abc')
      ManuscriptsPage.getArticleTitleByRow(2).should('contain', 'def')
    })

    it('filter article after status and url contain that status', () => {
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      // fill the submit form and submit it
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInDoi(data.doi)
        SubmissionFormPage.fillInTitle(data.articleId)
        SubmissionFormPage.fillInOurTake(data.ourTake)
        SubmissionFormPage.clickStudyDesignDropdown()
        SubmissionFormPage.selectDropdownOption(0)
        SubmissionFormPage.fillInMainFindings(data.mainFindings)
        SubmissionFormPage.fillInStudyStrengths(data.studyStrengths)
        SubmissionFormPage.fillInLimitations(data.limitations)
        SubmissionFormPage.fillInValueAdded(data.valueAdded)
        SubmissionFormPage.clickCustomStatusDropdown()
        SubmissionFormPage.selectDropdownOption(0)
        SubmissionFormPage.clickTopicsCheckboxWithText(data.topic)
        SubmissionFormPage.fillInFirstAuthor(data.creator)
        SubmissionFormPage.fillInDatePublished(data.date)
        SubmissionFormPage.fillInJournal(data.journal)
        SubmissionFormPage.fillInReviewer(data.creator)
        SubmissionFormPage.fillInReviewCreator(data.creator)

        SubmissionFormPage.waitThreeSec()
        SubmissionFormPage.clickSubmitResearchAndWaitPageLoad()
      })

      cy.wait(3000)
      ManuscriptsPage.clickStatus(-1)
      ManuscriptsPage.getTableRowsCount().should('eq', 3)
      ManuscriptsPage.getStatus(0).should('contain', 'Unsubmitted')
      cy.url().should('contain', 'new')
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.clickStatus(0)
      ManuscriptsPage.getTableRowsCount().should('eq', 1)
      ManuscriptsPage.getStatus(0).should('contain', 'Submitted')
      cy.url().should('contain', 'submitted')
    })

    it('filter article after status from dropdown list and url contain that status', () => {
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      // fill the submit form and submit it
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInDoi(data.doi)
        SubmissionFormPage.fillInTitle(data.articleId)
        SubmissionFormPage.fillInOurTake(data.ourTake)
        SubmissionFormPage.clickStudyDesignDropdown()
        SubmissionFormPage.selectDropdownOption(0)
        SubmissionFormPage.fillInMainFindings(data.mainFindings)
        SubmissionFormPage.fillInStudyStrengths(data.studyStrengths)
        SubmissionFormPage.fillInLimitations(data.limitations)
        SubmissionFormPage.fillInValueAdded(data.valueAdded)
        SubmissionFormPage.clickCustomStatusDropdown()
        SubmissionFormPage.selectDropdownOption(0)
        SubmissionFormPage.clickTopicsCheckboxWithText(data.topic)
        SubmissionFormPage.fillInFirstAuthor(data.creator)
        SubmissionFormPage.fillInDatePublished(data.date)
        SubmissionFormPage.fillInJournal(data.journal)
        SubmissionFormPage.fillInReviewer(data.creator)
        SubmissionFormPage.fillInReviewCreator(data.creator)

        SubmissionFormPage.waitThreeSec()
        SubmissionFormPage.clickSubmitResearchAndWaitPageLoad()
      })

      cy.wait(3000)
      ManuscriptsPage.getTableRowsCount().should('eq', 4)
      ManuscriptsPage.clickTableHead(5)
      ManuscriptsPage.selectDropdownOptionWithText('Submitted')
      ManuscriptsPage.getTableRowsCount().should('eq', 1)
      ManuscriptsPage.getStatus(0).should('contain', 'Submitted')
      cy.url().should('contain', 'submitted')
    })

    it('combined filtering after status, topic and label, link content that combination', () => {
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      // fill the submit form and submit it
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInDoi(data.doi)
        SubmissionFormPage.fillInTitle(data.articleId)
        SubmissionFormPage.fillInOurTake(data.ourTake)
        SubmissionFormPage.clickStudyDesignDropdown()
        SubmissionFormPage.selectDropdownOption(5)
        SubmissionFormPage.fillInMainFindings(data.mainFindings)
        SubmissionFormPage.fillInStudyStrengths(data.studyStrengths)
        SubmissionFormPage.fillInLimitations(data.limitations)
        SubmissionFormPage.fillInValueAdded(data.valueAdded)
        SubmissionFormPage.clickCustomStatusDropdown()
        SubmissionFormPage.selectDropdownOption(0)
        SubmissionFormPage.clickTopicsCheckboxWithText(data.topic)
        SubmissionFormPage.fillInFirstAuthor(data.creator)
        SubmissionFormPage.fillInDatePublished(data.date)
        SubmissionFormPage.fillInJournal(data.journal)
        SubmissionFormPage.fillInReviewer(data.creator)
        SubmissionFormPage.fillInReviewCreator(data.creator)

        SubmissionFormPage.waitThreeSec()
        SubmissionFormPage.clickSubmitResearchAndWaitPageLoad()
      })

      cy.wait(3000)
      ManuscriptsPage.clickStatus(-1)
      ManuscriptsPage.getTableRowsCount().should('eq', 3)
      ManuscriptsPage.getStatus(0).should('contain', 'Unsubmitted')
      cy.url().should('contain', 'new')
      ManuscriptsPage.clickArticleTopic(1)
      ManuscriptsPage.getTableRowsCount().should('eq', 2)
      cy.url().should('contain', 'status=new&topic=Diagnostics')
      ManuscriptsPage.clickArticleLabel(0)
      ManuscriptsPage.getTableRowsCount().should('eq', 1)
      cy.url().should(
        'contain',
        'status=new&topic=Diagnostics&label=readyToEvaluate',
      )
    })

    it('combined filtering after status, topic and label from dropdown list, link content that combination', () => {
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      // fill the submit form and submit it
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInDoi(data.doi)
        SubmissionFormPage.fillInTitle(data.articleId)
        SubmissionFormPage.fillInOurTake(data.ourTake)
        SubmissionFormPage.clickStudyDesignDropdown()
        SubmissionFormPage.selectDropdownOption(5)
        SubmissionFormPage.fillInMainFindings(data.mainFindings)
        SubmissionFormPage.fillInStudyStrengths(data.studyStrengths)
        SubmissionFormPage.fillInLimitations(data.limitations)
        SubmissionFormPage.fillInValueAdded(data.valueAdded)
        SubmissionFormPage.clickCustomStatusDropdown()
        SubmissionFormPage.selectDropdownOption(0)
        SubmissionFormPage.clickTopicsCheckboxWithText(data.topic)
        SubmissionFormPage.fillInFirstAuthor(data.creator)
        SubmissionFormPage.fillInDatePublished(data.date)
        SubmissionFormPage.fillInJournal(data.journal)
        SubmissionFormPage.fillInReviewer(data.creator)
        SubmissionFormPage.fillInReviewCreator(data.creator)

        SubmissionFormPage.waitThreeSec()
        SubmissionFormPage.clickSubmitResearchAndWaitPageLoad()
      })

      cy.wait(3000)
      ManuscriptsPage.getTableRowsCount().should('eq', 4)
      ManuscriptsPage.clickTableHead(5)
      ManuscriptsPage.selectDropdownOptionWithText('Unsubmitted')
      ManuscriptsPage.getTableRowsCount().should('eq', 3)
      cy.url().should('contain', 'new')
      ManuscriptsPage.clickTableHead(4)
      ManuscriptsPage.selectDropdownOptionWithText('diagnostics')
      ManuscriptsPage.getTableRowsCount().should('eq', 2)
      cy.url().should('contain', 'status=new&topic=Diagnostics')
      ManuscriptsPage.clickTableHead(6)
      ManuscriptsPage.selectDropdownOptionWithText('Ready to evaluate')
      ManuscriptsPage.getTableRowsCount().should('eq', 1)
      cy.url().should(
        'contain',
        'status=new&topic=Diagnostics&label=readyToEvaluate',
      )
    })
  })

  context('video chat button', () => {
    it('check the video chat link, and if it returns 200', () => {
      ManuscriptsPage.getLiveChatButton()
        .invoke('attr', 'href')
        .should('contain', '//8x8.vc/coko/')
      ManuscriptsPage.getLiveChatButton().then(link => {
        cy.request(link.prop('href')).its('status').should('eq', 200)
      })
    })
  })
  context('select button from Label column', () => {
    beforeEach(() => {
      const restoreUrl = Cypress.config('restoreUrl')
      const seedFormsUrl = Cypress.config('seedFormsUrl')

      cy.request('POST', `${restoreUrl}/initial_state_other`)
      cy.request('POST', seedFormsUrl)

      // login as admin
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)
      })
      cy.awaitDisappearSpinner()
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      SubmissionFormPage.fillInTitle('123')
      Menu.clickManuscriptsAndAssertPageLoad()
      ManuscriptsPage.clickSubmit()
      NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
      SubmissionFormPage.fillInTitle('abc')
      Menu.clickManuscriptsAndAssertPageLoad()
    })
    it('select button is visible', () => {
      ManuscriptsPage.getSelectButton().should('be.visible')
      ManuscriptsPage.getArticleLabel().should('not.exist')
    })
    it('after click on Select new status is displayed', () => {
      ManuscriptsPage.getSelectAllCheckbox().click()
      ManuscriptsPage.getSelectedArticlesCount().should('contain', 2)
      ManuscriptsPage.getSelectAllCheckbox().click()
      ManuscriptsPage.getSelectedArticlesCount().should('contain', 0)
      ManuscriptsPage.clickSelect()
      ManuscriptsPage.getArticleLabel().should('contain', 'ready to evaluate')
      ManuscriptsPage.getSelectAllCheckbox().click()
      ManuscriptsPage.getSelectedArticlesCount().should('contain', 1)
    })
    it('check label field after bulk delete', () => {
      ManuscriptsPage.clickArticleCheckbox(1)
      ManuscriptsPage.clickDelete()
      ManuscriptsPage.clickConfirm()
      ManuscriptsPage.getNumberOfAvailableArticles().should('contain', 1)
      ManuscriptsPage.getArticleLabel().should('contain', 'ready to evaluate')
    })
  })
})
