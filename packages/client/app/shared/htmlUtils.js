export const hasValue = val =>
  typeof val === 'string' &&
  val &&
  val !== '<p class="paragraph"></p>' &&
  val !== '<p></p>'
