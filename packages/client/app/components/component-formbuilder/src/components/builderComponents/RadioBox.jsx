import styled from 'styled-components'
import { RadioGroup as UnstableRadioGroup } from '../../../../pubsweet'

const RadioGroup = styled(UnstableRadioGroup)`
  position: relative;
`

const RadioboxFieldBuilder = input => <RadioGroup {...input} />
export default RadioboxFieldBuilder
