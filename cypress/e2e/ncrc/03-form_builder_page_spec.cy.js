// /* eslint-disable jest/expect-expect,no-plusplus,jest/valid-expect-in-promise */
// // import { manuscripts, submissionForm } from '../../support/routes3'
// import { FormsPage } from '../../page-object/forms-page'
// // import { ManuscriptsPage } from '../../page-object/manuscripts-page'
// import { NewSubmissionPage } from '../../page-object/new-submission-page'
// import { SubmissionFormPage } from '../../page-object/submission-form-page'
// import { DashboardPage } from '../../page-object/dashboard-page'
// import { dashboard } from '../../support/routes'

// // eslint-disable-next-line jest/no-disabled-tests
// describe('form builder tests', () => {
//   before(() => {
//     const restoreUrl = Cypress.config('restoreUrl')
//     cy.request('POST', `${restoreUrl}/initial_state_other`)
//   })

//   context('check form builder elements visibility', () => {
//     beforeEach(() => {
//       // login as admin
//       cy.fixture('role_names').then(name => {
//         cy.login(name.role.admin, SubmissionFormPage)
//       })
//       FormsPage.verifyPageLoaded()
//     })

//     it('check form entries are correct', () => {
//       cy.fixture('form_option').then(data => {
//         FormsPage.getFormTitleTab(0).should('contain', data.preprint2.title)

//         const dataArray = [
//           // data.preprint2.articleDoi,
//           data.preprint2.articleUri,
//           data.preprint2.description,
//           data.common.ourTake,
//           data.preprint2.studyDesign,
//           data.preprint2.mainFindings,
//           data.common.studyStrengths,
//           data.common.limitations,
//           data.preprint2.valueAdded,
//           data.preprint2.label,
//           data.preprint2.subTopics,
//           data.common.topics,
//           data.common.abstract,
//           data.common.firstAuthor,
//           data.common.datePublished,
//           data.preprint2.studyPopulation,
//           data.common.journal,
//           data.preprint2.reviewer,
//           data.common.editDate,
//           data.preprint2.compendiumFeature,
//           data.common.reviewCreator,
//         ]

//         for (let i = 0; i < 20; i++) {
//           FormsPage.getFormBuilderElementName(i).should('contain', dataArray[i])
//         }
//       })
//     })

