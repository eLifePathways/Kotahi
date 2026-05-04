/* eslint-disable react/prop-types */

import { Button } from '../../../pubsweet'
import SearchControl from '../../../component-manuscripts/src/SearchControl'

import { Heading, HeadingWithAction } from '../../../shared'

import { ControlsContainer, FlexRow } from '../style'

import {
  URI_PAGENUM_PARAM,
  URI_SEARCH_PARAM,
  useQueryParams,
} from '../../../../shared/urlParamUtils'

const PageHeader = ({
  history,
  leftSideOnly,
  onNewItemButtonClick,
  mainHeading,
  newItemButtonText,
  hideSearch,
}) => {
  const applyQueryParams = useQueryParams()
  const uriQueryParams = new URLSearchParams(history?.location?.search)
  const currentSearchQuery = uriQueryParams.get(URI_SEARCH_PARAM)

  const renderLeftSide = () => {
    return <Heading>{mainHeading}</Heading>
  }

  const renderRightSide = () => {
    return (
      <ControlsContainer>
        {!hideSearch && (
          <SearchControl
            applySearchQuery={newQuery =>
              applyQueryParams({
                [URI_SEARCH_PARAM]: newQuery,
                [URI_PAGENUM_PARAM]: 1,
              })
            }
            currentSearchQuery={currentSearchQuery}
          />
        )}
        <Button onClick={onNewItemButtonClick} primary>
          {newItemButtonText}
        </Button>
      </ControlsContainer>
    )
  }

  return (
    <HeadingWithAction>
      <FlexRow>
        {renderLeftSide()}
        {!leftSideOnly && renderRightSide()}
      </FlexRow>
    </HeadingWithAction>
  )
}

export default PageHeader
