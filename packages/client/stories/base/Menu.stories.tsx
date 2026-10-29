import styled from 'styled-components'

import preview from '../../.storybook/preview'
import Menu from '../../app/ui/base/Menu'
import avatarImg from '../assets/avatar_sample.png'

const Wrapper = styled.div`
  height: 1000px;
`

const meta = preview.meta({
  component: Menu,
  parameters: {
    router: { initialEntries: ['/kotahi/dashboard'], path: '/:groupName/*' },
  },
})

export const Base = meta.story({
  render: () => {
    return (
      <Wrapper>
        <Menu
          groupDisplayName="Kotahi"
          groupType="Journal"
          initialMenuCollapsed={false}
          isUserAdmin={true}
          isUserGroupAdmin={true}
          isUserGroupManager={false}
          onMenuCollapseChange={() => {}}
          showCoar={true}
          showDashboard={true}
          showNewSubmissionButton={true}
          showReports={true}
          userDisplayName="Jane Green"
          userProfileImage={avatarImg}
        />
      </Wrapper>
    )
  },
})

export const Admin = meta.story({
  render: () => {
    return (
      <Wrapper>
        <Menu
          groupDisplayName="Kotahi"
          groupType="Journal"
          initialMenuCollapsed={false}
          isUserAdmin={true}
          isUserGroupAdmin={false}
          isUserGroupManager={false}
          onMenuCollapseChange={() => {}}
          showCoar={true}
          showDashboard={true}
          showNewSubmissionButton={true}
          showReports={true}
          userDisplayName="Jane Green"
          userProfileImage={avatarImg}
        />
      </Wrapper>
    )
  },
})

export const GroupAdmin = meta.story({
  render: () => {
    return (
      <Wrapper>
        <Menu
          groupDisplayName="Kotahi"
          groupType="Journal"
          initialMenuCollapsed={false}
          isUserAdmin={false}
          isUserGroupAdmin={true}
          isUserGroupManager={false}
          onMenuCollapseChange={() => {}}
          showCoar={true}
          showDashboard={true}
          showNewSubmissionButton={true}
          showReports={true}
          userDisplayName="Jane Green"
          userProfileImage={avatarImg}
        />
      </Wrapper>
    )
  },
})

export const GroupManager = meta.story({
  render: () => {
    return (
      <Wrapper>
        <Menu
          groupDisplayName="Kotahi"
          groupType="Journal"
          initialMenuCollapsed={false}
          isUserAdmin={false}
          isUserGroupAdmin={false}
          isUserGroupManager={true}
          onMenuCollapseChange={() => {}}
          showCoar={true}
          showDashboard={true}
          showNewSubmissionButton={true}
          showReports={true}
          userDisplayName="Jane Green"
          userProfileImage={avatarImg}
        />
      </Wrapper>
    )
  },
})

export const NoRoles = meta.story({
  render: () => {
    return (
      <Wrapper>
        <Menu
          groupDisplayName="Kotahi"
          groupType="Journal"
          initialMenuCollapsed={false}
          isUserAdmin={false}
          isUserGroupAdmin={false}
          isUserGroupManager={false}
          onMenuCollapseChange={() => {}}
          showCoar={true}
          showDashboard={true}
          showNewSubmissionButton={true}
          showReports={true}
          userDisplayName="Jane Green"
          userProfileImage={avatarImg}
        />
      </Wrapper>
    )
  },
})

export const ManyRoles = meta.story({
  render: () => {
    return (
      <Wrapper>
        <Menu
          groupDisplayName="Kotahi"
          groupType="Journal"
          initialMenuCollapsed={false}
          isUserAdmin={true}
          isUserGroupAdmin={true}
          isUserGroupManager={true}
          onMenuCollapseChange={() => {}}
          showCoar={true}
          showDashboard={true}
          showNewSubmissionButton={true}
          showReports={true}
          userDisplayName="Jane Green"
          userProfileImage={avatarImg}
        />
      </Wrapper>
    )
  },
})

export const WithoutNewSubmissionButton = meta.story({
  render: () => {
    return (
      <Wrapper>
        <Menu
          groupDisplayName="Kotahi"
          groupType="Journal"
          initialMenuCollapsed={false}
          isUserAdmin={false}
          isUserGroupAdmin={false}
          isUserGroupManager={false}
          onMenuCollapseChange={() => {}}
          showCoar={true}
          showDashboard={true}
          showNewSubmissionButton={false}
          showReports={true}
          userDisplayName="Jane Green"
          userProfileImage={avatarImg}
        />
      </Wrapper>
    )
  },
})

export const StartCollapsed = meta.story({
  render: () => {
    return (
      <Wrapper>
        <Menu
          groupDisplayName="Kotahi"
          groupType="Journal"
          initialMenuCollapsed={true}
          isUserAdmin={true}
          isUserGroupAdmin={true}
          isUserGroupManager={false}
          onMenuCollapseChange={() => {}}
          showCoar={true}
          showDashboard={true}
          showNewSubmissionButton={true}
          showReports={true}
          userDisplayName="Jane Green"
          userProfileImage={avatarImg}
        />
      </Wrapper>
    )
  },
})

export const MediumNames = meta.story({
  render: () => {
    return (
      <Wrapper>
        <Menu
          groupDisplayName="Natual Language Processing Lab"
          groupType="Journal"
          initialMenuCollapsed={false}
          isUserAdmin={false}
          isUserGroupAdmin={false}
          isUserGroupManager={false}
          onMenuCollapseChange={() => {}}
          showCoar={true}
          showDashboard={true}
          showNewSubmissionButton={true}
          showReports={true}
          userDisplayName="Jane Margaret Wilkinson"
          userProfileImage={avatarImg}
        />
      </Wrapper>
    )
  },
})

export const LongNames = meta.story({
  render: () => {
    return (
      <Wrapper>
        <Menu
          groupDisplayName="Kotahi is a very great journal that people like"
          groupType="Journal"
          initialMenuCollapsed={false}
          isUserAdmin={true}
          isUserGroupAdmin={true}
          isUserGroupManager={true}
          onMenuCollapseChange={() => {}}
          showCoar={true}
          showDashboard={true}
          showNewSubmissionButton={true}
          showReports={true}
          userDisplayName="Jane Margaret Samantha Green Wilkinson Henderson"
          userProfileImage={avatarImg}
        />
      </Wrapper>
    )
  },
})
