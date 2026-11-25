import { useMemo, type ReactNode } from 'react'

import { WaxProvider } from '../editor'
import { simpleFeatures } from './featureSets'
import BlurArea from './shared/BlurArea'
import SimpleLayout from './shared/SimpleLayout'
import useYjsFeatures, { yjsKey, type YjsProps } from './shared/yjs'

export type FormWaxEditorProps = YjsProps & {
  value?: string
  validationStatus?: string
  readonly?: boolean
  onChange?: (html: string) => void
  onBlur?: (html: string) => void
  placeholder?: string
  spellCheck?: boolean
  'data-testid'?: string
}

const FormWaxEditor = ({
  value = '',
  validationStatus,
  readonly = false,
  onChange,
  onBlur,
  placeholder = '',
  spellCheck = false,
  'data-testid': testId,
  wsProvider,
  ydoc,
  name,
}: FormWaxEditorProps): ReactNode => {
  const yjsFeatures = useYjsFeatures({ wsProvider, ydoc, name })

  const features = useMemo(
    () => [...simpleFeatures(), ...yjsFeatures],
    [yjsFeatures],
  )

  return (
    <div className={validationStatus}>
      <WaxProvider
        features={features}
        key={yjsKey({ wsProvider, ydoc, name })}
        onChange={ydoc ? undefined : onChange}
        placeholder={placeholder}
        readonly={readonly}
        value={ydoc ? '' : value}
      >
        <BlurArea onBlur={onBlur}>
          <SimpleLayout
            readonly={readonly}
            spellCheck={spellCheck}
            testId={testId}
          />
        </BlurArea>
      </WaxProvider>
    </div>
  )
}

export default FormWaxEditor
