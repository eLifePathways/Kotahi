import { emDash, ellipsis } from 'prosemirror-inputrules'
import {
  InlineAnnotationsService,
  ImageService,
  LinkService,
  // ListsService,
  BaseService,
  DisplayBlockLevelService,
  TextBlockLevelService,
  MathService,
  FindAndReplaceService,
  FullScreenService,
  SpecialCharactersService,
} from '../../../../../ui/wax/wax-prosemirror-services'
import {
  TablesService,
  tableEditing,
  columnResizing,
} from '../../../../../ui/wax/wax-table-service'
import ListsService from '../../../../wax-collab/src/CustomWaxToolGroups/ListsService/ListsService'
import { KotahiBlockDropDownToolGroupService } from '../../../../wax-collab/src/CustomWaxToolGroups'
import CharactersList from '../../../../wax-collab/src/config/CharactersList'
import KotahiSchema from '../../../../wax-collab/src/config/KotahiSchema'

const fullWaxEditorConfig = handleAssetManager => ({
  SchemaService: KotahiSchema,
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
        'Tables',
        'Images',
        // 'find',
        // 'TrackingAndEditing',
        'FullScreen',
      ],
    },
  ],

  PmPlugins: [columnResizing(), tableEditing()],

  RulesService: [emDash, ellipsis],

  SpecialCharactersService: CharactersList,

  ImageService: handleAssetManager ? { handleAssetManager } : {},

  // end insertion

  services: [
    new BaseService(),
    new FindAndReplaceService(),
    new ImageService(),
    new InlineAnnotationsService(),
    new LinkService(),
    new ListsService(),
    new MathService(),
    new SpecialCharactersService(),
    new TablesService(),
    new TextBlockLevelService(),
    new DisplayBlockLevelService(),
    new FullScreenService(),
    new KotahiBlockDropDownToolGroupService(),
  ],
})

export default fullWaxEditorConfig
