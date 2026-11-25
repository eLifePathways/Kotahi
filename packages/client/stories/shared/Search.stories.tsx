import { useState, type ReactNode } from 'react'

import preview from '../../.storybook/preview'
import Search from '../../app/ui/shared/Search'

const BaseDemo = (): ReactNode => {
  const [loading, setLoading] = useState(false)

  const handleSearch = (): void => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <Search
      loading={loading}
      onSearch={handleSearch}
      placeholder="Enter search terms..."
    />
  )
}

const meta = preview.meta({
  component: Search,
})

/** Searching shows the loading state for 2 seconds. */
export const Base = meta.story({
  render: () => <BaseDemo />,
})

export const Plain = meta.story({})

export const Loading = meta.story({
  args: {
    loading: true,
  },
})
