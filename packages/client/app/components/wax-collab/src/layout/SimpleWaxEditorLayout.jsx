/* eslint-disable  react/prop-types, react/display-name */

/* eslint-disable new-cap */

import { ComponentPlugin, WaxView } from 'wax-prosemirror-core'
import {
  SimpleGrid,
  SimpleEditorDiv,
  ReadOnlySimpleEditorDiv,
  SimpleInfoContainer,
  SimpleMenu,
} from './EditorStyles'
import HandlebarsAutocomplete from '../../../component-email-templates/src/handlebarsAutocomplete/components/HandleBarsAutocomplete'
import 'wax-prosemirror-core/dist/index.css'
import 'wax-prosemirror-services/dist/index.css'

const TopBar = ComponentPlugin('topBar')
const CounterInfo = ComponentPlugin('bottomRightInfo')

const SimpleWaxEditorLayout =
  (readonly, dataTestid = null) =>
  ({ useHandlebarsAutocomplete, ...props }) => (
    <>
      <SimpleGrid $readonly={readonly}>
        {readonly ? (
          <ReadOnlySimpleEditorDiv
            className="wax-surface-scroll"
            data-testid={dataTestid}
          >
            <WaxView {...props} />
          </ReadOnlySimpleEditorDiv>
        ) : (
          <>
            <SimpleMenu>
              <TopBar />
            </SimpleMenu>
            <SimpleEditorDiv
              className="wax-surface-scroll"
              data-testid={dataTestid}
            >
              <WaxView {...props} />
            </SimpleEditorDiv>
          </>
        )}
      </SimpleGrid>

      {useHandlebarsAutocomplete && <HandlebarsAutocomplete />}

      {!readonly && (
        <SimpleInfoContainer>
          <CounterInfo />
        </SimpleInfoContainer>
      )}
    </>
  )

export default SimpleWaxEditorLayout
