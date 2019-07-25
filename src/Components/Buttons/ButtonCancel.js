import React from 'react'
import Button from '@govuk-react/button'
import { GREY_2, GREY_3, TEXT_COLOUR } from 'govuk-colours'

const ButtonCancel = props => (
  <Button
    buttonColour={GREY_3}
    buttonHoverColour={GREY_2}
    buttonShadowColour={GREY_2}
    buttonTextColour={TEXT_COLOUR}
    {...props}
  />
)

export default ButtonCancel
