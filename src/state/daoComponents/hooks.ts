import useENS from '../../hooks/useENS'
import { parseUnits } from '@ethersproject/units'
import { ETHER, JSBI, Token } from '@uniswap/sdk'
import { ParsedQs } from 'qs'
import { useCallback, useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useActiveWeb3React } from '../../hooks'
import useParsedQueryString from '../../hooks/useParsedQueryString'
import { isAddress } from '../../utils'
import { AppDispatch, AppState } from '../index'
import { showAddDaoComponentsPanelWithDaoNameAction, daoFactoryChangeAction, daoFundChangeAction, addMemberAddressAction, memberPrestigeChangeAction, memberDeleteAction, inputErrorAction } from './actions';
import { Member } from './reducer';

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

export function useDaoComponentsState(): AppState['daoComponents'] {
  return useSelector<AppState, AppState['daoComponents']>(state => state.daoComponents)
}


export function useDaoComponentsActionHandlers(): {
  onShowDaoComponentsPanel: (daoId: string) => void
  isShowDaoComponentsState: boolean
  onAddDaoFactory: (address: string) => boolean
  daoFactoryState: string
  onAddDaoFund: (address: string) => boolean
  onAddDaoMemberAddress: (address: string) => void
  onChangeDaoMemberAddressInput: (address: string) => boolean
  onChangeDaoMemberPrestigeInput: (address: string, prestigeAmount: number) => void
  members: Array<Member>
  onClickDeleteMember: (address:string) => void
} {

  const dispatch = useDispatch<AppDispatch>()
  const isShow = useDaoComponentsState().showAddDaoComponentsPanel
  const errorState = useDaoComponentsState().inputError
  // const aaa = useDAONameCheck(ddName)
  const onShowDaoComponentsPanel = useCallback(
    (daoName: string) => {
      dispatch(showAddDaoComponentsPanelWithDaoNameAction({daoName}))
    },
    [dispatch])

  const isShowDaoComponentsState = useMemo(() => {
    return isShow
  }, [isShow])

  const onAddDaoFactory = useCallback((address: string) => {
    //这里可以做前端校验
    const daoFactoryAddress = validatedComponentsAddress(address)
    if (!daoFactoryAddress) 
    {
      
      dispatch(inputErrorAction({...errorState, factoryError: true}))
      return false
    }

    console.log('testing add DAo Factory address right')
    dispatch(daoFactoryChangeAction({ daoFactoryAddress }))
    return true
  }, [dispatch, daoFactoryChangeAction, validatedComponentsAddress, errorState])

  const daoFactoryState = useDaoComponentsState().daoFactoryAddress

  const onAddDaoFund = useCallback((address: string) => {
    //这里可以做前端校验
    const daoFundAddress = validatedComponentsAddress(address)
    if (!daoFundAddress) {
      dispatch(inputErrorAction({...errorState, fundError: true}))
      return false
    }
    console.log('testing add DAo Fund address right')
    dispatch(daoFundChangeAction({ daoFundAddress }))
    return true
  }, [dispatch, daoFundChangeAction, validatedComponentsAddress, errorState])

  const onChangeDaoMemberAddressInput = useCallback((address: string) => {
    //这里可以做前端校验
    const memberAddress = validatedComponentsAddress(address)
    if (!memberAddress) {
      dispatch(inputErrorAction({...errorState, memberError: true}))
      return false
    }
    return true
  }, [ validatedComponentsAddress , errorState])


  const onChangeDaoMemberPrestigeInput = useCallback((address:string, prestigeAmount: number) => {
    const memberAddress = validatedComponentsAddress(address)
    if (!memberAddress){  
      return 
    }

    dispatch(memberPrestigeChangeAction({address, prestigeAmount}))
  }, [ dispatch, memberPrestigeChangeAction,validatedComponentsAddress])


  const onAddDaoMemberAddress = useCallback((address: string) => {
    const member: Member = {address, prestige: 0}
    dispatch(addMemberAddressAction(member))
    // return true
  }, [dispatch, addMemberAddressAction])

  const onClickDeleteMember = useCallback((address:string)=>{
    const memberAddress = validatedComponentsAddress(address)
    if (!memberAddress) return 
    dispatch(memberDeleteAction({address}))
  },[dispatch, memberDeleteAction])
  
  const members = useDaoComponentsState().daoMemebers
  return {
    onShowDaoComponentsPanel,
    isShowDaoComponentsState,
    onAddDaoFactory,
    daoFactoryState,
    onAddDaoFund,
    onAddDaoMemberAddress,
    onChangeDaoMemberAddressInput,
    onChangeDaoMemberPrestigeInput,
    members,
    onClickDeleteMember
  }
}

