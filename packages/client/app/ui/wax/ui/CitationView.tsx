import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Radio } from 'antd'
import {
  CheckCircleOutlined,
  LoadingOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'
import { sanitize } from 'isomorphic-dompurify'
import { useTranslation } from 'react-i18next'
import striptags from 'striptags'
import styled from 'styled-components'
import { grid, th } from '@coko/client'

import Button from '../../shared/Button'
import ButtonGroup from '../../shared/ButtonGroup'
import Modal from '../../shared/Modal'
import type { NodeViewProps } from '../editor'
import {
  referenceContentFrom,
  referenceHtml,
  updateReference,
} from '../features/citation'
import CitationForm from './CitationForm'
import { useReferenceServices, type Csl } from './ReferenceServices'

type Structures = {
  original: string
  anyStyle: Csl | ''
  crossRef: Csl[]
  datacite: Csl | []
  custom: Csl | ''
}

type Version = { key: string; label: string; csl: Csl | null; html: string }

const DOI = /(10.(\d)+\/([^(\s>"<)])+)/i

const Wrapper = styled.div<{ $readOnly: boolean }>`
  align-items: flex-start;
  cursor: ${(props): string => (props.$readOnly ? 'default' : 'pointer')};
  display: flex;
  gap: ${grid(1)};
  justify-content: space-between;

  p {
    margin: 0;
  }

  & [data-citation-number]::before {
    content: attr(data-citation-number) '.';
    display: inline-block;
    min-width: 3em;
    text-align: right;
  }

  & [data-citation-number] p.ref {
    display: inline;
    margin-left: 0.5em;
  }
`

const StyleName = styled.span`
  color: ${th('colorTextMuted')};
  font-size: ${th('fontSizeBaseSmall')};
  font-weight: normal;
  margin-left: ${grid(1)};
`

const Status = styled.span`
  color: ${th('colorTextMuted')};
  font-size: ${th('fontSizeBase')};
`

const Versions = styled(Radio.Group)`
  display: flex;
  flex-direction: column;
  gap: ${grid(1)};
`

const VersionLabel = styled.span`
  color: ${th('colorTextMuted')};
  font-size: ${th('fontSizeBaseSmall')};
`

const textContentOf = (html: string): string => {
  const element = document.createElement('div')
  element.innerHTML = html
  return element.textContent ?? ''
}

const versionsFrom = (structures: Structures): Version[] => {
  const result: Version[] = [
    {
      key: 'original',
      label: 'Original',
      csl: null,
      html: structures.original,
    },
  ]

  if (structures.anyStyle && structures.anyStyle.formattedCitation)
    result.push({
      key: 'anystyle',
      label: 'AnyStyle',
      csl: structures.anyStyle,
      html: structures.anyStyle.formattedCitation,
    })

  if (
    !Array.isArray(structures.datacite) &&
    structures.datacite.formattedCitation
  )
    result.push({
      key: 'datacite',
      label: 'Datacite',
      csl: structures.datacite,
      html: structures.datacite.formattedCitation,
    })

  structures.crossRef.forEach((csl, index) => {
    if (csl?.formattedCitation)
      result.push({
        key: `crossref-${index}`,
        label: 'CrossRef',
        csl,
        html: csl.formattedCitation,
      })
  })

  if (structures.custom && structures.custom.formattedCitation)
    result.push({
      key: 'custom',
      label: 'Custom',
      csl: structures.custom,
      html: structures.custom.formattedCitation,
    })

  return result
}

const CitationView = ({ node, view, getPos }: NodeViewProps): ReactNode => {
  const services = useReferenceServices()
  const { t } = useTranslation()
  const { needsReview, needsValidation, possibleStructures, citationNumber } =
    node.attrs
  const html = `<p class="ref">${referenceHtml(view.state, node)}</p>`
  const original: string = node.attrs.originalText || html
  const structures: Structures = {
    original: possibleStructures?.original || original,
    anyStyle: possibleStructures?.anyStyle || '',
    crossRef: possibleStructures?.crossRef || [],
    datacite: possibleStructures?.datacite || [],
    custom: possibleStructures?.custom || '',
  }

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [choice, setChoice] = useState('original')
  const started = useRef(false)

  const update = (attrs: Record<string, unknown>, content?: string): void => {
    const pos = getPos()
    if (pos === undefined) return
    updateReference(
      pos,
      attrs,
      content !== undefined
        ? referenceContentFrom(view.state, content)
        : undefined,
    )(view.state, view.dispatch)
  }

  useEffect(() => {
    if (!needsValidation || started.current || !services.crossRef) return
    started.current = true

    const lookup = async (): Promise<void> => {
      setLoading(true)
      const doi = services.getDataFromDatacite
        ? original.match(DOI)?.[0]
        : undefined

      if (doi) {
        const response = await services.crossRef(doi, true, false)
        const match = response.matches?.[0]

        if (match) {
          const csl = { ...match, 'citation-number': citationNumber || '' }
          const next = response.fromCrossref
            ? { ...structures, crossRef: [csl], datacite: [] as [] }
            : { ...structures, datacite: csl }
          update(
            {
              structure: csl,
              possibleStructures: next,
              originalText: original,
              needsValidation: false,
              needsReview: false,
              valid: true,
            },
            csl.formattedCitation,
          )
          setLoading(false)
          return
        }
      }

      const content = striptags(original)

      const [anyStyleResponse, crossRefResponse] = await Promise.all([
        services.anyStyle
          ? services.anyStyle({ content })
          : Promise.resolve(content),
        services.crossRef(original, false),
      ])

      const parsed: Csl =
        anyStyleResponse === content
          ? {}
          : (JSON.parse(anyStyleResponse)[0] ?? {})
      const number = citationNumber || parsed['citation-number'] || ''

      update({
        possibleStructures: {
          ...structures,
          anyStyle: { ...parsed, 'citation-number': number },
          crossRef: (crossRefResponse || []).map(c => ({
            ...c,
            'citation-number': number,
          })),
        },
        originalText: original,
        citationNumber: number,
        needsValidation: false,
        needsReview: true,
        valid: false,
      })
      setLoading(false)
    }

    lookup().catch(() => setLoading(false))
  })

  const versions = versionsFrom(structures)
  const selected = versions.find(v => v.key === choice) ?? versions[0]

  const apply = (csl: Csl | null, content: string, extra = {}): void => {
    update(
      {
        structure: csl ?? {},
        valid: true,
        needsValidation: false,
        needsReview: false,
        citationNumber: csl?.['citation-number'] || citationNumber,
        ...extra,
      },
      content,
    )
    setOpen(false)
    setEditing(false)
    view.focus()
  }

  const saveCustom = (csl: Csl): void => {
    const known = versions.some(
      v => v.csl && v.csl.formattedCitation === csl.formattedCitation,
    )

    apply(csl, csl.formattedCitation ?? '', {
      possibleStructures: { ...structures, custom: known ? '' : csl },
    })
  }

  const status = (): ReactNode => {
    if (needsValidation || loading)
      return <LoadingOutlined aria-label="Needs validation" />
    if (needsReview) return <UnorderedListOutlined aria-label="Needs review" />
    return <CheckCircleOutlined aria-label="Valid" />
  }

  const openPicker = (): void => {
    if (services.readOnly) return
    const current = versions.find(
      v => textContentOf(v.html) === textContentOf(html),
    )
    setChoice(current?.key ?? 'original')
    setOpen(true)
  }

  return (
    <>
      <Wrapper
        $readOnly={!!services.readOnly}
        onClick={openPicker}
        role="presentation"
      >
        <div
          dangerouslySetInnerHTML={{ __html: sanitize(html) }}
          data-citation-number={
            !citationNumber || services.styleName ? undefined : citationNumber
          }
        />
        <Status>{status()}</Status>
      </Wrapper>
      <Modal
        footer={null}
        onCancel={(): void => {
          setOpen(false)
          setEditing(false)
        }}
        open={open}
        title={
          <>
            {editing ? 'Edit citation' : 'Select citation'}
            <StyleName>
              {t(`configPage.production.${services.styleName || 'apa'}`)}
            </StyleName>
          </>
        }
        width={800}
      >
        {editing ? (
          <CitationForm
            format={services.citeProc}
            initial={selected.csl ?? node.attrs.structure ?? {}}
            onCancel={(): void => setEditing(false)}
            onSave={saveCustom}
          />
        ) : (
          <>
            <Versions
              onChange={(event): void => setChoice(event.target.value)}
              value={selected.key}
            >
              {versions.map(version => (
                <Radio key={version.key} value={version.key}>
                  <div
                    dangerouslySetInnerHTML={{ __html: sanitize(version.html) }}
                  />
                  <VersionLabel>{version.label}</VersionLabel>
                </Radio>
              ))}
            </Versions>
            <Modal.footer>
              <ButtonGroup justify="right">
                {selected.key !== 'original' ? (
                  <Button
                    disabled={loading}
                    onClick={(): void => setEditing(true)}
                    size="small"
                  >
                    Edit
                  </Button>
                ) : null}
                <Button
                  onClick={(): void => apply(selected.csl, selected.html)}
                  size="small"
                  type="primary"
                >
                  Apply
                </Button>
              </ButtonGroup>
            </Modal.footer>
          </>
        )}
      </Modal>
    </>
  )
}

export default CitationView
