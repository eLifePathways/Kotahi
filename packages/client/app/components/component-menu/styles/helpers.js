/* eslint-disable react/prop-types */

import { convertCamelCaseToTitleCase } from '../../../shared/textUtils'

export const menuItemContainsCurrentPage = (item, location) =>
  item.link === location.pathname ||
  item.links?.some(subItem => menuItemContainsCurrentPage(subItem, location))

export const FormattedGlobalAndGroupRoles = (
  { globalRoles, groupRoles },
  t,
) => {
  const allRoles = globalRoles.concat(groupRoles)

  let unCamelCasedRoles =
    allRoles.includes('groupManager') || allRoles.includes('admin')
      ? allRoles
          .filter(role => role !== 'user')
          .map(role => convertCamelCaseToTitleCase(role))
      : allRoles.map(role => convertCamelCaseToTitleCase(role))

  if (!unCamelCasedRoles.length) return null
  unCamelCasedRoles = unCamelCasedRoles.map(elem => {
    return t(`common.roles.${elem}`)
  })
  return unCamelCasedRoles.join(', ')
}
