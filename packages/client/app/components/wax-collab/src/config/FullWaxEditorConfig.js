import { emDash, ellipsis } from 'prosemirror-inputrules'
import {
  InlineAnnotationsService,
  ImageService,
  LinkService,
  // ListsService,
  BaseService,
  DisplayBlockLevelService,
  TextBlockLevelService,
  NoteService,
  TrackChangeService,
  // TrackOptionsService,
  // CommentsService,
  MathService,
  FindAndReplaceService,
  FullScreenService,
  SpecialCharactersService,
  BottomInfoService,
  EditingSuggestingService,
  CommentsService,
  AskAiContentService,
} from 'wax-prosemirror-services'
import { TablesService, tableEditing, columnResizing } from 'wax-table-service'
import ListsService from '../CustomWaxToolGroups/ListsService/ListsService'
import { KotahiBlockDropDownToolGroupService } from '../CustomWaxToolGroups'
import JatsTagsService from '../JatsTags'
import CharactersList from './CharactersList'
import KotahiSchema from './KotahiSchema'
import CitationService from '../CustomWaxToolGroups/CitationService/CitationService'
import CalloutService from '../CustomWaxToolGroups/CalloutService/CalloutService'
import 'wax-table-service/dist/index.css'

/* eslint-disable-next-line no-unused-vars */
const updateTrackStatus = change => {
  // this returns "true" when Suggesting Mode is turned on.
  // console.log(change)
}

/* eslint-disable-next-line no-unused-vars */
const updateTitle = title => {
  // this gets fired when the title is changed in original version of this—not called now, but might still be needed
  // console.log(`Title changed: ${title}`)
}

const fullWaxEditorConfig = (
  handleAssetManager,
  getComments,
  setComments,
  isReadOnly,
  aiConfig,
) => ({
  EnableTrackChangeService: { enabled: false, toggle: true, updateTrackStatus },
  AcceptTrackChangeService: {
    own: {
      accept: !isReadOnly,
    },
    others: {
      accept: !isReadOnly,
    },
  },
  RejectTrackChangeService: {
    own: {
      reject: !isReadOnly,
    },
    others: {
      reject: !isReadOnly,
    },
  },

  SchemaService: KotahiSchema,
  CommentsService: {
    showTitle: true,
    readOnly: false,
    getComments,
    setComments,
  },
  MenuService: [
    {
      templateArea: 'topBar',
      toolGroups: [
        {
          name: 'Base',
          exclude: ['Save'],
        },
        'KotahiBlockDropDown',
        {
          name: 'Annotations',
          more: [
            'Superscript',
            'Subscript',
            'SmallCaps',
            'Underline',
            'StrikeThrough',
            'Code',
          ],
        },
        'SpecialCharacters',
        'Lists',
        'Notes',
        'Tables',
        'Images',

        'ToggleAi',
        'FindAndReplaceTool',
        'TrackingAndEditing',
        'FullScreen',
      ],
    },
    {
      templateArea: 'commentTrackToolBar',
      toolGroups: ['TrackCommentOptions'],
    },
    {
      templateArea: 'bottomRightInfo',
      toolGroups: [{ name: 'InfoToolGroup', exclude: ['ShortCutsInfo'] }],
    },
  ],

  PmPlugins: [columnResizing(), tableEditing()],

  RulesService: [emDash, ellipsis],

  ShortCutsService: {},

  SpecialCharactersService: CharactersList,

  TitleService: { updateTitle },

  ImageService: handleAssetManager ? { handleAssetManager } : {},

  CitationService: {
    AnyStyleTransformation: () => {},
    CrossRefTransformation: () => {},
    CiteProcTransformation: () => {}, // We may need to pass this in if we're letting this editor change these.
    readOnly: true,
  },
  CalloutService: {
    updateCallout: () => {},
    readOnly: true,
  },

  AskAiContentService: {
    AskAiContentTransformation: aiConfig?.AskAiContentTransformation,
    AiOn: aiConfig?.AiOn,
    CustomPromptsOn: aiConfig?.CustomPromptsOn,
    FreeTextPromptsOn: aiConfig?.FreeTextPromptsOn,
    CustomPrompts: aiConfig?.CustomPrompts || [],
  },

  services: [
    new AskAiContentService(),
    new BaseService(),
    new BottomInfoService(),
    new FindAndReplaceService(),
    new ImageService(),
    new InlineAnnotationsService(),
    new LinkService(),
    new ListsService(),
    new MathService(),
    new NoteService(),
    new SpecialCharactersService(),
    new TablesService(),
    new TextBlockLevelService(),
    new EditingSuggestingService(),
    new DisplayBlockLevelService(),
    new FullScreenService(),
    new TrackChangeService(),
    // new TrackOptionsService(),
    new CommentsService(),
    new JatsTagsService(),
    new CitationService(),
    new CalloutService(),
    new KotahiBlockDropDownToolGroupService(),
  ],
})

export default fullWaxEditorConfig
