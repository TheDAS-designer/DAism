import useDebounce from 'hooks/useDebounce'
import React, { useState, useRef, useEffect } from 'react'
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
  -webkit-appearance: textfield;

  ::-webkit-search-decoration {
    -webkit-appearance: none;
  }

  [type='number'] {
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
  const [daoIdInput, setDaoIdInput] = useState<string>('')
  const reg = /[0-9]*/g;

  //防抖
  const debouncedValue = useDebounce(daoIdInput, 1000)

  useEffect(() => {
    if (debouncedValue) {
      const tempValue = debouncedValue.match(reg);

      let resultStr = "";
      if (tempValue != null) {
        resultStr = tempValue.join("");
        console.log('checkDAOID.resultStr', resultStr)
        onUserInput(resultStr.toString())
      } else {
        onUserInput(debouncedValue)
      }


    }
  }, [debouncedValue])

  return (
    <StyledInput
      {...rest}
      value={daoIdInput}
      onInput={(event) => { setDaoIdInput(event.currentTarget.value) }}
      onChange={event => {
        // replace commas with periods, because uniswap exclusively uses period as the decimal separator
        //setDaoIdInput('123123123')
        //checkDAOID(event.target.value)
        // console.log('onChange value1:', event.target.value)
        // console.log('onChange value2', daoIdInput)
        // onUserInput(daoIdInput)
      }}

      // universal input options
      //inputMode="numeric"
      //title="DAO Name"
      autoComplete="off"
      autoCorrect="off"
      // text-specific options
      //type="number"
      //pattern="^[.*]$"
      // pattern="^[0-9]*$"

      placeholder={placeholder || 'The main point of this DAO'}
      minLength={1}
      maxLength={20}
      spellCheck="false"
    />
  )
})

export default Input

// const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group
