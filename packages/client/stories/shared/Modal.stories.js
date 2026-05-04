import { useState } from 'react'
import Modal, {
  CheckBoxButton,
  PrimaryButton,
  SecondaryButton,
  StackedHeader,
} from '../../app/components/component-modal/src/Modal'

export default {
  component: Modal,
  title: 'Modal',
}

const ModalComponent = ({ ...args }) => {
  const [open, setOpen] = useState(true)
  return (
    <>
      <PrimaryButton onClick={() => setOpen(true)}>Open Modal</PrimaryButton>
      <Modal isOpen={open} onClose={() => setOpen(false)} {...args} />
    </>
  )
}

const Template = args => <ModalComponent {...args} />

export const Default = Template.bind({})
Default.args = {
  title: 'Example Modal',
  subtitle: 'Example Subtitle',
  children: (
    <>
      <StackedHeader subtitle="subtitle" title="Example Title 1" />
      Qui ipsum amet minim deserunt et anim deserunt. Nulla eiusmod commodo
      incididunt est laborum voluptate eu amet mollit. Cillum pariatur eiusmod
      ipsum dolor non proident. Culpa et aliqua excepteur aliquip elit. Minim
      voluptate ut proident enim voluptate. Nisi reprehenderit aliquip ea nulla
      labore ad. Laborum velit non non ea occaecat incididunt id sit amet velit
      esse consequat ea minim.
    </>
  ),
}

export const WithRightActions = Template.bind({})
WithRightActions.args = {
  ...Default.args,
  rightActions: (
    <>
      <SecondaryButton>Secondary Action</SecondaryButton>
      <PrimaryButton>Primary Action</PrimaryButton>
    </>
  ),
}

export const WithLeftActions = Template.bind({})
WithLeftActions.args = {
  ...Default.args,
  leftActions: (
    <>
      <CheckBoxButton isClicked onClick={() => {}}>
        Click me
      </CheckBoxButton>
      <CheckBoxButton isClicked onClick={() => {}}>
        No, click me
      </CheckBoxButton>
    </>
  ),
}

export const WithScrolling = Template.bind({})
WithScrolling.args = {
  ...Default.args,
  rightActions: (
    <>
      <SecondaryButton>Secondary Action</SecondaryButton>
      <PrimaryButton>Primary Action</PrimaryButton>
    </>
  ),
  children: (
    <>
      <StackedHeader subtitle="subtitle" title="Example Title 1" />
      Qui ipsum amet minim deserunt et anim deserunt. Nulla eiusmod commodo
      incididunt est laborum voluptate eu amet mollit. Cillum pariatur eiusmod
      ipsum dolor non proident. Culpa et aliqua excepteur aliquip elit. Minim
      voluptate ut proident enim voluptate. Nisi reprehenderit aliquip ea nulla
      labore ad. Laborum velit non non ea occaecat incididunt id sit amet velit
      esse consequat ea minim.
      <StackedHeader subtitle="subtitle" title="Example Title 2" />
      Qui ipsum amet minim deserunt et anim deserunt. Nulla eiusmod commodo
      incididunt est laborum voluptate eu amet mollit. Cillum pariatur eiusmod
      ipsum dolor non proident. Culpa et aliqua excepteur aliquip elit. Minim
      voluptate ut proident enim voluptate. Nisi reprehenderit aliquip ea nulla
      labore ad. Laborum velit non non ea occaecat incididunt id sit amet velit
      esse consequat ea minim.
      <StackedHeader subtitle="subtitle" title="Example Title 3" />
      Qui ipsum amet minim deserunt et anim deserunt. Nulla eiusmod commodo
      incididunt est laborum voluptate eu amet mollit. Cillum pariatur eiusmod
      ipsum dolor non proident. Culpa et aliqua excepteur aliquip elit. Minim
      voluptate ut proident enim voluptate. Nisi reprehenderit aliquip ea nulla
      labore ad. Laborum velit non non ea occaecat incididunt id sit amet velit
      esse consequat ea minim.
      <StackedHeader subtitle="subtitle" title="Example Title 4" />
      Qui ipsum amet minim deserunt et anim deserunt. Nulla eiusmod commodo
      incididunt est laborum voluptate eu amet mollit. Cillum pariatur eiusmod
      ipsum dolor non proident. Culpa et aliqua excepteur aliquip elit. Minim
      voluptate ut proident enim voluptate. Nisi reprehenderit aliquip ea nulla
      labore ad. Laborum velit non non ea occaecat incididunt id sit amet velit
      esse consequat ea minim.
      <StackedHeader subtitle="subtitle" title="Example Title 4" />
      Qui ipsum amet minim deserunt et anim deserunt. Nulla eiusmod commodo
      incididunt est laborum voluptate eu amet mollit. Cillum pariatur eiusmod
      ipsum dolor non proident. Culpa et aliqua excepteur aliquip elit. Minim
      voluptate ut proident enim voluptate. Nisi reprehenderit aliquip ea nulla
      labore ad. Laborum velit non non ea occaecat incididunt id sit amet velit
      esse consequat ea minim.
      <StackedHeader subtitle="subtitle" title="Example Title 5" />
      Qui ipsum amet minim deserunt et anim deserunt. Nulla eiusmod commodo
      incididunt est laborum voluptate eu amet mollit. Cillum pariatur eiusmod
      ipsum dolor non proident. Culpa et aliqua excepteur aliquip elit. Minim
      voluptate ut proident enim voluptate. Nisi reprehenderit aliquip ea nulla
      labore ad. Laborum velit non non ea occaecat incididunt id sit amet velit
      esse consequat ea minim.
    </>
  ),
}
