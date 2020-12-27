import React, { useContext, useCallback, useState, useRef } from 'react'
import styled, { ThemeContext } from 'styled-components'
import useENS from '../../hooks/useENS'
import { useActiveWeb3React } from '../../hooks'
import { ExternalLink, TYPE } from '../../theme'
import { AutoColumn } from '../Column'
import { RowBetween } from '../Row'
import { getEtherscanLink } from '../../utils'
import { darken } from 'polished'
import CurrencyLogo from 'components/CurrencyLogo'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'
import { useTranslation } from 'react-i18next'
import { ButtonPrimary } from 'components/Button'
import { Button as RebassButton, ButtonProps } from 'rebass/styled-components'
import { shortenAddress } from '../../utils'
import { useDaoComponentsActionHandlers } from '../../state/daoComponents/hooks'
import PrestigePanel from './memberPrestigeInputPanel'
import { Member } from '../../state/daoComponents/reducer';

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
    font-size:1.2rem;
  }
`







const StyledDropDown = styled(DropDown) <{ selected: boolean }>`
  margin: 0 0.25rem 0 0.5rem;
  height: 35%;

  path {
    stroke: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
    stroke-width: 1.5px;
  }
`
const InputRow = styled.div<{ selected?: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  padding: ${({ selected }) => (selected ? '0.75rem 0.5rem 0.75rem 1rem' : '0.75rem 0.75rem 0.75rem 1rem')};
`


const Base = styled(RebassButton) <{
  padding?: string
  width?: string
  borderRadius?: string
  altDisabledStyle?: boolean
  registeredAndNoShowComponents?: boolean
}>`
  padding: ${({ padding }) => (padding ? padding : '18px')};
  width: ${({ width }) => (width ? width : '100%')};
  font-weight: 500;
  text-align: center;
  border-radius: 0px 12px 12px 0px;
  border-radius: ${({ borderRadius }) => borderRadius && borderRadius};
  outline: none;
  border: 1px solid transparent;
  color: white;
  text-decoration: none;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
  cursor: pointer;
  position: relative;
  z-index: 1;
  &:disabled {
    cursor: auto;
  }

  > * {
    user-select: none;
  }
  ${({ registeredAndNoShowComponents }) => (registeredAndNoShowComponents ? 'box-shadow: 5px 5px 50px #e4498e' : null)};
`


const ButtonAdd = styled(Base)`
  background-color: ${({ theme }) => theme.primary1};
  border-radius:2px 12px 12px 2px;
  width:20%;
  height:75%;
  color: ${({ theme }) => theme.text2};
  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.05, theme.primary1)};
    background-color: ${({ theme }) => darken(0.05, theme.primary1)};
  }
  &:hover {
    background-color: ${({ theme }) => darken(0.05, theme.primary1)};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.1, theme.primary1)};
    background-color: ${({ theme }) => darken(0.1, theme.primary1)};
  }
  &:disabled {
    background-color: ${({ theme, altDisabledStyle }) => (altDisabledStyle ? theme.primary1 : theme.bg3)};
    color: ${({ theme, altDisabledStyle }) => (altDisabledStyle ? 'white' : theme.text3)};
    cursor: auto;
    box-shadow: none;
    border: 1px solid transparent;
    outline: none;
    opacity: ${({ altDisabledStyle }) => (altDisabledStyle ? '0.7' : '1')};
  }
  
`

export default function AddressInputPanel({
  id,
  displayThis
}: {
  id?: string
  // the typed string value
  value?: string
  // triggers whenever the typed value changes
  onClickAdd?: (value: string) => boolean
  displayThis?: boolean
}) {
  const { onAddDaoMemberAddress, onChangeDaoMemberAddressInput, onChangeDaoMemberPrestigeInput, members, onClickDeleteMember } = useDaoComponentsActionHandlers()

  const { t } = useTranslation()
  const [memberAddressInput, setMemberAddressInput] = useState('')
  const [memberPrestigeInput, setMemeberPrestigeInput] = useState('')
  const [error, setError] = useState(false)
  const { address, name } = useENS(memberAddressInput)
  const { chainId } = useActiveWeb3React()
  const theme = useContext(ThemeContext)
  const addAddressRef = useRef<HTMLInputElement>(null)
  //onChange address handle
  const handleAddressInput = useCallback(
    event => {
      const input = event.target.value
      const withoutSpaces = input.replace(/\s+/g, '')
      if (!withoutSpaces) {
        setError(false)
        return
      }

      if (onChangeDaoMemberAddressInput(withoutSpaces)) {
        setError(false)
        setMemberAddressInput(withoutSpaces)
      } else {
        setError(true)
      }
    },
    [onChangeDaoMemberAddressInput]
  )


  //onClick Add func handle
  const handleOnClickAdd = useCallback(() => {

    if (memberAddressInput) {
      onAddDaoMemberAddress(memberAddressInput)
      setMemberAddressInput('')
      if (!addAddressRef || !addAddressRef.current) return
      addAddressRef.current.value = ''
    }

  }, [memberAddressInput, onAddDaoMemberAddress])



  //onClear prestige handle
  // TODO
  const handleClearPrestige = useCallback(() => { }, [])
  return (
    <InputPanel id={id} displayThis={displayThis}>
      <ContainerRow error={error}>
        <InputContainer>
          <AutoColumn gap="md">
            <RowBetween>
              <TYPE.black color={theme.text2} fontWeight={500} fontSize={18}>
                Add Members
              </TYPE.black>
              {!!address && chainId && (
                <ExternalLink href={getEtherscanLink(chainId, name ?? address, 'address')} style={{ fontSize: '14px' }}>
                  (View on Etherscan)
                </ExternalLink>
              )}
            </RowBetween>

            <InputRow style={true ? { padding: '0', borderRadius: '8px' } : {}} selected={true}>
              <Input

                className="member-address-input"
                type="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                placeholder="Member Address or ENS name"
                error={error}
                pattern="^(0x[a-fA-F0-9]{40})$"
                onChange={handleAddressInput}
                ref={addAddressRef}
              />

              <ButtonAdd disabled={Boolean(error)} onClick={handleOnClickAdd} >
                Add
              </ButtonAdd>
            </InputRow>

            {members.map((member, index) =>
              member && <PrestigePanel key={member.address} member={member} onChange={onChangeDaoMemberPrestigeInput} onClickDelete={onClickDeleteMember} />)
            }


          </AutoColumn>
        </InputContainer>
      </ContainerRow>
    </InputPanel>
  )
}
