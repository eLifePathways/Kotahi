import styled from 'styled-components'
import { grid, th } from '@coko/client'

import preview from '../../.storybook/preview'
import Surface from '../../app/ui/shared/Surface'

const Wallpaper = styled.div`
  background: ${th('colorWallpaper')};
  padding: ${grid(8)};

  ${Surface} {
    padding: ${grid(6)};
  }
`

const meta = preview.meta({
  component: Surface,
})

/** A plain panel with no padding of its own. Wrap it with `styled(Surface)` to add spacing. */
export const Base = meta.story({
  render: () => (
    <Wallpaper>
      <Surface>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas a
        consectetur felis.
      </Surface>
    </Wallpaper>
  ),
})
