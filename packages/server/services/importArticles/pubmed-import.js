/* eslint-disable consistent-return, no-await-in-loop, no-nested-ternary, no-console, no-shadow */
const axios = require('axios')
const xml2json = require('xml-js')
const FormData = require('form-data')
const { logger } = require('@coko/server')

const ArticleImportHistory = require('../../models/articleImportHistory/articleImportHistory.model')
const ArticleImportSources = require('../../models/articleImportSources/articleImportSources.model')
const Manuscript = require('../../models/manuscript/manuscript.model')

const flattenObj = require('../../utils/flattenObj')
const { getSubmissionForm } = require('../../controllers/review.controllers')

const selectVersionRegexp = /(v)(?!.*\1)/g

const delay = milisec => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('')
    }, milisec)
  })
}

const pubmedQueries = {
  Clinical_presentation:
    '("clinical presentation" OR "clinical characteristics" OR "clinical features" OR "clinical findings" OR "clinical symptoms" OR "clinical symptom" OR "clinical manifestation" OR "clinical manifestations"  OR "clinical outcomes" OR "virulence"[mh] OR "virulence" OR "case fatality" OR "case fatalities" OR "disease progression"[mh] OR "disease progression" OR "disease course" OR "clinical deterioration" OR "disease exacerbation" OR "spontaneous remission") AND ("COVID-19"[tw] OR "COVID 19"[tw] OR "COVID19"[tw] OR "COVID2019"[tw] OR "COVID 2019"[tw] OR "COVID-2019"[tw] OR "novel coronavirus"[tw] OR "new coronavirus"[tw] OR "novel corona virus"[tw] OR "new corona virus"[tw] OR "SARS-CoV-2"[tw] OR "SARSCoV2"[tw] OR "SARS-CoV2"[tw] OR "2019nCoV"[tw] OR "2019-nCoV"[tw] OR "2019 coronavirus"[tw] OR "2019 corona virus"[tw] OR "coronavirus disease 2019"[tw] OR "severe acute respiratory syndrome coronavirus 2"[nm] OR "severe acute respiratory syndrome coronavirus 2"[tw] OR "sars-coronavirus-2"[tw] OR "coronavirus disease 2019"[tw] OR "corona virus disease 2019"[tw]) NOT ("letter"[pt] OR "comment"[pt] OR "editorial"[pt] OR "review"[pt] OR "letter"[ti] OR "comment"[ti] OR "editorial"[ti] OR "brief communication"[ti] OR "review"[ti])',
  Diagnostics:
    '("Specificity"[tiab] OR "sensitivity and specificity"[mh] OR "PCR"[tiab] OR "polymerase chain reaction" OR "rapid test" OR "false positive" OR "false negative" OR "positive predictive" OR "negative predictive" OR "predictive value" OR "immunoassay" OR "clinical diagnosis" OR "assay" OR "point of care testing" OR "diagnostic testing" OR "diagnostic performance" OR "diagnostic utility" OR "differential diagnosis" OR "molecular diagnosis") AND ("COVID-19"[tw] OR "COVID 19"[tw] OR "COVID19"[tw] OR "COVID2019"[tw] OR "COVID 2019"[tw] OR "COVID-2019"[tw] OR "novel coronavirus"[tw] OR "new coronavirus"[tw] OR "novel corona virus"[tw] OR "new corona virus"[tw] OR "SARS-CoV-2"[tw] OR "SARSCoV2"[tw] OR "SARS-CoV2"[tw] OR "2019nCoV"[tw] OR "2019-nCoV"[tw] OR "2019 coronavirus"[tw] OR "2019 corona virus"[tw] OR "coronavirus disease 2019"[tw] OR "severe acute respiratory syndrome coronavirus 2"[nm] OR "severe acute respiratory syndrome coronavirus 2"[tw] OR "sars-coronavirus-2"[tw] OR "coronavirus disease 2019"[tw] OR "corona virus disease 2019"[tw]) NOT ("letter"[pt] OR "comment"[pt] OR "editorial"[pt] OR "review"[pt] OR "letter"[ti] OR "comment"[ti] OR "editorial"[ti] OR "brief communication"[ti] OR "review"[ti])',
  Disease_modeling:
    '("models, theoretical"[mh] OR "theoretical model" OR "theoretical models" OR "mathematical model" OR "mathematical models" OR "mathematical modeling" OR "individual based model" OR "individual based models" OR "individual based modeling" OR "Patient-Specific Modeling"[mh] OR "patient-specific model" OR "patient-specific models" OR "patient-specific modeling" OR "agent based model" OR "agent based models" OR "agent based modeling" OR "forecasting"[mh] OR "forecast" OR "forecasting" OR "projection" OR "projections" OR "scenario" OR "scenarios" OR "health planning"[mh] OR "health planning" OR "nowcasting" OR "seir" OR "spatial" OR "demographic project" OR "demographic projections" OR "SIR" OR "R0" OR "RO"[tiab] OR "basic reproduction number" OR "transmission" OR "simulation" OR "simulations" OR "estimate" OR "estimates") AND ("COVID-19"[tw] OR "COVID 19"[tw] OR "COVID19"[tw] OR "COVID2019"[tw] OR "COVID 2019"[tw] OR "COVID-2019"[tw] OR "novel coronavirus"[tw] OR "new coronavirus"[tw] OR "novel corona virus"[tw] OR "new corona virus"[tw] OR "SARS-CoV-2"[tw] OR "SARSCoV2"[tw] OR "SARS-CoV2"[tw] OR "2019nCoV"[tw] OR "2019-nCoV"[tw] OR "2019 coronavirus"[tw] OR "2019 corona virus"[tw] OR "coronavirus disease 2019"[tw] OR "severe acute respiratory syndrome coronavirus 2"[nm] OR "severe acute respiratory syndrome coronavirus 2"[tw] OR "sars-coronavirus-2"[tw] OR "coronavirus disease 2019"[tw] OR "corona virus disease 2019"[tw]) NOT ("letter"[pt] OR "comment"[pt] OR "editorial"[pt] OR "review"[pt] OR "letter"[ti] OR "comment"[ti] OR "editorial"[ti] OR "brief communication"[ti] OR "review"[ti] OR "dentistry"[tiab] OR "dental"[tiab])',
  Ecology_and_spillover:
    '("zoonoses"[mh] OR "zoonoses" OR "zoonosis" OR "zoonotic" OR "cross-species" OR "disease reservoirs"[mh] OR "reservoir" OR "reservoirs" OR "origin" OR "ecology" OR "spillover") AND ("COVID-19"[tw] OR "COVID 19"[tw] OR "COVID19"[tw] OR "COVID2019"[tw] OR "COVID 2019"[tw] OR "COVID-2019"[tw] OR "novel coronavirus"[tw] OR "new coronavirus"[tw] OR "novel corona virus"[tw] OR "new corona virus"[tw] OR "SARS-CoV-2"[tw] OR "SARSCoV2"[tw] OR "SARS-CoV2"[tw] OR "2019nCoV"[tw] OR "2019-nCoV"[tw] OR "2019 coronavirus"[tw] OR "2019 corona virus"[tw] OR "coronavirus disease 2019"[tw] OR "severe acute respiratory syndrome coronavirus 2"[nm] OR "severe acute respiratory syndrome coronavirus 2"[tw] OR "sars-coronavirus-2"[tw] OR "coronavirus disease 2019"[tw] OR "corona virus disease 2019"[tw]) NOT ("letter"[pt] OR "comment"[pt] OR "editorial"[pt] OR "review"[pt] OR "letter"[ti] OR "comment"[ti] OR "editorial"[ti] OR "brief communication"[ti] OR "review"[ti])',
  Vaccine_development:
    '("Immunotherapy, Active"[mh] OR "immunotherapy" OR "immunotherapies" OR "immunotherapeutics" OR "vaccines"[mh] OR "vaccine" OR "vaccines" OR "vaccination") AND ("COVID-19"[tw] OR "COVID 19"[tw] OR "COVID19"[tw] OR "COVID2019"[tw] OR "COVID 2019"[tw] OR "COVID-2019"[tw] OR "novel coronavirus"[tw] OR "new coronavirus"[tw] OR "novel corona virus"[tw] OR "new corona virus"[tw] OR "SARS-CoV-2"[tw] OR "SARSCoV2"[tw] OR "SARS-CoV2"[tw] OR "2019nCoV"[tw] OR "2019-nCoV"[tw] OR "2019 coronavirus"[tw] OR "2019 corona virus"[tw] OR "coronavirus disease 2019"[tw] OR "severe acute respiratory syndrome coronavirus 2"[nm] OR "severe acute respiratory syndrome coronavirus 2"[tw] OR "sars-coronavirus-2"[tw] OR "coronavirus disease 2019"[tw] OR "corona virus disease 2019"[tw]) NOT ("letter"[pt] OR "comment"[pt] OR "editorial"[pt] OR "review"[pt] OR "letter"[ti] OR "comment"[ti] OR "editorial"[ti] OR "brief communication"[ti] OR "review"[ti])',
  Epidemiology:
    '("epidemiology"[mh] OR "epidemiologic studies"[mh] OR "epidemiologic measurements"[mh] OR "epidemiologic factors"[mh] OR "epidemiology" OR "epidemiologic" OR "epidemiological" OR "Disease transmission, infectious"[mh] OR "disease transmission" OR "transmission dynamics" OR "transmission network" OR "transmission cluster" OR "transmission factors" OR "horizontal transmission" OR "vertical transmission" OR "molecular epidemiology"[mh] OR "molecular epidemiology" OR "genetic epidemiology" OR "virus shedding"[mh] OR "virus shedding" OR "viral shedding" OR "infectious disease incubation period"[mh] OR "incubation period" OR "virus isolation" OR "serial interval" OR "basic reproduction number"[mh] OR "reproduction number" OR "reproductive number" OR "R0" OR "RO"[tiab] OR "case fatality" OR "fatality rate" OR "serosurvey" OR "seroepidemiologic studies"[mh] OR "seroepidemiologic" OR "seroprevalence" OR "attack rate" OR "genetics"[mh] OR "genetics"[subheading] OR "genetics" OR "prisons"[mh] OR "prison" OR "prisons" OR "assisted living facilities" OR "assisted living" OR "nursing home" OR "nursing homes" OR "long-term care facility" OR "long-term care facilities" OR "refugees"[mh] OR "refugee camps"[mh] OR "refugee" OR "refugees" OR "detention center" OR "detention centers" OR "detention camp" OR "detention camps" OR "natural history" OR "risk factors"[mh] OR "risk factor" OR "risk factors") AND ("COVID-19"[tw] OR "COVID 19"[tw] OR "COVID19"[tw] OR "COVID2019"[tw] OR "COVID 2019"[tw] OR "COVID-2019"[tw] OR "novel coronavirus"[tw] OR "new coronavirus"[tw] OR "novel corona virus"[tw] OR "new corona virus"[tw] OR "SARS-CoV-2"[tw] OR "SARSCoV2"[tw] OR "SARS-CoV2"[tw] OR "2019nCoV"[tw] OR "2019-nCoV"[tw] OR "2019 coronavirus"[tw] OR "2019 corona virus"[tw] OR "coronavirus disease 2019"[tw] OR "severe acute respiratory syndrome coronavirus 2"[nm] OR "severe acute respiratory syndrome coronavirus 2"[tw] OR "sars-coronavirus-2"[tw] OR "coronavirus disease 2019"[tw] OR "corona virus disease 2019"[tw]) NOT ("letter"[pt] OR "comment"[pt] OR "editorial"[pt] OR "review"[pt] OR "letter"[ti] OR "comment"[ti] OR "editorial"[ti] OR "brief communication"[ti] OR "review"[ti])',

  Nonpharmaceutical_interventions:
    '("social isolation"[mh:noexp] OR "hand disinfection"[mh] OR "hand hygiene"[mh] OR "non-pharmaceutical intervention"[tw] OR "non-pharmaceutical interventions"[tw] OR "environmental NPI"[tw] OR "environmental NPIs"[tw] OR "personal NPI"[tw] OR "personal NPIs"[tw] OR "community NPI"[tw] OR "community NPIs"[tw] OR "school closure"[tw] OR "school closures"[tw] OR "workplace closure"[tw] OR "workplace closures"[tw] OR "work closure"[tw] OR "work closures"[tw] OR "office closure"[tw] OR "office closures"[tw] OR "church closure"[tw] OR "church closures"[tw] OR "synagogue closure"[tw] OR "synagogue closures"[tw] OR "mosque closure"[tw] OR "mosque closures"[tw] OR "mitigation"[tw] OR "patient isolation"[mh] OR "quarantine"[mh] OR "quarantine"[tw] OR "quarantining"[tw] OR "contact tracing"[mh] OR "contact tracing"[tw] OR "contact trace"[tw] OR "trace contacts"[tw] OR "social distancing"[tw] OR "physical distancing"[tw] OR "handwashing"[tw] OR "hand washing"[tw] OR "hand hygiene"[tw] OR "hand disinfection"[tw] OR "masks"[mh:noexp] OR "mask"[tw] OR "masked"[tw] OR "mask"[tw] OR "isolation"[tiab] OR "isolated"[tw] OR "event cancellation"[tw] OR "event cancellations"[tw] OR "event postponement"[tw] OR "event postponements"[tw] OR "travel restriction"[tw] OR "travel restrictions"[tw] OR "travel ban"[tw] OR "travel bans"[tw] OR "border closure"[tw] OR "border closures"[tw] OR "border restrictions"[tw] OR "border restriction"[tw] OR "traffic closure"[tw] OR "traffic closures"[tw] OR "traffic isolation"[tw] OR "traffic ban"[tw] OR "traffic control"[tw] OR "household confinement"[tw] OR "symptom screening"[tw] OR "symptom screenings"[tw] OR "nursing home closure"[tw] OR "nursing home closures"[tw] OR ("long term care"[tw] AND ("closure"[tw] OR "closures"[tw])) OR "venue closure"[tw] OR "venue closures"[tw] OR "restaurant closure"[tw] OR "restaurant closures"[tw] OR "limited gatherings"[tw] OR "limited gathering"[tw] OR (("testing"[tw] OR "screen"[tw] OR "screening"[tw]) AND ("symptomatic"[tw] OR "asymptomatic"[tw])) OR (("military"[tw] OR "national guard"[tw] OR "police"[tw]) AND ("deployment"[tw] OR "deployed"[tw])) OR "state of emergency"[tw] OR "surface cleaning"[tw] OR "surface disinfection"[tw]) AND ("COVID-19"[tw] OR "COVID 19"[tw] OR "COVID19"[tw] OR "COVID2019"[tw] OR "COVID 2019"[tw] OR "COVID-2019"[tw] OR "novel coronavirus"[tw] OR "new coronavirus"[tw] OR "novel corona virus"[tw] OR "new corona virus"[tw] OR "SARS-CoV-2"[tw] OR "SARSCoV2"[tw] OR "SARS-CoV2"[tw] OR "2019nCoV"[tw] OR "2019-nCoV"[tw] OR "2019 coronavirus"[tw] OR "2019 corona virus"[tw] OR "coronavirus disease 2019"[tw] OR "severe acute respiratory syndrome coronavirus 2"[nm] OR "severe acute respiratory syndrome coronavirus 2"[tw] OR "sars-coronavirus-2"[tw] OR "coronavirus disease 2019"[tw] OR "corona virus disease 2019"[tw]) NOT ("letter"[pt] OR "comment"[pt] OR "editorial"[pt] OR "review"[pt] OR "letter"[ti] OR "comment"[ti] OR "editorial"[ti] OR "brief communication"[ti] OR "review"[ti])',
  Pharmaceutical_interventions:
    '("Drug Therapy"[Mesh] OR "drug therapy"[tiab] OR "drug treatment"[tiab] OR "drug target"[tiab] OR "drug targets"[tiab] OR "drug trial" OR "drug trials" OR "pharmaceutical"[tiab] OR "drug repurposing" OR "antiviral"[tiab] OR "antivirals"[tiab] OR "agents"[tiab] OR "corticosteroid" OR "corticosteroids" OR "Angiotensin receptor blocker" OR "angiotensin receptor blockers" OR "statin" OR "statins" OR "hydroxychloroquine" OR "chloroquine" OR "oseltamivir" OR "arbidol" OR "remdesivir" OR "favipiravir" OR "angiotensin-converting enzyme inhibitors"[mh] OR "angiotensin-converting enzyme inhibitor" OR "angiotensin-converting enzyme inhibitors" OR "ACE inhibitor" OR "ACE inhibitors" OR "immunoglobulins"[mh] OR "immunoglobulin" OR "immunoglobulins" OR "IVIG" OR "arbidol"[nm] OR "arbidol" OR "umifenovir" OR "azithromycin"[mh] OR "azithromycin" OR "carrimycin" OR "danoprevir"[nm] OR "danoprevir" OR "interferons"[mh] OR "interferon" OR "interferons" OR "IFN" OR "darunavir"[mh] OR "darunavir" OR "prezista" OR "cobicistat"[mh] OR "cobicistat" OR "tybost" OR "Recombinant human interferon α2β" OR "recombinant human interferon alpha 2 beta" OR "thalidomide"[mh] OR "thalidomide" OR "sedoval" OR "thalomid" OR "methylprednisolone"[mh] OR "methylprednisolone" OR "metipred" OR "urbason" OR "Medrol" OR "pirfenidone"[nm] OR "pirfenidone" OR "Esbriet" OR "deskar" OR "bevacizumab"[mh] OR "bevacizumab" OR "mvasi" OR "avastin" OR "fingolimod hydrochloride"[mh] OR "fingolimod" OR "gilenya" OR "gilenia" OR "bromhexine"[mh] OR "bromhexine" OR "Clevudine"[nm] OR "clevudine" OR "Povidone-iodine"[mh] OR "povidone-iodine" OR "betadine" OR "minidyne" OR "Ruxolitinib" OR "INCB018424"[nm] OR "Acalabrutinib"[nm] OR "acalabrutinib" OR "calquence" OR "Vazegepant" OR "Eculizumab"[nm] OR "eculizumab" OR "soliris" OR "Lopinavir"[mh] OR "lopinavir" OR "Ritonavir"[mh] OR "ritonavir" OR "norvir" OR "Imatinib mesylate"[mh] OR "imatinib" OR "gleevec" OR "Baricitinib"[nm] OR "baricitinib" OR "olumiant" OR "dexamethasone"[mh] OR "dexamethasone" OR "decadron" OR "Leronlimab"[nm] OR "leronlimab" OR "Dalargin" OR "Mefloquin"[mh] OR "mefloquin" OR "mephloquine" OR "lariam" OR "Spironolactone"[mh] OR "spironolactone" OR "aldactone" OR "carospir" OR "Tocilizumab"[nm] OR "tocilizumab" OR "Clazakizumab"[nm] OR "clazakizumab" OR "Pyridostigmine bromide"[mh] OR "pyridostigmine" OR "mestinon" OR "indomethacin"[mh] OR "indomethacin" OR "indomethacine" OR "Indocin" OR "tivorbex" OR "Azithromycin"[mh] OR "azithromycin" OR "Zithromax" OR "Danoprevir"[nm] OR "danoprevir" OR "Tinzaparin"[mh] OR "tinzaparin" OR "innohep" OR "heparin"[mh] OR "Heparin" OR "Nitazoxanide"[nm] OR "nitazoxanide" OR "Ivermectin"[mh] OR "Ivermectin" OR "Niclosamide"[mh] OR "niclosamide" OR "Sarilumab"[nm] OR "sarilumab" OR "kevzara" OR "camostat"[nm] OR "Camostat" OR "tretinoin"[mh] OR "tretinoin" OR "Retinoic acid" OR "isotrentinoin" OR "vitamin a"[mh] OR "vitamin a" OR "methotrexate"[mh] OR "methotrexate" OR "Nafamostat"[nm] OR "nafamostat" OR "melatonin"[mh] OR "melatonin") AND ("COVID-19"[tw] OR "COVID 19"[tw] OR "COVID19"[tw] OR "COVID2019"[tw] OR "COVID 2019"[tw] OR "COVID-2019"[tw] OR "novel coronavirus"[tw] OR "new coronavirus"[tw] OR "novel corona virus"[tw] OR "new corona virus"[tw] OR "SARS-CoV-2"[tw] OR "SARSCoV2"[tw] OR "SARS-CoV2"[tw] OR "2019nCoV"[tw] OR "2019-nCoV"[tw] OR "2019 coronavirus"[tw] OR "2019 corona virus"[tw] OR "coronavirus disease 2019"[tw] OR "severe acute respiratory syndrome coronavirus 2"[nm] OR "severe acute respiratory syndrome coronavirus 2"[tw] OR "sars-coronavirus-2"[tw] OR "coronavirus disease 2019"[tw] OR "corona virus disease 2019"[tw]) NOT ("letter"[pt] OR "comment"[pt] OR "editorial"[pt] OR "review"[pt] OR "letter"[ti] OR "comment"[ti] OR "editorial"[ti] OR "brief communication"[ti] OR "review"[ti])',
}