//     it('check form field type & assert field is mandatory', () => {
//       // eslint-disable-next-line jest/valid-expect-in-promise
//       cy.fixture('form_option').then(data => {
//         // FormsPage.clickFormOptionWithText(data.preprint2.articleDoi)
//         FormsPage.clickFormOptionWithText(data.preprint2.articleUri)
//         FormsPage.getFieldType().should('contain', 'Manuscript source URI')
//         FormsPage.getFieldValidate().should('contain', 'Required')
//         cy.get('[type=submit]:nth(2)').click()
//         FormsPage.clickFormOptionWithText(data.preprint2.description)
//         FormsPage.getFieldType().should('contain', 'Title')
//         FormsPage.getFieldValidate().should('contain', 'Required')
//         cy.get('[type=submit]:nth(2)').click()
//         FormsPage.clickFormOptionWithText(data.common.ourTake)
//         FormsPage.getFieldType().should('contain', 'Rich text')
//         FormsPage.getFieldValidate().should('contain', 'Required')
//         cy.get('[type=submit]:nth(2)').click()
//         FormsPage.clickFormOptionWithText(data.preprint2.studyDesign)
//         FormsPage.getFieldType().should('contain', 'Dropdown selection')
//         FormsPage.getFieldValidate().should('contain', 'Required')
//         cy.get('[type=submit]:nth(2)').click()
//         FormsPage.clickFormOptionWithText(data.preprint2.mainFindings)
//         FormsPage.getFieldType().should('contain', 'Rich text')
//         FormsPage.getFieldValidate().should('contain', 'Required')
//         cy.get('[type=submit]:nth(2)').click()
//         FormsPage.clickFormOptionWithText(data.common.studyStrengths)
//         FormsPage.getFieldType().should('contain', 'Rich text')
//         FormsPage.getFieldValidate().should('contain', 'Required')
//         cy.get('[type=submit]:nth(2)').click()
//         FormsPage.clickFormOptionWithText(data.common.limitations)
//         FormsPage.getFieldType().should('contain', 'Rich text')
//         FormsPage.getFieldValidate().should('contain', 'Required')
//         cy.get('[type=submit]:nth(2)').click()
//         FormsPage.clickFormOptionWithText(data.preprint2.valueAdded)
//         FormsPage.getFieldType().should('contain', 'Rich text')
//         FormsPage.getFieldValidate().should('contain', 'Required')
//         cy.get('[type=submit]:nth(2)').click()
//         FormsPage.clickFormOptionWithText(data.preprint2.label)
//         FormsPage.getFieldType().should('contain', 'Custom status')
//         FormsPage.getFieldValidate().should('contain', 'Required')
//         cy.get('[type=submit]:nth(2)').click()
//         FormsPage.clickFormOptionWithText(data.preprint2.subTopics)
//         FormsPage.getFieldType().should('contain', 'Checkboxes')
//         FormsPage.getFieldValidate().should('not.contain', 'Required')
//         cy.get('[type=submit]:nth(2)').click()
//         FormsPage.clickFormOption(10)
//         FormsPage.getFieldType().should('contain', 'Checkboxes')
//         FormsPage.getFieldValidate().should('contain', 'Required')
//         cy.get('[type=submit]:nth(2)').click()
//         FormsPage.clickFormOptionWithText(data.common.abstract)
//         FormsPage.getFieldType().should('contain', 'Abstract')
//         FormsPage.getFieldValidate().should('not.contain', 'Required')
//         cy.get('[type=submit]:nth(2)').click()
//         FormsPage.clickFormOptionWithText(data.common.firstAuthor)
//         FormsPage.getFieldType().should('contain', 'Text')
//         FormsPage.getFieldValidate().should('contain', 'Required')
//         cy.get('[type=submit]:nth(2)').click()
//         FormsPage.clickFormOptionWithText(data.common.datePublished)
//         FormsPage.getFieldType().should('contain', 'Text')
//         FormsPage.getFieldValidate().should('contain', 'Required')
//         cy.get('[type=submit]:nth(2)').click()
//         FormsPage.clickFormOptionWithText(data.preprint2.studyPopulation)
//         FormsPage.getFieldType().should('contain', 'Rich text')
//         FormsPage.getFieldValidate().should('not.contain', 'Required')
//         cy.get('[type=submit]:nth(2)').click()
//         FormsPage.clickFormOptionWithText(data.common.journal)
//         FormsPage.getFieldType().should('contain', 'Text')
//         FormsPage.getFieldValidate().should('contain', 'Required')
//         cy.get('[type=submit]:nth(2)').click()
//         FormsPage.clickFormOptionWithText(data.preprint2.reviewer)
//         FormsPage.getFieldType().should('contain', 'Text')
//         FormsPage.getFieldValidate().should('contain', 'Required')
//         cy.get('[type=submit]:nth(2)').click()
//         FormsPage.clickFormOptionWithText(data.common.editDate)
//         FormsPage.getFieldType().should('contain', 'Last edit date — read-only')
//         // FormsPage.getFieldValidate().should('not.contain', 'Required') // no option to validate this
//         cy.get('[type=submit]:nth(2)').click()
//         FormsPage.clickFormOptionWithText(data.preprint2.compendiumFeature)
//         FormsPage.getFieldType().should('contain', 'Dropdown selection')
//         FormsPage.getFieldValidate().should('not.contain', 'Required')
//         cy.get('[type=submit]:nth(2)').click()
//         FormsPage.clickFormOptionWithText(data.common.reviewCreator)
//         FormsPage.getFieldType().should('contain', 'Text')
//         FormsPage.getFieldValidate().should('contain', 'Required')
//       })
//     })
//   })
//   context('check submission form corresponds to form builder', () => {
//     beforeEach(() => {
//       //   const restoreUrl = Cypress.config('restoreUrl')
//       //   const seedFormsUrl = Cypress.config('seedFormsUrl')

//       //   cy.request('POST', `${restoreUrl}/initial_state_other`)
//       //   cy.request('POST', seedFormsUrl)

//       // login as admin
//       cy.fixture('role_names').then(name => {
//         cy.login(name.role.admin, dashboard)
//       })
//       cy.awaitDisappearSpinner()
//       // ManuscriptsPage.getTableHeader().should('be.visible')
//       DashboardPage.clickSubmit()
//       NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
//     })

//     it('check submission form contains the same fields', () => {
//       cy.fixture('form_option').then(data => {
//         const dataArray = [
//           // data.preprint2.articleDoi,
//           data.preprint2.articleUri,
//           data.preprint2.description,
//           data.common.ourTake,
//           data.preprint2.studyDesign,
//           data.preprint2.mainFindings,
//           data.common.studyStrengths,
//           data.common.limitations,
//           data.preprint2.valueAdded,
//           data.common.labels,
//           data.preprint2.subTopics,
//           data.common.topics,
//           data.common.abstract,
//           data.common.firstAuthor,
//           data.common.datePublished,
//           data.preprint2.studyPopulation,
//           data.common.journal,
//           data.preprint2.reviewer,
//           data.common.editDate,
//           data.preprint2.compendiumFeature,
//           data.common.reviewCreator,
//         ]

