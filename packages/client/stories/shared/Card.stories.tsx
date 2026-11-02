import { type ComponentProps, type ReactElement } from 'react'
import styled from 'styled-components'
import { grid, th } from '@coko/client'

import preview from '../../.storybook/preview'
import Badge from '../../app/ui/shared/Badge'
import Card from '../../app/ui/shared/Card'

type CardProps = ComponentProps<typeof Card>

const Wrapper = styled.div`
  max-width: 480px;
`

const Count = styled.div`
  font-size: ${th('fontSizeHeading2')};
  font-weight: bold;
`

const StoryCard = styled(Card)`
  min-height: ${grid(40)};
`

const description =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas a consectetur felis. Vestibulum hendrerit eleifend nulla.'

const meta = preview.meta({
  component: Card,
  decorators: [
    (Story): ReactElement => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
  render: (args: CardProps) => <StoryCard {...args} />,
})

/** Navigates to `url` when clicked. Hover or tab to it to see the highlight and the arrow. */
export const Link = meta.story({
  args: {
    type: 'link',
    url: '/admin/pages',
    title: 'Pages',
    children: description,
  } satisfies CardProps,
})

/** Runs `onClick` when clicked. Has no corner icon. */
export const Button = meta.story({
  args: {
    type: 'button',
    onClick: (): void => {},
    title: 'Start without a file',
    children: description,
  } satisfies CardProps,
})

/** Opens the file picker when clicked, and accepts a single file dropped onto it. */
export const Upload = meta.story({
  args: {
    type: 'upload',
    accept: '.docx,.pdf',
    onDrop: (): void => {},
    title: 'Upload a manuscript',
    children: description,
  } satisfies CardProps,
})

export const DisabledButton = meta.story({
  args: {
    type: 'button',
    onClick: (): void => {},
    disabled: true,
    title: 'Start without a file',
    children: description,
  } satisfies CardProps,
})

export const DisabledUpload = meta.story({
  args: {
    type: 'upload',
    onDrop: (): void => {},
    disabled: true,
    title: 'Upload a manuscript',
    children: description,
  } satisfies CardProps,
})

/** Not clickable or focusable, and not highlighted on hover, but not dimmed either, so its status stays readable. */
export const BusyButton = meta.story({
  args: {
    type: 'button',
    onClick: (): void => {},
    busy: true,
    title: 'Start without a file',
    children: 'Creating your submission.',
  } satisfies CardProps,
})

export const BusyUpload = meta.story({
  args: {
    type: 'upload',
    onDrop: (): void => {},
    busy: true,
    title: 'Upload a manuscript',
    children: 'Uploading your manuscript.',
  } satisfies CardProps,
})

/** Content longer than the minimum height grows the card. */
export const LongContent = meta.story({
  args: {
    type: 'link',
    url: '/admin/pages',
    title: 'A very long card title that wraps onto more than one line',
    children: `${description} ${description} ${description}`,
  } satisfies CardProps,
})

/** Without a title, the children fill the card from the top and can be laid out freely. */
export const WithoutTitle = meta.story({
  args: {
    type: 'link',
    url: '/dashboard/submissions',
    children: (
      <>
        <Badge small variant="primary">
          Author
        </Badge>
        <Count>14</Count>
        <strong>My Submissions</strong>
        <div>1 needs attention</div>
      </>
    ),
  } satisfies CardProps,
})
