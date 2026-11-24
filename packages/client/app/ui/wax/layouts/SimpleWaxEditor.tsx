import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { debounce } from 'lodash'

import { WaxProvider } from '../editor'
import type { HandlebarsVariable } from '../features/handlebars'
import { createHandlebarsListener } from '../ui'
import { simpleFeatures } from './featureSets'
import BlurArea from './shared/BlurArea'
import SimpleLayout from './shared/SimpleLayout'
import useLatest from './shared/useLatest'
import useYjsFeatures, { type YjsProps } from './shared/yjs'

export type SimpleWaxEditorProps = YjsProps & {
  value?: string
  validationStatus?: string
  readonly?: boolean
  autoFocus?: boolean
  onBlur?: (html: string) => void
  onChange?: (html: string) => void
  placeholder?: string
  spellCheck?: boolean
  handlebarsVariables?: HandlebarsVariable[]
}

const SimpleWaxEditor = ({
  value = '',
  validationStatus,
  readonly = false,
  autoFocus = false,
  onBlur,
  onChange,
  placeholder = '',
  spellCheck = false,
  handlebarsVariables,
  wsProvider,
  ydoc,
  name,
}: SimpleWaxEditorProps): ReactNode => {
  const latestOnChange = useLatest(onChange)
  const yjsFeatures = useYjsFeatures({ wsProvider, ydoc, name })
  const [listener] = useState(createHandlebarsListener)
  const withHandlebars = !!handlebarsVariables

  const save = useMemo(
    () => debounce((html: string) => latestOnChange.current?.(html), 1000),
    [latestOnChange],
  )

  useEffect(() => (): void => save.flush(), [save])

  const features = useMemo(
    () => [
      ...simpleFeatures({
        handlebarsActions: withHandlebars ? listener.onAction : undefined,
      }),
      ...yjsFeatures,
    ],
    [withHandlebars, listener, yjsFeatures],
  )

  return (
    <div className={validationStatus}>
      <WaxProvider
        features={features}
        focusOnMount={autoFocus}
        onChange={save}
        placeholder={placeholder}
        readonly={readonly}
        value={ydoc ? '' : value}
      >
        <BlurArea
          onBlur={(html): void => {
            save.cancel()
            onChange?.(html)
            onBlur?.(html)
          }}
        >
          <SimpleLayout
            handlebars={
              handlebarsVariables
                ? { listener, variables: handlebarsVariables }
                : undefined
            }
            readonly={readonly}
            spellCheck={spellCheck}
          />
        </BlurArea>
      </WaxProvider>
    </div>
  )
}

export default SimpleWaxEditor
