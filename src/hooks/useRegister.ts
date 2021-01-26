
import { NEVER_RELOAD, useSingleCallResult } from '../state/multicall/hooks';
import { useRegisterContract } from './useContract'
import { useActiveWeb3React } from './index'
import { useEffect, useCallback, useState , useMemo} from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { AppState, AppDispatch } from '../state'
import { RegisterState, DAO } from '../state/register/reducer';
import Register from '../pages/Register/index';
import { TransactionResponse } from '@ethersproject/providers'
import { calculateGasMargin } from '../utils'
import { BigNumber } from '@ethersproject/bignumber';
import { useTransactionAdder, useHasPendingApproval } from '../state/transactions/hooks'
//  export function useDAONameCheck(daoName: string): boolean{
//      const 
//      const [isDAOName, setIsDAOName] = useState(false)
//      const handleCheck = useCallback(()=>{
//         const registerContract = useRegisterContract()
//         const name = useSingleCallResult(registerContract,'name', [0])
//         console.log('Number 0 DAO name:', name)
//         if(name){
//             setIsDAOName(true) 
//         }
//      },[useRegisterContract,useSingleCallResult])

//      useEffect(()=>{
//         handleCheck
//      },[daoName,handleCheck])

//      return false
//   }

export function useDAONameCheck(daoName: string): boolean {

    const registerContract = useRegisterContract()
    const name = useSingleCallResult(registerContract, 'name', [2])
    console.log('useDAONameCheck hooks DAOname:', daoName)
    console.log('Number 0 DAO name:', name)
    if (name) {
        return true
    }
    return false
}

//转移到regesterCallback里了
export function useRegist() {
    const {chainId, account } = useActiveWeb3React()
    const registerState = useSelector<AppState, AppState['register']>((state: AppState) => { return state.register })
    const dispatch = useDispatch<AppDispatch>()
    const registerContract = useRegisterContract()
    const addTransaction = useTransactionAdder()

    const registHandel = useCallback(async (): Promise<void> => {
        if (!registerState.daoName || !registerState.tokenSymbol || !registerState.svg 
            || !account || !chainId) {
            return
        }

        const estimatedGas = 
        await registerContract?.estimateGas.register(registerState.daoName, registerState.tokenSymbol, registerState.svg,{value:1}).catch(() => {
            
            return registerContract?.estimateGas.register(registerState.daoName, registerState.tokenSymbol, registerState.svg,{value:1})
         })

        registerContract?.register(registerState.daoName, registerState.svg, registerState.tokenSymbol,{
           gasLimit: calculateGasMargin(estimatedGas as BigNumber),
            value: 1
          })
        .then((response: TransactionResponse) => { 
            console.log('useRegist response:', response)
            addTransaction(response,{summary:`${registerState.daoName} DAO was created`})
            //eventName: EventType, listener: Listener
        }).catch((error: Error) => {
            console.debug('Failed to registe DAO', error)
            throw error
          })
    }, [registerState, registerContract, account, addTransaction, chainId])
    return registHandel
}

export function useIsDAOCreated() {
    //const [isDAOCreated, setIsDAOCreated] = useState(false)
    const registerState = useSelector<AppState, AppState['register']>((state: AppState) => { return state.register })
    const registerContract = useRegisterContract()
    
    const daoId  = useSingleCallResult(registerContract,'nameToID',[registerState.daoName]).result
    console.log(`search DAOID by DAONAME: ${registerState.daoName} , DAOID: ${daoId}`)
   
    // TODO: 修改成新合约的返回值
    return false //daoId?.toString() === registerState.daoID
   // return isDAOCreated
}