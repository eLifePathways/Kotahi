import { useRef, useState, type ReactNode } from 'react'
import { Input, Tabs } from 'antd'
import { DOMSerializer } from 'prosemirror-model'
import {
  CloseOutlined,
  CopyOutlined,
  DeleteOutlined,
  RedoOutlined,
  RobotOutlined,
  SendOutlined,
} from '@ant-design/icons'
import { sanitize } from 'isomorphic-dompurify'
import styled from 'styled-components'
import { grid, th } from '@coko/client'

import Button from '../../shared/Button'
import ButtonGroup from '../../shared/ButtonGroup'
import Switch from '../../shared/Switch'
import { useWax } from '../editor'
import { replaceSelectedText, setAiSelection } from '../features/askAi'
import SelectionOverlay from './SelectionOverlay'

const DEFAULT_KEY = 'content'

type Result = Record<string, string | string[]>

export type AskAiOptions = { askKb: boolean; prevResult: Result }

type AskAiProps = {
  transform: (
    input: { text: string[] },
    options: AskAiOptions,
  ) => Promise<string>
  freeTextPrompts?: boolean
  customPrompts?: string[]
  knowledgeBase?: boolean
}

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${grid(1.5)};
  width: ${grid(80)};
`

const Header = styled.div`
  align-items: center;
  display: flex;
  font-size: ${th('fontSizeBase')};
  justify-content: space-between;
`

const ResultBox = styled.div`
  border: 1px solid ${th('colorBorder')};
  border-radius: ${th('borderRadius')};
  max-height: ${grid(60)};
  overflow-y: auto;
  padding: ${grid(1)};
`

const Prompts = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${grid(0.5)};
`

const parse = (response: string): Result => {
  try {
    const parsed = JSON.parse(response)
    return typeof parsed === 'object' && parsed
      ? parsed
      : { [DEFAULT_KEY]: response }
  } catch {
    return { [DEFAULT_KEY]: response }
  }
}

const toHtml = (key: string, value: string | string[] | undefined): string => {
  if (typeof value === 'string') return value
  if (!value) return ''

  return key === 'links'
    ? value
        .map(link => `<a href="${link}" target="_blank">${link}</a><br>`)
        .join('')
    : value.map(item => `<p>${item}</p>`).join('')
}

