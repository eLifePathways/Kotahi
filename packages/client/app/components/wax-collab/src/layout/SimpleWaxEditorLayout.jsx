/* eslint-disable  react/prop-types, react/display-name */

/* eslint-disable new-cap */

import {
  ComponentPlugin,
  WaxView,
} from '../../../../ui/wax/wax-prosemirror-core'
import {
  SimpleGrid,
  SimpleEditorDiv,
  ReadOnlySimpleEditorDiv,
  SimpleInfoContainer,
  SimpleMenu,
} from './EditorStyles'
import HandlebarsAutocomplete from '../../../component-email-templates/src/handlebarsAutocomplete/components/HandleBarsAutocomplete'

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