/** This is used as a quick hack to partly mitigate issue #628, which causes some abstracts to be imported as arrays */
const joinToStringIfArray = x => (Array.isArray(x) ? x.join(' ') : x)

const getData = async (groupId, ctx) => {
  const manuscripts = await Manuscript.query().where({ groupId })
  const currentArticleURLs = manuscripts.map(m => m.submission.$sourceUri)

  const dateTwoWeeksAgoFormatted = new Date(Date.now() - 12096e5)
    .toISOString()
    .split('T')[0]
    .replace(/-/g, '/')

  const dateTodayFormatted = new Date(Date.now())
    .toISOString()
    .split('T')[0]
    .replace(/-/g, '/')

  const [checkIfSourceExists] = await ArticleImportSources.query().where({
    server: 'pubmed',
  })

  if (!checkIfSourceExists) {
    await ArticleImportSources.query().insert({
      server: 'pubmed',
    })
  }

  const [pubmedImportSourceId] = await ArticleImportSources.query().where({
    server: 'pubmed',
  })

  const lastImportDate = await ArticleImportHistory.query()
    .select('date')
    .where({
      sourceId: pubmedImportSourceId.id,
      groupId,
    })

  const minDate = lastImportDate.length
    ? new Date(lastImportDate[0].date)
        .toISOString()
        .split('T')[0]
        .toString()
        .replace(/-/g, '/')
    : dateTwoWeeksAgoFormatted

  const topicsPromises = Object.entries(pubmedQueries).map(
    async ([topic, query], index) => {
      await delay(2000 * index)

      const formData = new FormData()

      const eUtilsUrlParameters = {
        retmax: '100000',
        retmode: 'json',
        db: 'pubmed',
        term: query,
        usehistory: 'y',
        mindate: minDate,
        maxdate: dateTodayFormatted,
      }

      Object.entries(eUtilsUrlParameters).map(([key, value]) =>
        formData.append(key, value),
      )

      try {
        const { data } = await axios.post(
          `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi`,
          formData,
          {
            headers: formData.getHeaders(),
          },
        )

        return { topic, ids: data.esearchresult.idlist }
      } catch (err) {
        console.error(
          `Failed to retrieve pubmed data for topic ${topic}. Query:\n${query}\n${err.message}`,
        )
      }
    },
  )

  const topicsIdsResponse = []

  for (const topicIdPromise of topicsPromises) {
    const topicIdResponse = await topicIdPromise

    if (!topicIdResponse) continue

    const filteredTopicIdResponse = topicIdResponse.ids
      .map(id => {
        if (topicsIdsResponse.length > 0) {
          const cc = topicsIdsResponse.map(el => {
            if (!el.ids.includes(id)) {
              return id
            }

            return true
          })

          return !cc.includes(true) ? cc[0] : null
        }

        return id
      })
      .filter(Boolean)

    topicsIdsResponse.push({
      topic: topicIdResponse.topic,
      ids: filteredTopicIdResponse,
    })
  }

  const submissionForm = await getSubmissionForm(groupId)

  const parsedFormStructure = submissionForm.structure.children
    .map(formElement => {
      const parsedName = formElement.name && formElement.name.split('.')[1]

      if (parsedName) {
        return {
          name: parsedName,
          component: formElement.component,
        }
      }

      return undefined
    })
    .filter(x => x !== undefined)

  const emptySubmission = parsedFormStructure.reduce((acc, curr) => {
    acc[curr.name] =
      curr.component === 'CheckboxGroup' || curr.component === 'LinksInput'
        ? []
        : ''
    return {
      ...acc,
    }
  }, {})

  const topicsIdsResult = topicsIdsResponse.map(
    async ({ topic, ids }, index) => {
      if (!ids.length) {
        return
      }

      const formData = new FormData()

      await delay(3000 * index)
      const idList = ids.join(',')

      const eFetchUrlParameters = {
        db: 'pubmed',
        id: idList,
        tool: 'my_tool',
        email: 'my_email@example.com',
        retmode: 'xml',
      }

      Object.entries(eFetchUrlParameters).map(([key, value]) =>
        formData.append(key, value),
      )

      const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi`

      let idsResponse

      try {
        idsResponse = await axios
          .post(url, formData, { responseType: 'text' })
          .then(response => response.data)
      } catch (fetchError) {
        logger.error(
          `[PUBMED-IMPORT]: failed to fetch from ${url}: ${fetchError.message}`,
        )
      }

      const { PubmedArticleSet } = await JSON.parse(
        xml2json.xml2json(idsResponse, {
          compact: true,
          spaces: 2,
        }),
      )

      const currentDOIs = currentArticleURLs
        .map(articleUrl => {
          if (articleUrl) {
            if (articleUrl.includes('https://doi.org')) {
              return articleUrl.split('doi.org/')[1]
            }

            if (articleUrl.split('content/')[1]) {
              return articleUrl
                .split('content/')[1]
                .split(selectVersionRegexp)[0]
            }

            console.log('broken url should be here')
            console.log(articleUrl)
            return null
          }

          return null
        })
        .filter(Boolean)

      const singleElocationId = eLocationID =>
        eLocationID ? eLocationID._text : ''

      const pubmedDOI = MedlineCitation => {
        return Array.isArray(MedlineCitation.Article.ELocationID)
          ? MedlineCitation.Article.ELocationID.filter(
              ids => ids._attributes.EIdType === 'doi',
            )[0]._text
          : singleElocationId(MedlineCitation.Article.ELocationID)
      }

      const singlePubmedArticles = MedlineCitation =>
        !currentDOIs.includes(pubmedDOI(MedlineCitation))
          ? [PubmedArticleSet.PubmedArticle]
          : []

      const withoutDuplicates = Array.isArray(PubmedArticleSet.PubmedArticle)
        ? PubmedArticleSet.PubmedArticle.filter(({ MedlineCitation }) => {
            return !currentDOIs.includes(pubmedDOI(MedlineCitation))
          })
        : singlePubmedArticles(PubmedArticleSet.PubmedArticle.MedlineCitation)

      const newManuscripts = withoutDuplicates
        .map(({ MedlineCitation }) => {
          const { AuthorList, ArticleTitle, Abstract, Journal } =
            MedlineCitation.Article

          const year = Journal.JournalIssue.PubDate.Year
            ? Journal.JournalIssue.PubDate.Year._text
            : null

          const month = Journal.JournalIssue.PubDate.Month
            ? Journal.JournalIssue.PubDate.Month._text
            : null

          const day = Journal.JournalIssue.PubDate.Day
            ? Journal.JournalIssue.PubDate.Day._text
            : null

          const publishedDate = [year, month, day].filter(Boolean).join('-')

          const topics = topic ? [topic] : []

          // for some titles HTML is returned, need to find _text property in nested object
          const flattedArticleTitle = flattenObj(ArticleTitle)

          // the name of nested property in objects is always _text
          const titlePropName = Object.keys(flattedArticleTitle).find(key =>
            key.includes('_text'),
          )

          const articleTitle = flattedArticleTitle[titlePropName]

          let abstract = ''

          if (Abstract?.AbstractText) {
            if (Abstract.AbstractText.length) {
              abstract = Abstract.AbstractText.map(
                textWithAttributes =>
                  `<p><b>${
                    textWithAttributes._attributes
                      ? textWithAttributes._attributes.Label
                      : ''
                  }</b> <br/> ${joinToStringIfArray(
                    textWithAttributes._text,
                  )}</p>`,
              )
                .join('')
                .replace(/\n/gi, '')
            } else {
              abstract = joinToStringIfArray(Abstract.AbstractText._text)
            }
          }

          return publishedDate
            ? {
                status: 'new',
                isImported: true,
                importSource: pubmedImportSourceId.id,
                importSourceServer: 'pubmed',
                submission: {
                  ...emptySubmission,
                  firstAuthor: AuthorList
                    ? AuthorList.Author.length
                      ? AuthorList.Author.map(
                          ({ ForeName, LastName }) =>
                            `${ForeName ? ForeName._text : ''} ${
                              LastName ? LastName._text : ''
                            }`,
                        ).join(', ')
                      : [
                          `${
                            AuthorList.Author.ForeName
                              ? AuthorList.Author.ForeName._text
                              : ''
                          } ${
                            AuthorList.Author.LastName
                              ? AuthorList.Author.LastName._text
                              : ''
                          }`,
                        ]
                    : [],
                  datePublished: publishedDate,
                  $sourceUri: `https://doi.org/${pubmedDOI(MedlineCitation)}`,
                  $title: articleTitle,
                  $abstract: abstract,
                  topics,
                  initialTopicsOnImport: topics,
                  journal: Journal.Title._text,
                },
                meta: {},
                submitterId: ctx.userId,
                channels: [
                  {
                    topic: 'Manuscript discussion',
                    type: 'all',
                    groupId,
                  },
                  {
                    topic: 'Editorial discussion',
                    type: 'editorial',
                    groupId,
                  },
                ],
                files: [],
                reviews: [],
                teams: [],
                groupId,
              }
            : null
        })
        .filter(Boolean)

      if (!newManuscripts.length) return []

      try {
        const inserted = await Manuscript.query().upsertGraphAndFetch(
          newManuscripts,
          { relate: true },
        )

        return inserted
      } catch (e) {
        console.error(e.message)
      }
    },
  )

  if (lastImportDate.length) {
    await ArticleImportHistory.query()
      .update({
        date: new Date().toISOString(),
      })
      .where({
        date: lastImportDate[0].date,
        groupId,
      })
  } else {
    await ArticleImportHistory.query().insert({
      date: new Date().toISOString(),
      sourceId: pubmedImportSourceId.id,
      groupId,
    })
  }

  const results = Promise.all(topicsIdsResult)
  return results
}

module.exports = getData
