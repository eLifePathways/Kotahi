import { useEffect, useState, type ReactNode } from 'react'
import { Input } from 'antd'
import { sanitize } from 'isomorphic-dompurify'
import { debounce } from 'lodash'
import styled from 'styled-components'
import { grid, th } from '@coko/client'

import Button from '../../shared/Button'
import ButtonGroup from '../../shared/ButtonGroup'
import type { Csl } from './ReferenceServices'

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${grid(1.5)};
`

const Row = styled.div`
  display: grid;
  gap: ${grid(1)};
  grid-template-columns: repeat(auto-fit, minmax(${grid(30)}, 1fr));
`

const Label = styled.label`
  display: flex;
  flex-direction: column;
  font-size: ${th('fontSizeBaseSmall')};
  gap: ${grid(0.5)};
`

const Preview = styled.div`
  background: ${th('colorBackgroundHue')};
  border-radius: ${th('borderRadius')};
  padding: ${grid(1)};
`

type Field = { key: keyof Csl & string; label: string }

const fields: Field[] = [
  { key: 'title', label: 'Article title' },
  { key: 'container-title', label: 'Journal' },
  { key: 'doi', label: 'DOI' },
  { key: 'volume', label: 'Volume' },
  { key: 'issue', label: 'Issue' },
  { key: 'page', label: 'Pages' },
  { key: 'citation-number', label: 'Citation number' },
]

const yearOf = (csl: Csl): string =>
  typeof csl.issued === 'object' ? (csl.issued?.raw ?? '') : (csl.issued ?? '')

type CitationFormProps = {
  initial: Csl
  format?: (
    csl: Csl,
  ) => Promise<{ formattedCitation: string; citeHtml?: string }>
  onCancel: () => void
  onSave: (csl: Csl) => void
}

const CitationForm = ({
  initial,
  format,
  onCancel,
  onSave,
}: CitationFormProps): ReactNode => {
  const [csl, setCsl] = useState<Csl>(() => ({
    author: [],
    title: '',
    'container-title': initial.journalTitle ?? '',
    issued: { raw: '' },
    ...initial,
  }))
  const [formatted, setFormatted] = useState(initial.formattedCitation ?? '')

  useEffect(() => {
    if (!format) return undefined
    let cancelled = false

    const run = debounce(async () => {
      const result = await format(csl)
      if (!cancelled) setFormatted(result.formattedCitation)
    }, 250)

    run()

    return (): void => {
      cancelled = true
      run.cancel()
    }
  }, [csl, format])

  const set = (key: string, value: unknown): void =>
    setCsl(prev => ({ ...prev, [key]: value }))

  const setAuthor = (
    index: number,
    key: 'given' | 'family',
    value: string,
  ): void =>
    set(
      'author',
      (csl.author ?? []).map((a, i) =>
        i === index ? { ...a, [key]: value } : a,
      ),
    )

  return (
    <Form
      onSubmit={(event): void => {
        event.preventDefault()
        onSave({ ...csl, formattedCitation: formatted })
      }}
    >
      <Preview dangerouslySetInnerHTML={{ __html: sanitize(formatted) }} />
      {(csl.author ?? []).map((author, index) => (
        <Row key={index}>
          <Label>
            Family name
            <Input
              onChange={(event): void =>
                setAuthor(index, 'family', event.target.value)
              }
              value={author.family ?? ''}
            />
          </Label>
          <Label>
            Given name
            <Input
              onChange={(event): void =>
                setAuthor(index, 'given', event.target.value)
              }
              value={author.given ?? ''}
            />
          </Label>
          <Button
            onClick={(): void =>
              set(
                'author',
                (csl.author ?? []).filter((_, i) => i !== index),
              )
            }
            size="small"
          >
            Remove author
          </Button>
        </Row>
      ))}
      <ButtonGroup justify="left">
        <Button
          onClick={(): void =>
            set('author', [...(csl.author ?? []), { given: '', family: '' }])
          }
          size="small"
        >
          Add author
        </Button>
      </ButtonGroup>
      <Row>
        {fields.map(field => (
          <Label key={field.key}>
            {field.label}
            <Input
              onChange={(event): void => set(field.key, event.target.value)}
              value={(csl[field.key] as string | undefined) ?? ''}
            />
          </Label>
        ))}
        <Label>
          Year
          <Input
            onChange={(event): void =>
              set('issued', { raw: event.target.value })
            }
            value={yearOf(csl)}
          />
        </Label>
      </Row>
      <ButtonGroup justify="right">
        <Button onClick={onCancel} size="small">
          Back
        </Button>
        <Button htmlType="submit" size="small" type="primary">
          Save
        </Button>
      </ButtonGroup>
    </Form>
  )
}

export default CitationForm
