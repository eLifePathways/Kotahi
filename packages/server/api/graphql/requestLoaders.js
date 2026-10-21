const DataLoader = require('dataloader')

const { reviewUsersLoader } = require('../../models/review/review.loaders')
const { defaultIdentitiesLoader } = require('../../models/user/user.loaders')

/**
 * Per-request DataLoaders for Kotahi resolvers.
 *
 * Loaders here are created lazily, once per GraphQL context object, and are
 * garbage collected along with it. HTTP contexts live for a single request, so
 * results are cached for that request. Subscription contexts live as long as
 * the subscription, so loaders there only batch and never cache.
 *
 * TODO: Move away from this, and from the direct `dataloader` dependency.
 * @coko/server 5.5.1 creates its loaders per request (cokoserver#63), so these
 * batch functions can be registered as `modelLoaders` in each model's index.js
 * and used via `ctx.loaders`. Blocked on tests: they pass their own GraphQL
 * context, and @coko/server doesn't export a way to build one with loaders.
 */
const createLoaders = options => ({
  defaultIdentities: new DataLoader(defaultIdentitiesLoader, options),
  reviewUsers: new DataLoader(reviewUsersLoader, {
    ...options,
    cacheKeyFn: review => review.id,
  }),
})

const loadersByContext = new WeakMap()

const getRequestLoaders = ctx => {
  if (!ctx || typeof ctx !== 'object') return createLoaders({ cache: false })

  let loaders = loadersByContext.get(ctx)

  if (!loaders) {
    loaders = createLoaders({ cache: !!ctx.req })
    loadersByContext.set(ctx, loaders)
  }

  return loaders
}

module.exports = { getRequestLoaders }
