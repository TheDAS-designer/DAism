import { MaxUint256 } from '@ethersproject/constants'
import { TransactionResponse } from '@ethersproject/providers'
import { useCallback, useMemo } from 'react'
import { useTransactionAdder, useHasPendingRegister, useHasPendingAddBody } from '../state/transactions/hooks'
import { computeSlippageAdjustedAmounts } from '../utils/prices'
import { calculateGasMargin, shortenAddress } from '../utils'
import { useRegisterContract, useTokenContract } from './useContract'
import { useActiveWeb3React } from './index'
import { useRegisterState } from '../state/register/hooks'

import { BigNumber } from 'ethers'
import { DAO } from '../state/register/reducer';
import { daoComponentsInterface } from '../state/daoComponents/reducer';
import { useDaoComponentsState } from 'state/daoComponents/hooks'
import { showAddDaoComponentsPanelWithDaoIDAction } from '../state/daoComponents/actions';

export enum RegistState {
  ERROR_DAONAME,
  ERROR_DAOID,
  ERROR_SVG,
  UNKNOWN,
  NOT_REGISTERD,
  PENDING,
  REGISTERD
}

export enum BodyState{
  ERROR,
  NOT_ADD,
  PENDING,
  ADDED,
  UNKNOWN,
  UNCHECK
}

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useRegisterCallback(): [RegistState, () => Promise<void>] {

  const { chainId, account } = useActiveWeb3React()
  const registerContract = useRegisterContract()
  const addTransaction = useTransactionAdder()
  const registerState = useRegisterState()
  const dao :DAO = {daoName: registerState.daoName, svg: registerState.svg as string, daoID: registerState.daoID}
  const [pendingRegister, notRegistered, registered] = useHasPendingRegister(dao)
  //const  isCreated = useIsDAOCreated()
  // check the current approval status
  const registerStateMemo: RegistState = useMemo(() => {
    console.log('[pendingRegister, notRegistered, registered] :', pendingRegister, notRegistered, registered)
    if (!registerState.daoName)return RegistState.ERROR_DAONAME
    if(!registerState.daoID) return RegistState.ERROR_DAOID
    if(!registerState.svg)return RegistState.ERROR_SVG
    if(registered) return RegistState.REGISTERD
    if(notRegistered) return RegistState.NOT_REGISTERD
    
    if (pendingRegister) {
      return RegistState.PENDING
    }
   
      //console.log('isCreated:', isCreated)
      //if(!isCreated) return RegistState.NOT_REGISTERD  //暂时先不管这个
    
    return RegistState.UNKNOWN
    
    
  }, [registerState,pendingRegister, notRegistered, registered])


  const registering = useCallback(async (): Promise<void> => {
    if (!dao.daoName || !dao.daoID || !dao.svg
      || !account || !chainId) {
      return
    }

    if (registerStateMemo !== RegistState.NOT_REGISTERD) {
      console.error('Regist was called unnecessarily')
      return
    }

    const estimatedGas = await registerContract?.estimateGas.register(registerState.daoName, registerState.svg, registerState.daoID, { value: 1 })

    return registerContract?.register(registerState.daoName, registerState.svg, registerState.daoID, {
      gasLimit: calculateGasMargin(estimatedGas as BigNumber),
      value: 1
    })
      .then((response: TransactionResponse) => {
        console.log('useRegist response:', response)
        addTransaction(response, { summary: `${registerState.daoName} DAO has been created successfully`, dao})
        //eventName: EventType, listener: Listener
      }).catch((error: Error) => {
        console.debug('Failed to registe DAO', error)
        throw error
      })
  }, [registerState, registerContract, account, addTransaction, chainId, dao])

  return [registerStateMemo, registering]
}

// wraps useApproveCallback in the context of a swap
export function useRegisterCallbackFromDAO() {

  return useRegisterCallback()
}

export function useAddBodyCallback(): [BodyState, () => Promise<void>] {
  const { chainId, account } = useActiveWeb3React()
  const registerContract = useRegisterContract()
  const addTransaction = useTransactionAdder()
  const daoComponentsState = useDaoComponentsState()
  const [pendingAdd, not_add, added] = useHasPendingAddBody(daoComponentsState)
  //const  isCreated = useIsDAOCreated()
  // check the current approval status
  const bodyState: BodyState = useMemo(() => {
    console.log('[pendingAdd, not_add, added] :',pendingAdd, not_add, added)
    if(!daoComponentsState.daoFactoryAddress || !daoComponentsState.daoFundAddress || daoComponentsState.daoMemebers?.length === 0)return BodyState.UNCHECK
    if(daoComponentsState.inputError && (daoComponentsState.inputError.factoryError || daoComponentsState.inputError.fundError || daoComponentsState.inputError.memberError)) {
      return BodyState.ERROR
    }
    if(added) return BodyState.ADDED
    if(not_add) return BodyState.NOT_ADD
    
    if (pendingAdd) {
      return BodyState.PENDING
    }
   
      //console.log('isCreated:', isCreated)
      //if(!isCreated) return RegistState.NOT_REGISTERD  //暂时先不管这个
    
    return BodyState.UNKNOWN
    
    
  }, [daoComponentsState,pendingAdd, not_add, added])


  const addBody = useCallback(async (): Promise<void> => {
    // console.log('addBody!!!!! ')
    // console.log(`daoComponentsState.daoId:${daoComponentsState.daoId} daoComponentsState.daoFactoryAddress:${daoComponentsState.daoFactoryAddress} daoComponentsState.daoFundAddress:${daoComponentsState.daoFundAddress}`)
    if (bodyState === BodyState.ERROR
      || !account || !chainId) {
      return
    }
    console.log('addBody!!!!!checked')
    if (bodyState !== BodyState.NOT_ADD) {
      console.error('AddBody was called unnecessarily')
      return
    }

    //初始成员
    const memberAddrArray : Array<string> = daoComponentsState.daoMemebers.map((m)=>{return m.address})
    const memberPrestigeArray : Array<number> = daoComponentsState.daoMemebers.map( m => m.prestige)
    if(memberAddrArray.length != memberPrestigeArray.length){
      return
    }

    const estimatedGas = await registerContract?.estimateGas
    ._registerForBody(daoComponentsState.daoFactoryAddress, daoComponentsState.daoFundAddress, daoComponentsState.daoId, memberAddrArray, memberPrestigeArray)

    return registerContract?._registerForBody(daoComponentsState.daoFactoryAddress, daoComponentsState.daoFundAddress, daoComponentsState.daoId, memberAddrArray, memberPrestigeArray, {
      gasLimit: calculateGasMargin(estimatedGas as BigNumber)
    })
      .then((response: TransactionResponse) => {
        console.log('useAddBody response:', response)
        addTransaction(response, { summary: `[${daoComponentsState.daoId}] add components successfully`, body:daoComponentsState})
        //eventName: EventType, listener: Listener
      }).catch((error: Error) => {
        console.debug('Failed to Add body', error)
        throw error
      })
  }, [bodyState, registerContract, account, addTransaction, chainId, daoComponentsState])

  return [bodyState, addBody]
}