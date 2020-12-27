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
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')
  const [showImg, setShowImg] = useState('block')
  const [imagePreview, setImagePreview] = useState(<></>)

  // const enforcer = (nextUserInput: string) => {
  //   if (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput))) {
  //     onUserInput(nextUserInput)
  //   }
  // }
  const uploadImg = async (svgFile: File) => {
    //onUserInput(name)
    if(!svgFile) return
    var reader = new FileReader();
    var file = svgFile

    reader.onloadend = () => {
      console.log('文件名为—', file);
      console.log('文件结果为—', reader.result);

      setImagePreviewUrl(reader.result?.toString() ?? '')
      console.log('svgsvgsvgsvgsvgsvg:', reader.result?.toString())
      onUserInput(reader.result?.toString()??'')
    }

    reader.readAsDataURL(file)
    //const svg = await file.text()
    
  }



  useMemo(() => {
  if (imagePreviewUrl) {
    setImagePreview(<label htmlFor="avatarFor">< img style={{ width: '100%', height: '100%' }} src={imagePreviewUrl} /></label>);
    setShowImg('none')
  } else {
    setShowImg('block')
  }
}, [imagePreviewUrl])

  return (
  <>
    <StyledInput
      {...rest}
      onChange={event => {
        // replace commas with periods, because uniswap exclusively uses period as the decimal separator
        // TODO: Check if the name of the DAO exists
        event.preventDefault()
        if (event.target.files)
          uploadImg(event.target.files[0])
      }}
      autoComplete="off"
      autoCorrect="off"
      type="file"
      id="avatarFor"
     // placeholder={placeholder || 'The main point of this DAO'}
    />
    {/* imagePreviewUrl ? <label htmlFor="avatarFor">< img style={{ width: '80px', height: '80px' }} src={imagePreviewUrl} /></label> : null */}
    {imagePreview}
    <label style={{ color: "#1890FF", border: "1px dashed #1890FF", padding: '3px 10px ', display: showImg , borderRadius:'5px', lineHeight:'50px'}} htmlFor="avatarFor">+ Click here to upload</label>
  </>
)
})

export default Input

// const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group
