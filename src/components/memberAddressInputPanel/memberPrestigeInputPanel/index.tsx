import { darken } from 'polished';
import React, { useCallback, useRef, useState } from 'react';
import { useDaoComponentsActionHandlers } from 'state/daoComponents/hooks';
import styled from 'styled-components';
import { shortenAddress } from 'utils';
import { Member } from '../../../state/daoComponents/reducer';
import { Button as RebassButton, ButtonProps } from 'rebass/styled-components'
import { HookCallbacks } from 'async_hooks';

const CurrencySelect = styled.button<{ selected: boolean }>`
  align-items: center;
  height: 2.2rem;
  font-size: 20px;
  font-weight: 500;
  background-color: ${({ selected, theme }) => (selected ? theme.bg1 : theme.primary1)};
  color: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
  border-radius: 12px;
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  outline: none;
  cursor: pointer;
  user-select: none;
  border: none;
  padding: 0 0.5rem;
`
const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
`
const StyledTokenName = styled.span<{ active?: boolean }>`
margin:0 auto;
display:block;
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.75rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  ${({ active }) => (active ? '20px' : '16px')};
  :focus,
  :hover {
    background-color: ${({ theme }) => (false ? theme.bg2 : darken(0.05, theme.primary1))};
  }
  &::after{
      content:":"
      margin-right:10px;
  }

`

const Prestige = styled.div`
  display:flex;
  width: 60%;
`


const InputPrestige = styled.input<{ error?: boolean, hidden?: boolean }>`
hidden:${(hidden) => hidden ? 'true' : 'false'};  
padding-left:8px !important; 
font-size: 1.25rem;
  outline: none;
  border: 1px;
  border-radius: 12px 0 0 12px ;
  flex: 1 1 auto;
  width: 0;
  background-color: ${({ theme }) => theme.bg3};
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
    color: ${({ theme }) => theme.text3};
    font-size: 1rem;
    text-align:center;
  }
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

const PrestigeButton = styled(Base)`
background-color: ${({ theme }) => theme.primary5};
color: ${({ theme }) => theme.primaryText1};
font-size: 16px;
font-weight: 500;
line-height: 30%;
float:right;
width:50%;
&:focus {
  box-shadow: 0 0 0 1pt ${({ theme, disabled }) => !disabled && darken(0.03, theme.primary5)};
  background-color: ${({ theme, disabled }) => !disabled && darken(0.03, theme.primary5)};
}
&:hover {
  background-color: ${({ theme, disabled }) => !disabled && darken(0.03, theme.primary5)};
}
&:active {
  box-shadow: 0 0 0 1pt ${({ theme, disabled }) => !disabled && darken(0.05, theme.primary5)};
  background-color: ${({ theme, disabled }) => !disabled && darken(0.05, theme.primary5)};
}
:disabled {
  opacity: 0.4;
  :hover {
    cursor: auto;
    background-color: ${({ theme }) => theme.primary5};
    box-shadow: none;
    border: 1px solid transparent;
    outline: none;
  }
}
`


export const InputRow = styled.div<{ selected?: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  padding: ${({ selected }) => (selected ? '0.75rem 0.5rem 0.75rem 1rem' : '0.75rem 0.75rem 0.75rem 1rem')};
`


export default function PrestigePanel(
    { member, onChange, onClickDelete }
        :
        { member: Member, 
            onChange: (address: string, prestigeAmount: number) => void 
        onClickDelete: (address: string) => void}
) {
    const prestigeInputRef = useRef<HTMLInputElement | null>(null)

    const [errorPrestige, setErrorPrestige] = useState(false)

    const [memberPrestigeInput, setMemeberPrestigeInput] = useState('')

    const [inputFocus, setInputFocus ]= useState(false)

    //onChange prestige handle
    // TODO
    const handlePrestigeChagne = useCallback((event) => {
        if (!member.address) return

        const input = event.target.value
        const withoutSpaces = input.replace(/\s+/g, '')
        const p = /^[0-9]*$/

        if (!p.test(withoutSpaces)) {
            setErrorPrestige(true)
            return
        }
        setMemeberPrestigeInput(withoutSpaces)

        onChange(member.address, Number(withoutSpaces))
    }, [onChange, member])

    //清空或者删除member
    const handleClearOrDelete = useCallback(event => {
        if (memberPrestigeInput) {
            if (!prestigeInputRef || !prestigeInputRef.current || !prestigeInputRef.current) return
            prestigeInputRef.current.value = ''
            setMemeberPrestigeInput('')
            onChange(member.address, 0)
        } else {
            onClickDelete(member.address)
        }
    }, [memberPrestigeInput, prestigeInputRef])


    return (

        <InputRow style={true ? { padding: '0', borderRadius: '8px' } : {}} selected={true}>


            <CurrencySelect
                selected={true}
                className="open-currency-select-button"
                onClick={() => {

                }}
            >

                <Aligner>
                    <StyledTokenName active={inputFocus}>
                        {shortenAddress(member?.address ?? '')}:
                    </StyledTokenName>
                </Aligner>

            </CurrencySelect>
            <Prestige>
                <InputPrestige
                    hidden={false}
                    className="member-prestige-input"
                    type="number"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    placeholder="prestige"
                    error={errorPrestige}
                    pattern="^[0-9]*$"
                    onChange={handlePrestigeChagne}
                    onFocus={()=>{
                        setInputFocus(true)
                    }}
                    onBlur={()=>{
                        setInputFocus(false)
                    }}
                    ref={prestigeInputRef}
                // value={memberPrestigeInput}
                />
                <PrestigeButton onClick={handleClearOrDelete}>
                    {memberPrestigeInput ? 'clear' : 'delete'}
                </PrestigeButton>
            </Prestige>
        </InputRow>

    )


}