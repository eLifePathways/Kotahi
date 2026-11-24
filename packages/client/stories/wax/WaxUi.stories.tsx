import type { ReactNode } from 'react'
import styled from 'styled-components'
import { grid, th } from '@coko/client'

import preview from '../../.storybook/preview'
import { WaxProvider, WaxSurface } from '../../app/ui/wax/editor'
import base from '../../app/ui/wax/features/base'
import characters from '../../app/ui/wax/layouts/shared/characters'
import blockQuote from '../../app/ui/wax/features/blockQuote'
import code from '../../app/ui/wax/features/code'
import emphasis from '../../app/ui/wax/features/emphasis'
import findAndReplace from '../../app/ui/wax/features/findAndReplace'
import headings from '../../app/ui/wax/features/headings'
import history from '../../app/ui/wax/features/history'
import images from '../../app/ui/wax/features/images'
import link from '../../app/ui/wax/features/link'
import lists from '../../app/ui/wax/features/lists'
import smallCaps from '../../app/ui/wax/features/smallCaps'
import strikethrough from '../../app/ui/wax/features/strikethrough'
import strong from '../../app/ui/wax/features/strong'
import subscript from '../../app/ui/wax/features/subscript'
import superscript from '../../app/ui/wax/features/superscript'
import tables from '../../app/ui/wax/features/tables'
import title from '../../app/ui/wax/features/title'
import underline from '../../app/ui/wax/features/underline'
import comments from '../../app/ui/wax/features/comments'
import notes from '../../app/ui/wax/features/notes'
import trackChanges from '../../app/ui/wax/features/trackChanges'
import askAi from '../../app/ui/wax/features/askAi'
import callout from '../../app/ui/wax/features/callout'
import citation from '../../app/ui/wax/features/citation'
import {
  AskAiButton,
  CalloutButton,
  CalloutView,
  CitationView,
  ReferenceButton,
  ReferenceServicesProvider,
  type Csl,
  AddCommentButton,
  CommentsPanel,
  ImageDetails,
  NoteButton,
  NotesPanel,
  TrackChangesPanel,
  BlockQuoteButton,
  BlockTypeSelect,
  BulletListButton,
  CodeButton,
  EmphasisButton,
  FindAndReplace,
  ImageUploadButton,
  InsertTableButton,
  LiftButton,
  LinkButton,
  OrderedListButton,
  RedoButton,
  SmallCapsButton,
  SpecialCharacters,
  StrikethroughButton,
  StrongButton,
  SubscriptButton,
  SuperscriptButton,
  TableActions,
  Toolbar,
  ToolbarDivider,
  UnderlineButton,
  UndoButton,
  WordCount,
  featureStyles,
} from '../../app/ui/wax/ui'

const features = [
  base,
  history,
  strong,
  emphasis,
  underline,
  strikethrough,
  code,
  subscript,
  superscript,
  smallCaps,
  title,
  headings,
  blockQuote,
  lists,
  link,
  tables,
  images(),
  findAndReplace,
]

const readAsDataUrl = (file: File): Promise<string> =>
  new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = (): void => resolve(reader.result as string)
    reader.readAsDataURL(file)
  })

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${grid(2)};
  max-width: 960px;
`

const Surface = styled(WaxSurface)`
  border: 1px solid ${th('colorBorder')};
  border-radius: ${th('borderRadius')};
  min-height: ${grid(40)};
  outline: none;
  padding: ${grid(2)};

  ${featureStyles}
`

type EditorProps = {
  value: string
}

const Editor = ({ value }: EditorProps): ReactNode => (
  <WaxProvider features={features} value={value}>
    <Wrapper>
      <Toolbar>
        <UndoButton />
        <RedoButton />
        <ToolbarDivider />
        <BlockTypeSelect />
        <ToolbarDivider />
        <StrongButton />
        <EmphasisButton />
        <UnderlineButton />
        <StrikethroughButton />
        <CodeButton />
        <SubscriptButton />
        <SuperscriptButton />
        <SmallCapsButton />
        <ToolbarDivider />
        <BulletListButton />
        <OrderedListButton />
        <LiftButton />
        <BlockQuoteButton />
        <ToolbarDivider />
        <LinkButton />
        <ImageUploadButton upload={readAsDataUrl} />
        <InsertTableButton />
        <TableActions />
        <SpecialCharacters characters={characters} />
        <FindAndReplace />
      </Toolbar>
      <Surface />
      <WordCount />
    </Wrapper>
  </WaxProvider>
)

const meta = preview.meta({
  component: Editor,
})

/**
 * An editor composed entirely from features and the new UI components. Every
 * toolbar item is a plain component placed in JSX.
 */
export const Base = meta.story({
  args: {
    value:
      '<p>Select some text and try the toolbar. Find and replace, tables, links and images all work here.</p>',
  },
})

const panelFeatures = [
  base,
  history,
  strong,
  emphasis,
  title,
  headings,
  trackChanges,
  notes,
  images(),
  comments({ showTitle: true }),
]

const user = { userId: 'storybook', displayName: 'Storybook user' }

const permissions = {
  own: { accept: true, reject: true },
  others: { accept: true, reject: true },
}

const Columns = styled.div`
  display: grid;
  gap: ${grid(2)};
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
`

const Side = styled.aside`
  display: flex;
  flex-direction: column;
  gap: ${grid(3)};
