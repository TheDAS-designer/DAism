import { useCallback, useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { isAddress } from '../../utils'
import { AppDispatch, AppState } from '../index'
import { isShowIssuePanelAction, saveIssueDataAction } from './actions';
import { daoIssueInterface } from './reducer';
import { JSBI } from '@uniswap/sdk';
import { MaxUint256} from '@ethersproject/constants'

const ENS_NAME_REGEX = /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
function validatedComponentsAddress(componentsAddress: any): string | null {
  if (typeof componentsAddress !== 'string') return null
  const address = isAddress(componentsAddress)
  if (address) return address
  if (ENS_NAME_REGEX.test(componentsAddress)) return componentsAddress
  if (ADDRESS_REGEX.test(componentsAddress)) return componentsAddress
  return null
}

export function useDaoIssueState(): AppState['daoIssue'] {
  return useSelector<AppState, AppState['daoIssue']>(state => state.daoIssue)
}


export function useDaoIssueActionHandlers(): {
  onClickShowIssuePanel: () => void
  saveIssueData: (data: daoIssueInterface) => boolean
} {

  const dispatch = useDispatch<AppDispatch>()
  // const aaa = useDAONameCheck(ddName)
  const onClickShowIssuePanel = useCallback(
    () => {

      dispatch(isShowIssuePanelAction())
    },
    [dispatch])

  const saveIssueData = useCallback((data: daoIssueInterface) => {
    console.log('saveIssueDatasaveIssueDatasaveIssueData:', saveIssueData)
    //TODO 1.保证比例的数量在1 - 100 之间
    let allocationProportion = data.allocationProportion
    if (Number(allocationProportion) > 100 || Number(allocationProportion) <= 0) {
      return  false
    }
    let initialPrice = data.initialPrice
    let decimal = data.decimal
    if (Number(decimal) < 1 || Number(decimal) > 18) return false
    let tokenName = data.tokenName
    if (tokenName.length > 15) return false
    let tokenSymbol = data.tokenSymbol
    if (tokenSymbol.length > 15) return false
    let totalSupply = data.totalSupply
    if (JSBI.greaterThan(
      JSBI.multiply(
        JSBI.BigInt(totalSupply),
        JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimal))
      )
      , JSBI.BigInt(MaxUint256)))
    {
      return false
    }

    dispatch(saveIssueDataAction({data: {allocationProportion, initialPrice , decimal, tokenName, tokenSymbol, totalSupply}}))

    return true
  }, [dispatch])
  return {
    onClickShowIssuePanel,
    saveIssueData
  }
}

