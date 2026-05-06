import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import Task from '../../app/components/component-task-manager/src/Task'
import DesignEmbed from '../common/utils'
import { ConfigProvider } from '../../app/components/config/src'
import config from '../../config/sampleConfigFormData'

export const Base = args => (
  <ConfigProvider config={config}>
    <>
      {args.figmaEmbedLink && (
        <>
          <h2 style={{ color: '#333333' }}>Design</h2>
          <iframe
            allowFullScreen
            height={350}
            src={args.figmaEmbedLink}
            style={{ border: '1px solid rgba(0, 0, 0, 0.1)' }}
            title="figma embed"
            width="100%"
          />
          <h2 style={{ color: '#333333' }}>Component</h2>
        </>
      )}

      <DragDropContext onDragEnd={() => {}}>
        <Droppable droppableId="droppable">
          {provided => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              <Task {...args} />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </>
  </ConfigProvider>
)

Base.args = {
  task: {
    id: 'f30d5ec0-941b-4862-94a4-5b2b79a786b6',
    title: 'This is the title',
    assignee: {
      username: 'Joe Bloggs',
      email: 'joe.bloggs@asdf.com',
      id: 'bc8d6a25-5bf0-4aa8-b74e-02b8f0f147d0',
    },
    dueDate: Date.now() + 3 * 24 * 60 * 60 * 1000,
    status: 'Not started',
  },
  index: 0,
  updateTask: () => null,
  onDelete: () => null,
  userOptions: [
    {
      label: 'Joe Bloggs',
      value: 'bc8d6a25-5bf0-4aa8-b74e-02b8f0f147d0',
      user: {
        username: 'Joe Bloggs',
        id: 'bc8d6a25-5bf0-4aa8-b74e-02b8f0f147d0',
        email: 'joe.bloggs@asdf.com',
      },
    },
    {
      label: 'Jane Doe',
      value: '9aad06b8-e956-485b-a223-b3883a303d58',
      user: {
        username: 'Jane Doe',
        id: '9aad06b8-e956-485b-a223-b3883a303d58',
        email: 'jane.doe@asdf.com',
      },
    },
  ],
}

export default {
  title: 'TaskManager/Task',
  component: Task,
  parameters: {
    docs: {
      page: () => (
        <DesignEmbed figmaEmbedLink="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D6173%253A10819" />
      ),
    },
  },
}
