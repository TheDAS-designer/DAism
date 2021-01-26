import useDebounce from 'hooks/useDebounce'
import React, { useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { escapeRegExp } from '../../utils'



const StyledInput = styled.input<{ error?: boolean; fontSize?: string; align?: string }>`
  color: ${({ error, theme }) => (error ? theme.red1 : theme.text1)};
  width: 0;
  position: relative;
  font-weight: 500;
  outline: none;
  border: none;
  flex: 1 1 auto;
  background-color: ${({ theme }) => theme.bg1};
  font-size: ${({ fontSize }) => fontSize ?? '24px'};
  text-align: ${({ align }) => align && align};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0px;
  display:none;
  -webkit-appearance: textfield;

  ::-webkit-search-decoration {
    -webkit-appearance: none;
  }

  [type='file'] {
    -moz-appearance: textfield;
  }

  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  ::placeholder {
    color: ${({ theme }) => theme.text4};
  }
`

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group

export const Input = React.memo(function InnerInput({
  onUserInput,
  placeholder,
  ...rest
}: {
  onUserInput: (input: string) => void
  error?: boolean
  fontSize?: string
  align?: 'right' | 'left'
} & Omit<React.HTMLProps<HTMLInputElement>, 'ref' | 'onChange' | 'as'>) {
  
  const [value, setValue] = useState('')
  const debouncedValue = useDebounce(value,1000)

  useEffect(()=>{
    if(debouncedValue){
      onUserInput(debouncedValue)
    }
  },[debouncedValue])

  return (
  <>
    <StyledInput
      {...rest}
      autoComplete="off"
      autoCorrect="off"
      type="text"
      inputMode="text"
      onChange={event => {
        // replace commas with periods, because uniswap exclusively uses period as the decimal separator
        // TODO: Check if the name of the DAO exists
        setValue(event.target.value)
      }}
    />
  </>
)
})

export default Input
