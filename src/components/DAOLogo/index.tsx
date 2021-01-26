import { Currency } from '@uniswap/sdk'
import React from 'react'
import styled from 'styled-components'
import CurrencyLogo from '../CurrencyLogo'

const Wrapper = styled.div<{ margin: boolean; sizeraw: number }>`
  position: relative;
  display: flex;
  flex-direction: row;
  margin-right: ${({ sizeraw, margin }) => margin && (sizeraw / 3 + 8).toString() + 'px'};
`

interface DoubleCurrencyLogoProps {
  margin?: boolean
  size?: number
  svg?: string
}

const HigherLogo = styled(CurrencyLogo)`
  z-index: 2;
`
const CoveredLogo = styled(CurrencyLogo)<{ sizeraw: number }>`
  position: absolute;
  left: ${({ sizeraw }) => '-' + (sizeraw / 2).toString() + 'px'} !important;
`

export default function DaoSvgLogo({
  size = 16,
  margin = false,
  svg,
}: DoubleCurrencyLogoProps) {
  return (
    <Wrapper sizeraw={size} margin={margin}>
      {svg && <img src={svg}/>}
    </Wrapper>
  )
}