`

const PanelsEditor = ({ value }: EditorProps): ReactNode => (
  <WaxProvider features={panelFeatures} value={value}>
    <Wrapper>
      <Toolbar>
        <UndoButton />
        <RedoButton />
        <ToolbarDivider />
        <StrongButton />
        <EmphasisButton />
        <ToolbarDivider />
        <AddCommentButton />
        <NoteButton />
      </Toolbar>
      <Columns>
        <Surface />
        <Side>
          <CommentsPanel showTitle user={user} />
          <TrackChangesPanel
            permissions={permissions}
            user={{ username: user.displayName }}
          />
          <NotesPanel />
          <ImageDetails />
        </Side>
      </Columns>
    </Wrapper>
  </WaxProvider>
)

/**
 * The comments, changes, notes and image panels are plain components placed
 * next to the surface. Select text and add a comment, insert a note, or select
 * the image to edit its alternative text.
 */
export const Panels = meta.story({
  args: {
    value:
      '<p>Select some text to comment on it. This sentence has a <span class="insertion" data-id="change-1" data-username="Reviewer" data-date="1700000000000">suggested </span>change.</p><figure><img src="https://picsum.photos/320/160" alt="A placeholder image"></figure>',
  },
  render: ({ value }) => <PanelsEditor value={value} />,
  parameters: { docs: { source: { type: 'code' } } },
})

const referenceFeatures = [base, history, strong, citation(), callout(), askAi]

const nodeViews = { reference: CitationView, callout: CalloutView }

const wait = (ms: number): Promise<void> =>
  new Promise(resolve => {
    setTimeout(resolve, ms)
  })

const sampleCsl: Csl = {
  title: 'Open publishing workflows',
  'container-title': 'Journal of Examples',
  author: [{ given: 'Ada', family: 'Lovelace' }],
  issued: { raw: '2021' },
  formattedCitation:
    '<p>Lovelace, A. (2021). Open publishing workflows. <i>Journal of Examples</i>.</p>',
}

const referenceServices = {
  anyStyle: async (): Promise<string> => {
    await wait(500)
    return JSON.stringify([
      {
        ...sampleCsl,
        formattedCitation:
          '<p>Lovelace A. Open publishing workflows. 2021.</p>',
      },
    ])
  },
  crossRef: async (): Promise<Csl[]> => {
    await wait(800)
    return [sampleCsl]
  },
  citeProc: async (csl: Csl): Promise<{ formattedCitation: string }> => ({
    formattedCitation: `<p>${csl.author?.map(a => a.family).join(', ')} (${
      typeof csl.issued === 'object' ? csl.issued?.raw : csl.issued
    }). ${csl.title}.</p>`,
  }),
  updateCallout: async (
    references: { items: Record<string, unknown>[] },
    callouts: { citationID: string; citationItems: unknown[] }[],
  ): Promise<{
    calloutTexts: { id: string; text: string }[]
    orderedReferenceIds: string[]
  }> => ({
    calloutTexts: callouts.map((c, i) => ({
      id: c.citationID,
      text: `[${i + 1}]`,
    })),
    orderedReferenceIds: references.items.map(r => r.id as string),
  }),
}

const askAiTransform = async (input: { text: string[] }): Promise<string> => {
  await wait(600)
  return JSON.stringify({ content: `<p>You asked: ${input.text[0]}</p>` })
}

const ReferencesEditor = ({ value }: EditorProps): ReactNode => (
  <ReferenceServicesProvider value={referenceServices}>
    <WaxProvider
      features={referenceFeatures}
      nodeViews={nodeViews}
      value={value}
    >
      <Wrapper>
        <Toolbar>
          <ReferenceButton />
          <CalloutButton />
          <ToolbarDivider />
          <AskAiButton
            customPrompts={['Summarise this', 'Make it shorter']}
            knowledgeBase
            transform={askAiTransform}
          />
        </Toolbar>
        <Surface />
      </Wrapper>
    </WaxProvider>
  </ReferenceServicesProvider>
)

/**
 * References and callouts render as React node views inside the document. The
 * lookup services here are mocks. Select text and open the AI assistant to try
 * it with a mock response.
 */
export const References = meta.story({
  args: {
    value:
      '<p class="paragraph">Place the cursor here and insert a callout.</p><p class="ref">Lovelace A 2021 Open publishing workflows</p>',
  },
  render: ({ value }) => <ReferencesEditor value={value} />,
  parameters: { docs: { source: { type: 'code' } } },
})
