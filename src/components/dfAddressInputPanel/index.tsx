import React, { useContext, useCallback, useEffect, useState, useMemo } from 'react'
import styled, { ThemeContext } from 'styled-components'
import useENS from '../../hooks/useENS'
import { useActiveWeb3React } from '../../hooks'
import { ExternalLink, TYPE } from '../../theme'
import { AutoColumn } from '../Column'
import { RowBetween } from '../Row'
import { getEtherscanLink } from '../../utils'


const InputPanel = styled.div<{displayThis: boolean | undefined}>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: 1.25rem;
  background-color: ${({ theme }) => theme.bg1};
  z-index: 1;
  width: 100%;
  display: ${({displayThis}) => displayThis===undefined? 'grid': displayThis? 'grid':'none'};
`

const ContainerRow = styled.div<{ error: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 1.25rem;
  border: 1px solid ${({ error, theme }) => (error ? theme.red1 : theme.bg2)};
  transition: border-color 300ms ${({ error }) => (error ? 'step-end' : 'step-start')},
    color 500ms ${({ error }) => (error ? 'step-end' : 'step-start')};
  background-color: ${({ theme }) => theme.bg1};
`

const InputContainer = styled.div`
  flex: 1;
  padding: 1rem;
`

const Input = styled.input<{ error?: boolean }>`
  font-size: 1.25rem;
  outline: none;
  border: none;
  flex: 1 1 auto;
  width: 0;
  background-color: ${({ theme }) => theme.bg1};
  transition: color 300ms ${({ error }) => (error ? 'step-end' : 'step-start')};
  color: ${({ error, theme }) => (error ? theme.red1 : theme.primary1)};
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  width: 100%;
  ::placeholder {
    color: ${({ theme }) => theme.text4};
  }
  padding: 0px;
  -webkit-appearance: textfield;

  ::-webkit-search-decoration {
    -webkit-appearance: none;
  }

  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  ::placeholder {
    color: ${({ theme }) => theme.text4};
  }
`

export default function AddressInputPanel({
  id,
  onChange,
  displayThis
}: {
  id?: string
  // triggers whenever the typed value changes
  onChange: (value: string) => boolean
  displayThis?: boolean
}) {
  const [daoFundInput, setDaoFundInput] = useState<string>('')
  const [error, setError] = useState(false)
  const { chainId } = useActiveWeb3React()
  const theme = useContext(ThemeContext)
  const { address, name } = useENS(daoFundInput)
 

  const handleInput = useCallback(
    event => {
      let input = event.target.value
      input = input.replace(/\s+/g, '')
      setDaoFundInput(input)
      setError(!onChange(input))
    },
    [onChange, daoFundInput, useENS]
  )


  return (
    <InputPanel id={id} displayThis={displayThis}>
      <ContainerRow error={error}>
        <InputContainer>
          <AutoColumn gap="md">
            <RowBetween>
              <TYPE.black color={theme.text2} fontWeight={500} fontSize={18}>
                DAO Fund
              </TYPE.black>
              {!!address && chainId && (
                <ExternalLink href={getEtherscanLink(chainId, name ?? address, 'address')} style={{ fontSize: '14px' }}>
                  (View on Etherscan)
                </ExternalLink>
              )}
            </RowBetween>
            <Input
              className="fund-address-input"
              type="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              placeholder="Fund Address or ENS name"
              error={error}
              pattern="^(0x[a-fA-F0-9]{40})$"
              onChange={handleInput}
            />
          </AutoColumn>
        </InputContainer>
      </ContainerRow>
    </InputPanel>
  )
}
