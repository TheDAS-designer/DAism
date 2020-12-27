import { TransactionResponse } from '@ethersproject/providers'
import { useCallback, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { get, groupBy, reject, maxBy, minBy, chain, zip, sortBy } from 'lodash'
import { useActiveWeb3React } from '../../hooks'
import { AppDispatch, AppState } from '../index'
import { addTransaction } from './actions'
import { TransactionDetails } from './reducer'
import { DAO } from '../register/reducer';
import { Type } from 'react-feather'
import { group } from 'console'
import { daoComponentsInterface } from '../daoComponents/reducer';

// helper that can take a ethers library transaction response and add it to the list of transactions
export function useTransactionAdder(): (
  response: TransactionResponse,
  customData?: { summary?: string; approval?: { tokenAddress: string; spender: string }; claim?: { recipient: string }; dao?: DAO ; body?:daoComponentsInterface }
) => void {
  const { chainId, account } = useActiveWeb3React()
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(
    (
      response: TransactionResponse,
      {
        summary,
        approval,
        claim,
        dao,
        body
      }: { summary?: string; claim?: { recipient: string }; approval?: { tokenAddress: string; spender: string }; dao?: DAO ; body?:daoComponentsInterface } = {}
    ) => {
      if (!account) return
      if (!chainId) return

      const { hash } = response
      if (!hash) {
        throw Error('No transaction hash found.')
      }
      dispatch(addTransaction({ hash, from: account, chainId, approval, summary, claim, dao, body }))
    },
    [dispatch, chainId, account]
  )
}

// returns all the transactions for the current chain
export function useAllTransactions(): { [txHash: string]: TransactionDetails } {
  const { chainId } = useActiveWeb3React()

  const state = useSelector<AppState, AppState['transactions']>(state => state.transactions)

  return chainId ? state[chainId] ?? {} : {}
}

export function useIsTransactionPending(transactionHash?: string): boolean {
  const transactions = useAllTransactions()

  if (!transactionHash || !transactions[transactionHash]) return false

  return !transactions[transactionHash].receipt
}

/**
 * Returns whether a transaction happened in the last day (86400 seconds * 1000 milliseconds / second)
 * @param tx to check for recency
 */
export function isTransactionRecent(tx: TransactionDetails): boolean {
  return new Date().getTime() - tx.addedTime < 86_400_000
}

// returns whether a token has a pending approval transaction
export function useHasPendingApproval(tokenAddress: string | undefined, spender: string | undefined): boolean {
  const allTransactions = useAllTransactions()
  return useMemo(
    () =>
      typeof tokenAddress === 'string' &&
      typeof spender === 'string' &&
      Object.keys(allTransactions).some(hash => {
        const tx = allTransactions[hash]
        if (!tx) return false
        if (tx.receipt) {
          return false
        } else {
          const approval = tx.approval
          if (!approval) return false
          return approval.spender === spender && approval.tokenAddress === tokenAddress && isTransactionRecent(tx)
        }
      }),
    [allTransactions, spender, tokenAddress]
  )
}

// returns whether a token has a pending approval transaction
export function useHasPendingRegister(dao: DAO | undefined): boolean[] {
  //[pending, not_registered， registered]
  //const [rState, setRState] = useState([false, true, false])
  const allTransactions = useAllTransactions()

  return useMemo(() => {
    //check format
    if (!dao ||
      !dao.daoName ||
      !dao.daoID ||
      !dao.svg) return [false, true, false]

    const txs = Object.keys(allTransactions).filter(tx => !!tx)

    // 将txs根据是否有receipt分成两组
    let groupByTxs = chain(allTransactions)
      .groupBy((tx) => { return tx.receipt })
      .map((value, key) => ({ hasReceipt: key === 'undefined' ? false : true, txs: value }))
      .value();

    groupByTxs = sortBy(groupByTxs, (a) => !a.hasReceipt)
    console.log("result:", groupByTxs)
    const receiptTxs = groupByTxs[0]
    const pendingTxs = groupByTxs[1]
    if (pendingTxs && pendingTxs.txs && pendingTxs.txs.length > 0
      && pendingTxs.txs.some(a => a.dao && a.dao.daoName === dao.daoName && a.dao.daoID === dao.daoID
        && isTransactionRecent(a))) {

      return [true, false, false]

    }

    if (receiptTxs && receiptTxs.txs && receiptTxs.txs.length > 0 && receiptTxs.txs.some(a => a.dao && a.dao.daoName === dao.daoName && a.dao.daoID === dao.daoID)) {
      
      return [false, false, true]
    }
    return [false, true, false]

    // for (let i = 0; i < txs.length; i++) {
    //   let hash = txs[i]
    //   const tx = allTransactions[hash]
    //   console.log(' const tx = allTransactions[hash] :', tx)
    //   console.log('dao:', dao)
    //   if (!tx) {
    //     continue
    //   }
    //   if (tx.receipt) {
    //     //已经请求成功且是要检查的dao
    //     if (tx.dao && tx.dao.daoID === dao.daoID && tx.dao.daoName === dao.daoName) {
    //       setRState([false, false, true])
    //       console.log('已经请求成功且是要检查的dao setRState([false, false, true]')
    //       return
    //     } else {
    //       continue
    //     }
    //   } else {//是要检查的dao但是还未请求设置为pending状态
    //     const _dao = tx.dao
    //     if (!_dao) {
    //       continue
    //     }
    //     if (_dao.daoName === dao.daoName && _dao.daoID === dao.daoID, _dao.svg === dao.svg && isTransactionRecent(tx)) {
    //       setRState([true, false, false])
    //       console.log('是要检查的dao但是还未请求设置为pending状态 , setRState([true, false, false])')
    //       return
    //     }
    //   }
    // }
  },
    [allTransactions, dao]
  )

}


export function useHasPendingAddBody(components: daoComponentsInterface | undefined): boolean[] {
  //[pending, not_addBody， added]
  //const [rState, setRState] = useState([false, true, false])
  const allTransactions = useAllTransactions()

  return useMemo(() => {
    //check format
    if (!components ||
      !components.daoFactoryAddress ||
      !components.daoFundAddress||
      !components.daoMemebers||
      components.daoMemebers.length === 0 ||
      !components.daoId
      ) return [false, true, false]

  

    // // 将txs根据是否有receipt分成两组
    // let groupByTxs = chain(allTransactions)
    //   .groupBy((tx) => { return tx.receipt })
    //   .map((value, key) => ({ hasReceipt: key === 'undefined' ? false : true, txs: value }))
    //   .value();
    
    // groupByTxs = sortBy(groupByTxs, (a) => !a.hasReceipt) //经过排序后groupByTxs[0]一定是有接收的
    // console.log("result:", groupByTxs)
    // const receiptTxs = groupByTxs[0]
    // const pendingTxs = groupByTxs[1]
    let receiptTxs: Array<TransactionDetails> = [] 
    let pendingTxs:Array<TransactionDetails> = []
    Object.keys(allTransactions).forEach((txs)=>{
      
      const t = allTransactions[txs]
      if(t.receipt){
        receiptTxs.push(t)
      }else{
        pendingTxs.push(t)
      }
    })



    if (pendingTxs.length > 0
      && pendingTxs.some(
        a => a.body && a.body.daoId === components.daoId  
        && a.body.daoFactoryAddress === components.daoFactoryAddress 
        && a.body.daoFundAddress === components.daoFundAddress
        && isTransactionRecent(a))) {

      return [true, false, false]

    }

    if ( receiptTxs.length > 0 && receiptTxs.some( a => a.body && a.body.daoId === components.daoId  
      && a.body.daoFactoryAddress === components.daoFactoryAddress 
      && a.body.daoFundAddress === components.daoFundAddress)) {
      
      return [false, false, true]
    }
    return [false, true, false]
  },
    [allTransactions, components]
  )

}



// watch for submissions to claim
// return null if not done loading, return undefined if not found
export function useUserHasSubmittedClaim(
  account?: string
): { claimSubmitted: boolean; claimTxn: TransactionDetails | undefined } {
  const allTransactions = useAllTransactions()

  // get the txn if it has been submitted
  const claimTxn = useMemo(() => {
    const txnIndex = Object.keys(allTransactions).find(hash => {
      const tx = allTransactions[hash]
      return tx.claim && tx.claim.recipient === account
    })
    return txnIndex && allTransactions[txnIndex] ? allTransactions[txnIndex] : undefined
  }, [account, allTransactions])

  return { claimSubmitted: Boolean(claimTxn), claimTxn }
}
