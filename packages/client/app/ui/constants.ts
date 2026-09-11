// Shared, reusable values for the ui/ component library - not theme tokens
// (those belong in app/theme), just small constants that multiple
// components need to agree on or that are otherwise worth naming once.

// Timing for a panel/section collapsing or expanding (width, flex-basis,
// opacity, etc). Used by Menu and the ChatPanel family so they all animate
// at the same speed.
export const collapseTime = '0.3s'
export const collapseTransition = `${collapseTime} ease`
export const collapseTimeMs = parseFloat(collapseTime) * 1000
