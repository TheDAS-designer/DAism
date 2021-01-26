import React, { useContext, useMemo, useState, useEffect, useCallback } from 'react'
import useDebounce from 'hooks/useDebounce'
import { Text,Box } from 'rebass'
import { Label, Input } from '@rebass/forms'

export default function(){

  const [value, setValue] = useState('')
  const debouncedValue = useDebounce(value,1000)
  const searchDao  = useCallback((daoName)=>{
    console.log(daoName)
  },[debouncedValue])
  useEffect(()=>{
    if(debouncedValue){
      // TODO get dao by name
      searchDao(debouncedValue)
    }
  },[debouncedValue])
  return (
    <Box>      
                <Input
                  id='searchDAO'
                  name='searchDAO'
                  type='text'
                  placeholder='DAO name &crarr;'
                  onChange={(e)=>{
                    //e.preventDefault()
                    setValue(e.target.value)
                  }}
                />
              </Box>
  )
}