const AskAiPanel = ({
  transform,
  freeTextPrompts = true,
  customPrompts = [],
  knowledgeBase = false,
  onClose,
}: AskAiProps & { onClose: () => void }): ReactNode => {
  const view = useWax(s => s.view)
  const resultRef = useRef<HTMLDivElement>(null)
  const [prompt, setPrompt] = useState('')
  const [askKb, setAskKb] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result>({})
  const [tab, setTab] = useState(DEFAULT_KEY)
  const [lastPrompt, setLastPrompt] = useState('')

  const selectedHtml = (): string => {
    if (!view) return ''
    const { from, to } = view.state.selection
    const container = document.createElement('div')
    container.appendChild(
      DOMSerializer.fromSchema(view.state.schema).serializeFragment(
        view.state.doc.slice(from, to).content,
      ),
    )
    return container.innerHTML
  }

  const submit = async (text: string): Promise<void> => {
    if (!text.trim()) return
    setLoading(true)
    setLastPrompt(text)

    try {
      const context = resultRef.current?.textContent || selectedHtml()
      const response = await transform(
        { text: [text, context] },
        { askKb, prevResult: result },
      )
      const next = parse(response)
      setResult(next)
      setTab(Object.keys(next)[0] ?? DEFAULT_KEY)
    } catch (error) {
      setResult({ [DEFAULT_KEY]: String(error) })
      setTab(DEFAULT_KEY)
    } finally {
      setLoading(false)
      setPrompt('')
    }
  }

  const output = (): string => resultRef.current?.innerHTML ?? ''

  const insert = (replace: boolean): void => {
    if (!view) return
    replaceSelectedText(view, output(), replace)
    onClose()
  }

  const hasResult = Object.keys(result).length > 0

  return (
    <Panel>
      <Header>
        <span>
          <RobotOutlined /> AI assistant
        </span>
        <Button
          aria-label="Close"
          icon={<CloseOutlined />}
          onClick={onClose}
          size="small"
          type="text"
        />
      </Header>
      {hasResult ? (
        <>
          <Tabs
            activeKey={tab}
            items={Object.keys(result).map(key => ({ key, label: key }))}
            onChange={setTab}
            size="small"
          />
          <ResultBox
            contentEditable={tab === DEFAULT_KEY}
            dangerouslySetInnerHTML={{
              __html: sanitize(toHtml(tab, result[tab])),
            }}
            key={tab}
            ref={resultRef}
            suppressContentEditableWarning
          />
          <ButtonGroup justify="right">
            <Button
              icon={<CopyOutlined />}
              onClick={(): void => {
                navigator.clipboard.writeText(
                  resultRef.current?.textContent ?? '',
                )
              }}
              size="small"
              title="Copy"
            />
            <Button
              icon={<RedoOutlined />}
              onClick={(): void => {
                submit(`Try this again: ${lastPrompt}`)
              }}
              size="small"
              title="Try again"
            />
            <Button
              icon={<DeleteOutlined />}
              onClick={(): void => setResult({})}
              size="small"
              title="Discard"
            />
            <Button onClick={(): void => insert(false)} size="small">
              Insert
            </Button>
            <Button
              onClick={(): void => insert(true)}
              size="small"
              type="primary"
            >
              Replace selection
            </Button>
          </ButtonGroup>
        </>
      ) : null}
      {customPrompts.length ? (
        <Prompts>
          {customPrompts.map(custom => (
            <Button
              key={custom}
              onClick={(): void => {
                submit(custom)
              }}
              size="small"
            >
              {custom}
            </Button>
          ))}
        </Prompts>
      ) : null}
      <Input
        aria-label="Prompt"
        disabled={!freeTextPrompts || loading}
        onChange={(event): void => setPrompt(event.target.value)}
        onPressEnter={(): void => {
          submit(prompt)
        }}
        placeholder={
          freeTextPrompts
            ? 'How can I help you? Type your prompt here.'
            : 'Free text prompts are turned off'
        }
        suffix={
          <Button
            aria-label="Send"
            disabled={prompt.trim().length < 2}
            icon={<SendOutlined />}
            loading={loading}
            onClick={(): void => {
              submit(prompt)
            }}
            size="small"
            type="text"
          />
        }
        value={prompt}
      />
      {knowledgeBase ? (
        <Switch
          checked={askKb}
          label="Ask knowledge base"
          onChange={setAskKb}
        />
      ) : null}
    </Panel>
  )
}

const AskAiButton = (props: AskAiProps): ReactNode => {
  const view = useWax(s => s.view)
  const hasSelection: boolean = useWax(
    ({ state }) => !!state && !state.selection.empty,
  )
  const [open, setOpen] = useState(false)

  const toggle = (): void => {
    if (!view) return
    const next = !open
    const { from, to } = view.state.selection
    setAiSelection(next ? { from, to } : null)(view.state, view.dispatch)
    setOpen(next)
  }

  const close = (): void => {
    if (view) setAiSelection(null)(view.state, view.dispatch)
    setOpen(false)
    view?.focus()
  }

  return (
    <>
      <Button
        aria-label="AI assistant"
        aria-pressed={open}
        disabled={!hasSelection && !open}
        icon={<RobotOutlined />}
        onClick={toggle}
        onMouseDown={(event): void => event.preventDefault()}
        size="small"
        title="AI assistant"
        type={open ? 'primary' : 'text'}
      />
      {open ? (
        <SelectionOverlay label="AI assistant">
          <AskAiPanel {...props} onClose={close} />
        </SelectionOverlay>
      ) : null}
    </>
  )
}

export default AskAiButton