//         for (let i = 0; i < 20; i++) {
//           SubmissionFormPage.getFormOptionList(i).should(
//             'contain',
//             dataArray[i],
//           )
//         }
//       })
//     })

//     it('check required message is displayed for all required fields', () => {
//       SubmissionFormPage.clickSubmitResearch()

//       for (let i = 0; i < 9; i++) {
//         SubmissionFormPage.getFormOptionList(i).should('contain', 'Required')
//       }

//       SubmissionFormPage.getFormOptionList(9).should('not.contain', 'Required')
//       SubmissionFormPage.getFormOptionList(10).should('contain', 'Required')
//       SubmissionFormPage.getFormOptionList(11).should('not.contain', 'Required')
//       SubmissionFormPage.getFormOptionList(12).should('contain', 'Required')
//       SubmissionFormPage.getFormOptionList(13).should('contain', 'Required')
//       SubmissionFormPage.getFormOptionList(14).should('not.contain', 'Required')
//       SubmissionFormPage.getFormOptionList(15).should('contain', 'Required')
//       SubmissionFormPage.getFormOptionList(16).should('contain', 'Required')
//       SubmissionFormPage.getFormOptionList(17).should('not.contain', 'Required')
//       SubmissionFormPage.getFormOptionList(18).should('not.contain', 'Required')
//       SubmissionFormPage.getFormOptionList(19).should('contain', 'Required')
//     })

//     it('message for DOI invalid should not exist', () => {
//       SubmissionFormPage.fillInDoi('google.com')
//       SubmissionFormPage.fillInTitle('2')
//       SubmissionFormPage.getValidationErrorMessage('DOI is invalid').should(
//         'not.exist',
//       )
//     })

//     it('check study design dropdown options', () => {
//       // eslint-disable-next-line jest/valid-expect-in-promise
//       cy.fixture('form_option').then(data => {
//         const dataArray = [
//           data.preprint2.studyDesignTypes.caseSeries,
//           data.preprint2.studyDesignTypes.crossSectional,
//           data.preprint2.studyDesignTypes.prospectiveCohort,
//           data.preprint2.studyDesignTypes.retrospectiveCohort,
//           data.preprint2.studyDesignTypes.ecological,
//           data.preprint2.studyDesignTypes.randomizedControlTrial,
//           data.preprint2.studyDesignTypes.modelingSimulation,
//           data.preprint2.studyDesignTypes.other,
//           data.preprint2.studyDesignTypes.nonRandomizedTrial,
//           data.preprint2.studyDesignTypes.caseControl,
//         ]

//         SubmissionFormPage.clickElementFromFormOptionList(3)

//         // eslint-disable-next-line no-plusplus
//         for (let i = 0; i < 8; i++) {
//           SubmissionFormPage.getDropdownOption(i).should(
//             'contain',
//             dataArray[i],
//           )
//         }
//       })
//     })

