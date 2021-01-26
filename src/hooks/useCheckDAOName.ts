import React, { useEffect ,useCallback} from 'react'
import { useRegisterContract } from './useContract'
import { useDispatch } from 'react-redux'
import { AppDispatch } from 'state'
import { setDAOName } from 'state/register/actions'
import { checkedDAOName } from '../state/register/actions';

export default function useCheckDAOName(){
    const dispatch = useDispatch<AppDispatch>()
    const registerContract = useRegisterContract()
    //const daoId = useSingleCallResult(registerContract, 'nameToId', [daoName]).result
    const checkName = useCallback((daoName):boolean =>{
        return registerContract?.nameToID(daoName).then((res: any)=>{
            console.log('nameToId:', res.toString())
            console.log('nameToId === 0 :', res.toString() === '0')
            console.log('nameToId hex:', res._hex.toString())
            if(res.toString() === '0'){
                console.log('inner res')
                dispatch(setDAOName({daoName}))
                dispatch(checkedDAOName())
                return true
            }
            return false
        })
    },[])
    return checkName
}
