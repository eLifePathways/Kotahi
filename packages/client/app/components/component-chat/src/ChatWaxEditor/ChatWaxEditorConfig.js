import { emDash, ellipsis } from 'prosemirror-inputrules'
import { DefaultSchema } from 'wax-prosemirror-core'
import {
  BottomInfoService,
  InlineAnnotationsService,
  LinkService,
  // ListsService,
  MathService,
  NoteService,
  SpecialCharactersService,
  TextBlockLevelService,
  DisplayBlockLevelService,
  EnterService,
} from 'wax-prosemirror-services'
import ListsService from '../../../wax-collab/src/CustomWaxToolGroups/ListsService/ListsService'
import { KotahiBlockDropDownToolGroupService } from '../../../wax-collab/src/CustomWaxToolGroups'
import CharactersList from '../../../wax-collab/src/config/CharactersList'
import MentionService from '../../../wax-collab/src/config/MentionService'

/* eslint-disable-next-line no-unused-vars */
const updateTitle = title => {
  // this gets fired when the title is changed in original version of this—not called now, but might still be needed
  // console.log(`Title changed: ${title}`)
}

const chatWaxEditorConfig = ({ onEnterPress, autoCompleteReducer }) => {
  return {
    SchemaService: DefaultSchema,
    MenuService: [
      {
        templateArea: 'topBar',
        toolGroups: [
          'KotahiBlockDropDown',
          {
            name: 'Annotations',
            exclude: ['StrikeThrough', 'Code'],
          },
          'SpecialCharacters',
          'Lists',
        ],
      },
    ],

    RulesService: [emDash, ellipsis],

    ShortCutsService: {},

    SpecialCharactersService: CharactersList,

    TitleService: { updateTitle },
    MentionService: { autoCompleteReducer },

    EnterService: {
      getContentOnEnter: source => {
        onEnterPress(source)
      },
    },

    services: [
      new MentionService(),
      new EnterService(),
      new BottomInfoService(),
      new InlineAnnotationsService(),
      new LinkService(),
      new ListsService(),
      new MathService(),
      new NoteService(),
      new SpecialCharactersService(),
      new TextBlockLevelService(),
      new DisplayBlockLevelService(),
      new KotahiBlockDropDownToolGroupService(),
    ],
  }
}

export default chatWaxEditorConfig