//     it('check subtopic checkboxes options', () => {
//       cy.fixture('form_option').then(data => {
//         const subTopics = [
//           data.preprint2.subTopicTypes.epidemiologyPopulationsMostVulnerable,
//           data.preprint2.subTopicTypes
//             .epidemiologyIncubationPeriodSignsAndSymptomsAndViralShedding,
//           data.preprint2.subTopicTypes
//             .epidemiologyPopulationBasedPrevalenceAndBurdenOfDisease,
//           data.preprint2.subTopicTypes.epidemiologyTransmission,
//           data.preprint2.subTopicTypes.epidemiologyRiskForInfection,
//           data.preprint2.subTopicTypes
//             .epidemiologyVirusMutationsTrackingSpreadAndEvolutionInPeople,
//           data.preprint2.subTopicTypes
//             .ecologySpilloverEvolutionaryOriginAndZoonoticSpilloverOfSarsCov2,
//           data.preprint2.subTopicTypes
//             .ecologySpilloverSarsCov2InfectionInDomesticAnimals,
//           data.preprint2.subTopicTypes
//             .nonPharmaceuticalInterventionsTestingAndContactTracing,
//           data.preprint2.subTopicTypes.nonPharmaceuticalInterventionsMasks,
//           data.preprint2.subTopicTypes
//             .nonPharmaceuticalInterventionsSchoolAndBusinessClosures,
//           data.preprint2.subTopicTypes
//             .nonPharmaceuticalInterventionsSymptomScreening,
//           data.preprint2.subTopicTypes.vaccinesTrialResults,
//           data.preprint2.subTopicTypes
//             .vaccinesOtherVaccineAndVirologyRelatedTopics,
//           data.preprint2.subTopicTypes.vaccinesTrialProtocol,
//           data.preprint2.subTopicTypes
//             .clinicalPresentationPrognosticRiskFactorsAceInhibitors,
//           data.preprint2.subTopicTypes
//             .clinicalPresentationPrognosticRiskFactorsCoagulopathy,
//           data.preprint2.subTopicTypes
//             .clinicalPresentationPrognosticRiskFactorsNonRespiratoryPresentation,
//           data.preprint2.subTopicTypes
//             .clinicalPresentationPrognosticRiskFactorsLongTermSequelae,
//           data.preprint2.subTopicTypes
//             .clinicalPresentationPrognosticRiskFactorsImmuneResponse,
//           data.preprint2.subTopicTypes
//             .clinicalPresentationPrognosticRiskFactorsPediatrics,
//           data.preprint2.subTopicTypes
//             .clinicalPresentationPrognosticRiskFactorsPregnancy,
//           data.preprint2.subTopicTypes
//             .clinicalPresentationPrognosticRiskFactorsPrognosticTools,
//           data.preprint2.subTopicTypes
//             .modelingCovid19MortalityMorbidityAndDemandForHealthcareServices,
//           data.preprint2.subTopicTypes
//             .modelingImpactOnHealthcareServicesForNonRespiratoryDiseases,
//           data.preprint2.subTopicTypes.modelingMasks,
//           data.preprint2.subTopicTypes.modelingSchoolAndBusinessClosures,
//           data.preprint2.subTopicTypes
//             .modelingStayAtHomeOrdersAndMobilityRestrictions,
//           data.preprint2.subTopicTypes.modelingTestingAndContactTracing,
//           data.preprint2.subTopicTypes.modelingTransmissionDynamics,
//           data.preprint2.subTopicTypes.modelingSymptomScreening,
//           data.preprint2.subTopicTypes.modelingVaccines,
//           data.preprint2.subTopicTypes
//             .nonPharmaceuticalInterventionsStayAtHomeOrdersAndMobilityRestrictions,
//         ]

//         for (let i = 0; i < subTopics.length; i++) {
//           SubmissionFormPage.getSubTopicsCheckboxContainingText(subTopics[i])
//         }
//       })
//     })

//     it('check compendium feature dropdown options', () => {
//       SubmissionFormPage.clickElementFromFormOptionList(18)
//       // eslint-disable-next-line jest/valid-expect-in-promise
//       cy.fixture('form_option').then(data => {
//         SubmissionFormPage.getDropdownOption(0).should(
//           'contain',
//           data.preprint2.compendiumFeatureTypes.mediumLow,
//         )
//         SubmissionFormPage.getDropdownOption(1).should(
//           'contain',
//           data.preprint2.compendiumFeatureTypes.high,
//         )
//       })
//     })

//     it('check label dropdown options', () => {
//       // eslint-disable-next-line jest/valid-expect-in-promise
//       cy.fixture('form_option').then(data => {
//         const dataArray = [
//           data.common.labelTypes.readyToEvaluate,
//           data.common.labelTypes.evaluated,
//           data.common.labelTypes.readyToPublish,
//         ]

//         SubmissionFormPage.clickElementFromFormOptionList(8)

//         // eslint-disable-next-line no-plusplus
//         for (let i = 0; i < 3; i++) {
//           SubmissionFormPage.getDropdownOption(i).should(
//             'contain',
//             dataArray[i],
//           )
//         }
//       })
//     })

//     it('check topic checkbox options', () => {
//       // eslint-disable-next-line jest/valid-expect-in-promise
//       cy.fixture('form_option').then(data => {
//         const valueArray = [
//           data.preprint2.topicTypes.ecologyAndSpillover,
//           data.preprint2.topicTypes.vaccines,
//           data.preprint2.topicTypes.nonPharmaceuticalInterventions,
//           data.preprint2.topicTypes.epidemiology,
//           data.preprint2.topicTypes.diagnostics,
//           data.preprint2.topicTypes.modeling,
//           data.preprint2.topicTypes.clinicalPresentation,
//           data.preprint2.topicTypes.pharmaceuticalInterventions,
//         ]

//         // eslint-disable-next-line no-plusplus
//         for (let i = 0; i < 8; i++) {
//           SubmissionFormPage.getTopicsCheckboxWithText(`"${valueArray[i]}"`)
//             .scrollIntoView()
//             .should('be.visible')
//         }
//       })
//     })
//   })
// })
