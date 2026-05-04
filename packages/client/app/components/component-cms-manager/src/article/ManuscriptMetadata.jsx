/* eslint-disable react/prop-types */

import styled from 'styled-components'

import { Action, Icon, SectionContent } from '../../../shared'

import { Legend } from '../../../component-submit/src/style'
import {
  SectionRowGrid,
  Cell,
} from '../../../component-review/src/components/style'
import ReadonlyFormTemplate from '../../../component-review/src/components/metadata/ReadonlyFormTemplate'
import { color } from '../../../../theme'

const FormTemplateStyled = styled.div`
  max-height: calc(100vh - 150px);

  section {
    box-shadow: unset;
  }
`

const StyledSectionContent = styled(SectionContent)`
  margin-top: 0;
`

const LegendTitle = styled(Legend)`
  border-bottom: 1px solid;
  margin: 10px;
`

const copyReviewsTemplate = () => {
  navigator.clipboard.writeText(
    `{% if article.reviews.length > 0 %}
        {% include basePath + cmsConfig.group.name + "/layouts/_partials/reviews.njk" %}
      {% endif %}`,
  )
}

const copyDecisionTemplate = () => {
  navigator.clipboard.writeText(
    `{% if article.decisions.length > 0 %}
        {% include basePath + cmsConfig.group.name + "/layouts/_partials/decisions.njk" %}
      {% endif %}`,
  )
}

const copyCmsLayout = variable => () => {
  navigator.clipboard.writeText(`{{ cmsLayout.${variable} }}`)
}

const copyIncludeFile = filename => {
  navigator.clipboard.writeText(
    `{% include basePath + cmsConfig.group.name + "/layouts/_partials/${filename}.njk" %}`,
  )
}

const ManuscriptMetadata = ({
  displayShortIdAsIdentifier,
  formWithSubmissionFieldsOnly,
}) => {
  return (
    <FormTemplateStyled>
      <LegendTitle>Submission metadata</LegendTitle>
      <ReadonlyFormTemplate
        copyHandleBarsCode
        displayShortIdAsIdentifier={displayShortIdAsIdentifier}
        form={formWithSubmissionFieldsOnly}
        formData={{}}
        showEditorOnlyFields
      />
      <StyledSectionContent>
        <LegendTitle>Review / Decision metadata</LegendTitle>
        <SectionRowGrid>
          <Cell>Reviews</Cell>
          <Cell />
          <Cell>
            article.reviews
            <Action onClick={copyReviewsTemplate} primary>
              <Icon color={color.brand1.base()} inline>
                file-plus
              </Icon>
            </Action>
          </Cell>
        </SectionRowGrid>
        <SectionRowGrid>
          <Cell>Decsion</Cell>
          <Cell />
          <Cell>
            article.decision
            <Action onClick={copyDecisionTemplate} primary>
              <Icon color={color.brand1.base()} inline>
                file-plus
              </Icon>
            </Action>
          </Cell>
        </SectionRowGrid>
      </StyledSectionContent>

      <StyledSectionContent>
        <LegendTitle>Layout</LegendTitle>
        <SectionRowGrid>
          <Cell>Brand Logo</Cell>
          <Cell />
          <Cell>
            cmsLayout.logo
            <Action onClick={() => copyIncludeFile('logo')} primary>
              <Icon color={color.brand1.base()} inline>
                file-plus
              </Icon>
            </Action>
          </Cell>
        </SectionRowGrid>
        <SectionRowGrid>
          <Cell>Primary Color</Cell>
          <Cell />
          <Cell>
            cmsLayout.primaryColor
            <Action onClick={copyCmsLayout('primaryColor')} primary>
              <Icon color={color.brand1.base()} inline>
                file-plus
              </Icon>
            </Action>
          </Cell>
        </SectionRowGrid>
        <SectionRowGrid>
          <Cell>Secondary Color</Cell>
          <Cell />
          <Cell>
            cmsLayout.secondaryColor
            <Action onClick={copyCmsLayout('secondaryColor')} primary>
              <Icon color={color.brand1.base()} inline>
                file-plus
              </Icon>
            </Action>
          </Cell>
        </SectionRowGrid>
      </StyledSectionContent>
      <StyledSectionContent>
        <LegendTitle>Menu</LegendTitle>
        <SectionRowGrid>
          <Cell>Top Menu</Cell>
          <Cell />
          <Cell>
            top menu
            <Action onClick={() => copyIncludeFile('menu')} primary>
              <Icon color={color.brand1.base()} inline>
                file-plus
              </Icon>
            </Action>
          </Cell>
        </SectionRowGrid>
        <SectionRowGrid>
          <Cell>Footer Menu</Cell>
          <Cell />
          <Cell>
            Footer menu
            <Action onClick={() => copyIncludeFile('footer')} primary>
              <Icon color={color.brand1.base()} inline>
                file-plus
              </Icon>
            </Action>
          </Cell>
        </SectionRowGrid>
        <SectionRowGrid>
          <Cell>Partners</Cell>
          <Cell />
          <Cell>
            partners
            <Action onClick={() => copyIncludeFile('partners')} primary>
              <Icon color={color.brand1.base()} inline>
                file-plus
              </Icon>
            </Action>
          </Cell>
        </SectionRowGrid>
      </StyledSectionContent>
    </FormTemplateStyled>
  )
}

export default ManuscriptMetadata
