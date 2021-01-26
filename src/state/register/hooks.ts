import useENS from '../../hooks/useENS'
import { parseUnits } from '@ethersproject/units'
import {  ETHER, JSBI, Token } from '@uniswap/sdk'
import { ParsedQs } from 'qs'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { isAddress } from '../../utils'
import { AppDispatch, AppState } from '../index'
import { setDAOName, setDAOID, setSvg, setTokenSymbol, checkingDAOName, checkedDAOName } from './actions';



export function useRegisterState(): AppState['register'] {
  return useSelector<AppState, AppState['register']>(state => state.register)
}

// export function useCheckDAOName(daoName: string) {
//   const dispatch = useDispatch<AppDispatch>()
//   // const isChecked = useCheck(daoName)
//   return useCallback(()=>{
//     dispatch(checkingDAOName({isChecking: true}))
//     if(isChecked) {
//       dispatch(checkedDAOName())
//     }
//     dispatch(checkingDAOName({isChecking: false}))
//   },[dispatch])
 
// }

export function useRegisterActionHandlers(): {
  onDAONameChange: (daoName: string) => boolean
  onTokenSymbolChange: (tokenSymbol: string) => void
  onSvgChange: (svg: string | null ) => void
  onRegisterSubmit: () => void
} {
 // const isChecked = useCheck(daoName)
  const dispatch = useDispatch<AppDispatch>()
 // const aaa = useDAONameCheck(ddName)
  const onDAONameChange = useCallback(
    (daoName: string): boolean => {
      if(!daoName) return false
      dispatch(setDAOName({daoName}))
      return true
    },
    [dispatch]
  )

  const onDAOIDChange = useCallback((daoID: string) => {
    // const id = JSBI() Number(daoID)+(1<<127 )-1).toString()
    const id = JSBI.add( JSBI.BigInt(daoID) ,JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(127)))
    console.log('onDAOIDChange!!:', id.toString())
    dispatch(setDAOID({daoID: id.toString()}))
  }, [dispatch])

  const onTokenSymbolChange = useCallback((tokenSymbol: string)=>{
    if(tokenSymbol.length > 50) return
    dispatch(setTokenSymbol({tokenSymbol}))
  },[])

  const onSvgChange = useCallback(
    (svg: string | null) => {
      dispatch(setSvg({svg}))
    },
    [dispatch]
  )

  const onRegisterSubmit = useCallback(
    () => {
      
    },
    [dispatch]
  )

  return {
    onDAONameChange,
    onTokenSymbolChange,
    onSvgChange,
    onRegisterSubmit
  }
}

// try to parse a user entered amount for a given token
// export function tryParseAmount(value?: string, currency?: Currency): CurrencyAmount | undefined {
//   if (!value || !currency) {
//     return undefined
//   }
//   try {
//     const typedValueParsed = parseUnits(value, currency.decimals).toString()
//     if (typedValueParsed !== '0') {
//       return currency instanceof Token
//         ? new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
//         : CurrencyAmount.ether(JSBI.BigInt(typedValueParsed))
//     }
//   } catch (error) {
//     // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
//     console.debug(`Failed to parse input amount: "${value}"`, error)
//   }
//   // necessary for all paths to return a value
//   return undefined
// }

const BAD_RECIPIENT_ADDRESSES: string[] = [
  '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', // v2 factory
  '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a', // v2 router 01
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D' // v2 router 02
]

/**
 * Returns true if any of the pairs or tokens in a trade have the given checksummed address
 * @param trade to check for the given address
 * @param checksummedAddress address to check in the pairs and tokens
 */
// function involvesAddress(trade: Trade, checksummedAddress: string): boolean {
//   return (
//     trade.route.path.some(token => token.address === checksummedAddress) ||
//     trade.route.pairs.some(pair => pair.liquidityToken.address === checksummedAddress)
//   )
// }



function parseCurrencyFromURLParameter(urlParam: any): string {
  if (typeof urlParam === 'string') {
    const valid = isAddress(urlParam)
    if (valid) return valid
    if (urlParam.toUpperCase() === 'ETH') return 'ETH'
    if (valid === false) return 'ETH'
  }
  return 'ETH' ?? ''
}

function parseTokenAmountURLParameter(urlParam: any): string {
  return typeof urlParam === 'string' && !isNaN(parseFloat(urlParam)) ? urlParam : ''
}



const ENS_NAME_REGEX = /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
function validatedRecipient(recipient: any): string | null {
  if (typeof recipient !== 'string') return null
  const address = isAddress(recipient)
  if (address) return address
  if (ENS_NAME_REGEX.test(recipient)) return recipient
  if (ADDRESS_REGEX.test(recipient)) return recipient
  return null
}



// updates the swap state to use the defaults for a given network
// export function useDefaultsFromURLSearch():
//   | { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined }
//   | undefined {
//   const { chainId } = useActiveWeb3React()
//   const dispatch = useDispatch<AppDispatch>()
//   const parsedQs = useParsedQueryString()
//   const [result, setResult] = useState<
//     { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined } | undefined
//   >()

//   useEffect(() => {
//     if (!chainId) return
//     const parsed = queryParametersToSwapState(parsedQs)

//     dispatch(
//       replaceSwapState({
//         typedValue: parsed.typedValue,
//         field: parsed.independentField,
//         inputCurrencyId: parsed[Field.INPUT].currencyId,
//         outputCurrencyId: parsed[Field.OUTPUT].currencyId,
//         recipient: parsed.recipient
//       })
//     )

//     setResult({ inputCurrencyId: parsed[Field.INPUT].currencyId, outputCurrencyId: parsed[Field.OUTPUT].currencyId })
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [dispatch, chainId])

//   return result
// }
