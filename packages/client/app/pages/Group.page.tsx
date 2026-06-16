import { type ReactNode, useEffect, useMemo } from 'react'
import { useParams, Outlet } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'
import { ThemeProvider } from 'styled-components'

import { GET_GROUPS } from '../queries'
import { reloadTranslationsForGroup } from '../i18n'
import {
  setBrandColors,
  colorPrimaryDefault,
  colorSecondaryDefault,
} from '../theme'
import { Spinner, PageError } from '../components/shared'
import ErrorPageFallback from '../ui/base/ErrorPageFallback'
import { ConfigProvider } from '../components/config/src'
import { YjsProvider } from '../components/provider-yjs/YjsProvider'
import DynamicFavicon from '../dynamicFavicon'
import { validateColor } from '../theme/color'

type ThemeOverrides = {
  colorPrimary?: string
  colorSecondary?: string
}

const GroupPage = (): ReactNode => {
  const { groupName } = useParams()

  /**
   * TO DO
   * The get group query fetches a lot of data for all groups in the cache.
   * Fetch something more minimal to grab the names(same goes for the login
   * dropdown) and get the full single group afterwards.
   */

  const { loading, error, data } = useQuery(GET_GROUPS)

  // @ts-ignore
  const currentGroup = data?.groups.find(group => group.name === groupName)
  // @ts-ignore
  const activeConfig = currentGroup?.configs?.find(config => config?.active)

  useEffect(() => {
    reloadTranslationsForGroup(
      currentGroup?.name,
      JSON.parse(activeConfig?.translationOverrides || '{}'),
    )
  }, [
    currentGroup?.id,
    currentGroup?.name,
    activeConfig?.id,
    activeConfig?.translationOverrides,
  ])

  const config = useMemo(() => {
    // TODO: Remove old config once refactor of config is completed
    const oldConfig = JSON.parse(currentGroup?.oldConfig || '{}')

    return {
      id: activeConfig?.id,
      groupId: currentGroup?.id,
      groupName: currentGroup?.name,
      formData: activeConfig?.formData,
      urlFrag: `/${currentGroup?.name}`,
      logo: activeConfig?.logo,
      icon: activeConfig?.icon,
      flaxSiteUrl: activeConfig?.flaxSiteUrl,
      ...oldConfig,
      ...JSON.parse(activeConfig?.formData || '{}'),
    }
  }, [
    currentGroup?.id,
    currentGroup?.name,
    currentGroup?.oldConfig,
    activeConfig?.id,
    activeConfig?.formData,
    activeConfig?.logo,
    activeConfig?.icon,
    activeConfig?.flaxSiteUrl,
  ])

  const groupThemeOverrides: ThemeOverrides = useMemo(() => {
    if (!config?.groupIdentity) return {}

    const { primaryColor, secondaryColor } = config.groupIdentity
    const isPrimaryValid = validateColor(primaryColor)
    const isSecondaryValid = validateColor(secondaryColor)

    return {
      colorPrimary: isPrimaryValid ? primaryColor : colorPrimaryDefault,
      colorSecondary: isSecondaryValid ? secondaryColor : colorSecondaryDefault,
    }
  }, [config])

  if (loading) return <Spinner />

  if (error) {
    return <ErrorPageFallback error={error} />
  }

  if (!currentGroup) {
    return <PageError errorCode={404} />
  }

  window.localStorage.setItem('groupId', currentGroup.id)

  // TO DO - refactor colors so that the theme is not bypassed
  setBrandColors(
    config?.groupIdentity?.primaryColor,
    config?.groupIdentity?.secondaryColor,
  )

  // TO DO - should yjs provider wrap the whole group?
  return (
    <ThemeProvider theme={groupThemeOverrides}>
      <ConfigProvider config={config}>
        <YjsProvider>
          <DynamicFavicon config={config} />
          <Outlet />
        </YjsProvider>
      </ConfigProvider>
    </ThemeProvider>
  )
}

export default GroupPage
