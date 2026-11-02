import { describe, it, expect } from 'vitest'

/* eslint-disable-next-line import/default */
import validateJats from '../validation'

const correctJats = `<article xml:lang="en" xmlns:mml="http://www.w3.org/1998/Math/MathML" xmlns:xlink="http://www.w3.org/1999/xlink" dtd-version="1.3"><front><journal-meta><journal-id journal-id-type="pmc">BMJ</journal-id><journal-id journal-id-type="publisher">BR MED J</journal-id><journal-title-group><journal-title>Journal Title</journal-title><abbrev-journal-title>Jour.Ti.</abbrev-journal-title></journal-title-group><issn publication-format="print">1063-777X</issn><issn publication-format="electronic">1090-6517</issn><publisher><publisher-name>Journal Publisher Inc.</publisher-name></publisher></journal-meta><article-meta><title-group><article-title>This is the title</article-title></title-group></article-meta></front><body><p>This is some JATS.</p></body></article>`

const incorrectJats = `<article xml:lang="en" xmlns:mml="http://www.w3.org/1998/Math/MathML" xmlns:xlink="http://www.w3.org/1999/xlink" dtd-version="1.3"><front><journal-meta><journal-id journal-id-type="pmc">BMJ</journal-id><journal-id journal-id-type="publisher">BR MED J</journal-id><journal-title-group><journal-title>Journal Title</journal-title><abbrev-journal-title>Jour.Ti.</abbrev-journal-title></journal-title-group><issn publication-format="print">1063-777X</issn><issn publication-format="electronic">1090-6517</issn><publisher><publisher-name>Journal Publisher Inc.</publisher-name></publisher></journal-meta><article-meta><article-id pub-id-type="publisher-id">internalId</article-id><title-group><article-title>This is the title</article-title></title-group><contrib-group><contrib contrib-type="author"><name><surname>Quinlan</surname><given-names>Gabriela M. </given-names></name></contrib></contrib-group><pub-date publication-format="print" date-type="pub" iso-8601-date="2022-4-28"><day>28</day><month>4</month><year>2022</year></pub-date><volume>2021</volume><issue>2</issue><abstrffact><p>Agriculturally important commercially managed pollinators</p></abstrffact><kwd-group kwd-group-type="author"><kwd>Aging (Healthy and Neurodegenerative Disorders)</kwd><kwd>Social Neuroscience, Emotion, and Motivation</kwd><kwd>NIRS</kwd></kwd-group></article-meta></front><body><p>This is some JATS.</p></body></article>`

describe('validateJats', () => {
  it('valid JATS', async () => {
    const result = await validateJats(correctJats)
    expect(result).toEqual([])
  })

  it('invalid JATS', async () => {
    const result = await validateJats(incorrectJats)
    expect(JSON.stringify(result)).toEqual(
      '[{"message":"Element \'abstrffact\': This element is not expected. Expected is one of ( issue, issue-id, issue-title, issue-title-group, issue-sponsor, issue-part, volume-issue-group, isbn, supplement, fpage ).\\n","line":1,"col":0}]',
    )
  })
})
