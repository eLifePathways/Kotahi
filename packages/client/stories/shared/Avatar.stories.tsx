import preview from '../../.storybook/preview'
import Avatar from '../../app/ui/shared/Avatar'
import avatarImg from '../assets/avatar_sample.png'
import avatarImg2 from '../assets/avatar_sample_2.png'

const meta = preview.meta({
  component: Avatar,
})

export const Base = meta.story({
  args: {
    src: avatarImg,
    showOnlineIndicator: true,
    isUserOnline: true,
  },
})

export const DifferentSize = meta.story({
  args: {
    src: avatarImg,
    size: 20,
    showOnlineIndicator: true,
    isUserOnline: true,
  },
})

export const DifferentImage = meta.story({
  args: {
    src: avatarImg2,
    size: 20,
    showOnlineIndicator: true,
    isUserOnline: true,
  },
})

export const Offline = meta.story({
  args: {
    src: avatarImg,
    showOnlineIndicator: true,
    isUserOnline: false,
  },
})

export const FallbackImage = meta.story({
  args: {
    showOnlineIndicator: true,
    isUserOnline: true,
  },
})

export const HideOnlineIndicator = meta.story({
  args: {
    src: avatarImg,
    showOnlineIndicator: false,
  },
})
