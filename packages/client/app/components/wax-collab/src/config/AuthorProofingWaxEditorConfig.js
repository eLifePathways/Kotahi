import { emDash, ellipsis } from 'prosemirror-inputrules'
import {
  InlineAnnotationsService,
  ImageService,
  LinkService,
  // ListsService, // Uncomment this when we're using updated Wax
  BaseService,
  DisplayBlockLevelService,
  TextBlockLevelService,
  NoteService,
  TrackChangeService,
  // CommentsService,
  MathService,
  FindAndReplaceService,
  FullScreenService,
  SpecialCharactersService,
  BottomInfoService,
  EditingSuggestingService,
  CommentsService,
} from 'wax-prosemirror-services'
import { TablesService, tableEditing, columnResizing } from 'wax-table-service'
// import TrackChangeService from '../CustomWaxToolGroups/TrackChangeService/TrackChangeService'
// import CommentsService from '../extensions/CommentsService/CommentsService'
import ListsService from '../CustomWaxToolGroups/ListsService/ListsService'
// import TrackChangeService from '../CustomWaxToolGroups/TrackChangeService/TrackChangeService'
import {
  KotahiBlockDropDownToolGroupService,
  JatsSideMenuToolGroupService,
  JatsAnnotationListTooolGroupService,
} from '../CustomWaxToolGroups'
import JatsTagsService from '../JatsTags'
import CharactersList from './CharactersList'
import KotahiSchema from './KotahiSchema'
// import AnyStyleService from '../CustomWaxToolGroups/AnystyleService/AnyStyleService'
import CitationService from '../CustomWaxToolGroups/CitationService/CitationService'
import CalloutService from '../CustomWaxToolGroups/CalloutService/CalloutService'
import 'wax-table-service/dist/index.css'

// const updateTitle = title => {
//   // this gets fired when the title is changed in original version of this—not called now, but might still be needed
//   // console.log(`Title changed: ${title}`)
// }

const updateTitle = () => {
  // this gets fired when the title is changed in original version of this—not called now, but might still be needed
  // console.log(`Title changed: ${title}`)
}

// WEIRD THINGS NOTICED:

// 1) List functionality doesn't actually work. Why? I've commented that out for now.
// 2) Tables, images, footnotes, comments work.
// 3) Changing block formats works (though there's no record of it)
// 4) Sidebar seems to work–-we could take that out.
//
// QUESTION: Can we make sure that resolving other people's comments is not possible? Test this.

const authorProofingWaxEditorConfig = (
  handleAssetManager,
  updateAnystyle,
  updateCrossRef,
  styleReference,
  getComments,
  setComments,
) => ({
  EnableTrackChangeService: {
    enabled: true,
    toggle: false,
    updateTrackStatus: () => true, // what does this do? Nothing because we're not toggling?
  },
  AcceptTrackChangeService: {
    // n.b. this is also connected to comment functionality!
    own: {
      accept: false, // true,
    },
    others: {
      accept: false,
    },
  },
  RejectTrackChangeService: {
    own: {
      reject: false, // true, // Turn this on if we want author to be able to accept/reject their own changes
    },
    others: {
      reject: false,
    },
  },
  SchemaService: KotahiSchema,
  // If we are in read-only mode, readOnly is set to true. This makes it so that the user cannot add more comments.
  // A little vexingly, however, the interface for adding (or replying to) comments is shown. Maybe this should be
  // changed in CommentsService in the future.
  CommentsService: {
    showTitle: true,
    readOnly: true, // this should make it work though this is not yet in Wax
    replyToReadOnlyComments: true,
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
        'FindAndReplaceTool',
        'TrackingAndEditing',
        'FullScreen',
      ],
    },
    // {
    //   templateArea: 'leftSideBar',
    //   toolGroups: ['JatsSideMenu'],
    // },
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
    AnyStyleTransformation: updateAnystyle,
    CrossRefTransformation: updateCrossRef,
    CiteProcTransformation: styleReference,
    readOnly: false,
  },
  CalloutService: {
    updateCallout: () => {},
    readOnly: true,
  },
  services: [
    new BaseService(),
    new ImageService(),
    new InlineAnnotationsService(),
    new ListsService(),
    new TextBlockLevelService(),
    new DisplayBlockLevelService(),
    new NoteService(),
    new CommentsService(),
    new LinkService(),
    new TrackChangeService(),
    new MathService(),
    new FindAndReplaceService(),
    new FullScreenService(),
    new SpecialCharactersService(),
    new BottomInfoService(),
    new EditingSuggestingService(),
    // new TrackOptionsService(),
    new TablesService(),
    new JatsTagsService(),
    new JatsSideMenuToolGroupService(),
    new JatsAnnotationListTooolGroupService(),
    new CitationService(),
    new CalloutService(),
    new KotahiBlockDropDownToolGroupService(),
  ],
})

export default authorProofingWaxEditorConfig
