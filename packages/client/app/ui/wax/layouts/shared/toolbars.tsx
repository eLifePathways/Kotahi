import type { ReactNode } from 'react'

import characters from './characters'
import {
  AcceptChangesButton,
  AskAiButton,
  BlockQuoteButton,
  BlockTypeSelect,
  BulletListButton,
  CodeButton,
  EmphasisButton,
  FindAndReplace,
  FullScreenButton,
  ImageUploadButton,
  InsertTableButton,
  JoinUpButton,
  LiftButton,
  LinkButton,
  MoreTools,
  NoteButton,
  OrderedListButton,
  RedoButton,
  RejectChangesButton,
  ShowChangesButton,
  SmallCapsButton,
  SpecialCharacters,
  StrikethroughButton,
  StrongButton,
  SubscriptButton,
  SuperscriptButton,
  TableActions,
  Toolbar,
  TrackingMode,
  UnderlineButton,
  UndoButton,
} from '../../ui'
import type { AskAiOptions } from '../../ui/AskAi'
import type { AssetFile, UploadResult } from '../../features/images'
import type { TrackPermissions } from '../../features/trackChanges'

export type AiConfig = {
  AskAiContentTransformation?: (
    input: { text: string[] },
    options: AskAiOptions,
  ) => Promise<string>
  AiOn?: boolean
  FreeTextPromptsOn?: boolean
  CustomPromptsOn?: boolean
  CustomPrompts?: string[]
}

const ListTools = (): ReactNode => (
  <>
    <BlockQuoteButton />
    <OrderedListButton />
    <BulletListButton />
    <JoinUpButton />
    <LiftButton />
  </>
)

export const SimpleToolbar = (): ReactNode => (
  <Toolbar>
    <BlockTypeSelect />
    <EmphasisButton />
    <LinkButton />
    <StrongButton />
    <SubscriptButton />
    <SuperscriptButton />
    <UnderlineButton />
    <SmallCapsButton />
    <SpecialCharacters characters={characters} />
    <ListTools />
  </Toolbar>
)

type FullToolbarProps = {
  ai?: AiConfig
  notes?: boolean
  images?: {
    upload: (file: File) => Promise<UploadResult>
    pickFromAssets?: () => Promise<AssetFile | AssetFile[] | null | undefined>
  }
  findAndReplace?: boolean
  tracking?: {
    suggesting: boolean
    onChange: (suggesting: boolean) => void
    locked?: boolean
  }
  fullScreen: { value: boolean; onChange: (fullScreen: boolean) => void }
}

export const FullToolbar = ({
  ai,
  notes = true,
  images,
  findAndReplace = true,
  tracking,
  fullScreen,
}: FullToolbarProps): ReactNode => (
  <Toolbar>
    <UndoButton />
    <RedoButton />
    <BlockTypeSelect />
    <EmphasisButton />
    <LinkButton />
    <StrongButton />
    <MoreTools>
      <SuperscriptButton />
      <SubscriptButton />
      <SmallCapsButton />
      <UnderlineButton />
      <StrikethroughButton />
      <CodeButton />
    </MoreTools>
    <SpecialCharacters characters={characters} />
    <ListTools />
    {notes ? <NoteButton /> : null}
    <InsertTableButton />
    <TableActions />
    {images ? (
      <ImageUploadButton
        pickFromAssets={images.pickFromAssets}
        upload={images.upload}
      />
    ) : null}
    {ai?.AiOn && ai.AskAiContentTransformation ? (
      <AskAiButton
        customPrompts={ai.CustomPromptsOn ? ai.CustomPrompts : []}
        freeTextPrompts={!!ai.FreeTextPromptsOn}
        transform={ai.AskAiContentTransformation}
      />
    ) : null}
    {findAndReplace ? <FindAndReplace /> : null}
    {tracking ? (
      <TrackingMode
        disabled={tracking.locked}
        onChange={tracking.onChange}
        suggesting={tracking.suggesting}
      />
    ) : null}
    <FullScreenButton
      fullScreen={fullScreen.value}
      onChange={fullScreen.onChange}
    />
  </Toolbar>
)

type TrackCommentOptionsProps = {
  user: { username: string }
  permissions: TrackPermissions
}

export const TrackCommentOptions = ({
  user,
  permissions,
}: TrackCommentOptionsProps): ReactNode => (
  <>
    <ShowChangesButton />
    <AcceptChangesButton permissions={permissions} user={user} />
    <RejectChangesButton permissions={permissions} user={user} />
  </>
)

export const fullScreenStyle = (fullScreen: boolean): Record<string, string> =>
  fullScreen
    ? {
        backgroundColor: '#fff',
        height: '100%',
        left: '0',
        margin: '0',
        padding: '0',
        position: 'fixed',
        top: '0',
        width: '100%',
        zIndex: '99999',
      }
    : {}
