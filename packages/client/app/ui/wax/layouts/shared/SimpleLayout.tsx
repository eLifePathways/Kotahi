import type { ReactNode } from 'react'

import { WaxSurface } from '../../editor'
import type { HandlebarsVariable } from '../../features/handlebars'
import { HandlebarsAutocomplete, WordCount } from '../../ui'
import type { HandlebarsListener } from '../../ui/HandlebarsAutocomplete'
import {
  ReadOnlySimpleEditorDiv,
  SimpleEditorDiv,
  SimpleGrid,
  SimpleInfoContainer,
  SimpleMenu,
} from '../styles/editorStyles'
import { SimpleToolbar } from './toolbars'

type SimpleLayoutProps = {
  readonly: boolean
  spellCheck: boolean
  testId?: string
  handlebars?: { listener: HandlebarsListener; variables: HandlebarsVariable[] }
}

const SimpleLayout = ({
  readonly,
  spellCheck,
  testId,
  handlebars,
}: SimpleLayoutProps): ReactNode => (
  <>
    <SimpleGrid $readonly={readonly}>
      {readonly ? (
        <ReadOnlySimpleEditorDiv
          className="wax-surface-scroll"
          data-testid={testId ?? 'read-only-simple-editor-div'}
        >
          <WaxSurface readonly={readonly} spellCheck={spellCheck} />
        </ReadOnlySimpleEditorDiv>
      ) : (
        <>
          <SimpleMenu>
            <SimpleToolbar />
          </SimpleMenu>
          <SimpleEditorDiv className="wax-surface-scroll" data-testid={testId}>
            <WaxSurface readonly={readonly} spellCheck={spellCheck} />
          </SimpleEditorDiv>
        </>
      )}
    </SimpleGrid>
    {handlebars ? (
      <HandlebarsAutocomplete
        listener={handlebars.listener}
        variables={handlebars.variables}
      />
    ) : null}
    {!readonly ? (
      <SimpleInfoContainer>
        <WordCount />
      </SimpleInfoContainer>
    ) : null}
  </>
)

export default SimpleLayout
