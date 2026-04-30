/* eslint-disable react/prop-types */

import styled from 'styled-components'
import { Filter, Search } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { useBool } from '../../../hooks/dataTypeHooks'
import { FlexRow } from '../../component-cms-manager/src/style'
import {
  CleanButton,
  CollapseIcon,
} from '../../component-email-templates/misc/styleds'
import { Row } from '../misc/styleds'
import { T } from '../misc/constants'

const ControlHeader = styled(FlexRow)`
  align-items: flex-end;
  background: #fff;
  border-bottom: 1px solid #ccc;
  border-left: 1px solid #ddd;
  flex-direction: column;
  gap: 0;
  padding: 0;

  button {
    color: #555;
  }

  > div {
    align-items: center;
  }

  svg {
    aspect-ratio: 1 / 1;
    stroke: #555;
    width: 18px;
  }

  input {
    background: none;
    border-left: 1px solid #ddd;
    color: #555;
    display: flex;
    padding: 0 8px;
    width: 100%;

    &::placeholder {
      color: #555;
    }
  }
`

const PaddedRow = styled(Row)`
  padding: 7px 12px;
`

const FullWidthRow = styled(Row)`
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  gap: 8px;
  padding: 8px;
  width: 100%;
`

const FilterRow = styled(FullWidthRow)`
  align-items: center;
  padding: 6px 8px;
  width: fit-content;
`

const FooterRow = styled(Row)`
  border-bottom: 1px solid #ddd;
  justify-content: space-between;
  padding: 0 16px;
`

const Dropdown = styled.div`
  display: inline-block;
  position: relative;
`

const DropdownButton = styled.button`
  background: none;
  border-left: 1px solid #ddd;
  color: #555;
  cursor: pointer;
  padding: 4px 8px;
  white-space: nowrap;
  width: fit-content;
`

const DropdownContent = styled.div`
  background-color: #fff;
  border: 1px solid #ddd;
  border-width: ${p => (p.show ? '1px' : '0')};
  box-shadow: 0 8px 16px 0 #0003;
  max-height: ${props => (props.show ? '200px' : '0')};
  min-width: 140px;
  overflow-y: auto;
  position: absolute;
  right: -9px;
  top: calc(100% + 4px);
  transition: all 0.3s ease-in-out;
  white-space: nowrap;
  z-index: 10;
`

const DropdownItem = styled.div`
  border-bottom: 1px solid #ddd;
  color: #555;
  cursor: pointer;
  padding: 8px 16px;

  &:hover {
    background-color: #ddd;
  }
`

const EventListControls = ({ search, filterKey, collapseAll }) => {
  const { t } = useTranslation()
  const dropdown = useBool()

  const handleDropdownSelect = value => {
    filterKey.set(value)
    dropdown.off()
  }

  return (
    <ControlHeader>
      <FooterRow>
        <b>{t(T.events)}</b>
        <CleanButton onClick={collapseAll.toggle}>
          {collapseAll.state ? 'Expand' : 'Collapse'} all
          <CollapseIcon $collapsed={collapseAll.state} />
        </CleanButton>
      </FooterRow>
      <PaddedRow>
        <FullWidthRow>
          <Search />
          <input
            onChange={e => search.set(e.target.value)}
            placeholder="Search..."
            type="text"
            value={search.state}
          />
        </FullWidthRow>
        <FilterRow>
          <Filter />
          <Dropdown>
            <DropdownButton onClick={dropdown.toggle}>
              {t(T[filterKey.state])}
            </DropdownButton>
            <DropdownContent show={dropdown.state}>
              {filterKey.values.map(value => (
                <DropdownItem
                  key={value}
                  onClick={() => handleDropdownSelect(value)}
                >
                  {t(T[value])}
                </DropdownItem>
              ))}
            </DropdownContent>
          </Dropdown>
        </FilterRow>
      </PaddedRow>
    </ControlHeader>
  )
}

export default EventListControls
