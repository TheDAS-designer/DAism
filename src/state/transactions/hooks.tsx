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
import { daoIssueInterface } from 'state/daoIssue/reducer'

// helper that can take a ethers library transaction response and add it to the list of transactions
export function useTransactionAdder(): (
  response: TransactionResponse,
  customData?: { summary?: string; approval?: { tokenAddress: string; spender: string }; claim?: { recipient: string }; dao?: DAO; body?: daoComponentsInterface ; issue?: daoIssueInterface}
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
        body,
        issue
      }: { summary?: string; claim?: { recipient: string }; approval?: { tokenAddress: string; spender: string }; dao?: DAO; body?: daoComponentsInterface; issue?: daoIssueInterface } = {}
    ) => {
      if (!account) return
      if (!chainId) return

      const { hash } = response
      if (!hash) {
        throw Error('No transaction hash found.')
      }
      dispatch(addTransaction({ hash, from: account, chainId, approval, summary, claim, dao, body, issue }))
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
  },
    [allTransactions, dao]
  )

}

//useHasPendingIssue
export function useHasPendingAddBody(components: daoComponentsInterface | undefined): boolean[] {
  const allTransactions = useAllTransactions()
  //[pending, not_add， added]
  return useMemo(() => {
    //check format
    if (!components ||
      !components.daoFactoryAddress ||
      !components.daoFundAddress ||
      !components.daoMemebers ||
      components.daoMemebers.length === 0 ||
      !components.daoId
    ) return [false, true, false]

    let receiptTxs: Array<TransactionDetails> = []
    let pendingTxs: Array<TransactionDetails> = []
    Object.keys(allTransactions).forEach((txs) => {

      const t = allTransactions[txs]
      if (t.receipt) {
        receiptTxs.push(t)
      } else {
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

    if (receiptTxs.length > 0 && receiptTxs.some(a => a.body && a.body.daoId === components.daoId
      && a.body.daoFactoryAddress === components.daoFactoryAddress
      && a.body.daoFundAddress === components.daoFundAddress)) {

      return [false, false, true]
    }
    return [false, true, false]
  },
    [allTransactions, components]
  )

}



export function useHasPendingIssue(issueState: daoIssueInterface | undefined): boolean[] {
  const allTransactions = useAllTransactions()
  //[pending, not_issue， issued]
  return useMemo(() => {
    //check format
    if (!issueState ||
      !issueState.allocationProportion ||
      !issueState.decimal ||
      !issueState.initialPrice ||
      !issueState.tokenName ||
      !issueState.tokenSymbol ||
      !issueState.totalSupply
    ) return [false, true, false]

    const receiptTxs: Array<TransactionDetails> = []
    const pendingTxs: Array<TransactionDetails> = []
    Object.keys(allTransactions).forEach((txs) => {

      const t = allTransactions[txs]
      if (t.receipt) {
        receiptTxs.push(t)
      } else {
        pendingTxs.push(t)
      }
    })

    if (pendingTxs.length > 0
      && pendingTxs.some(
        a => a.issue && a.issue.allocationProportion === issueState.allocationProportion
          && a.issue.decimal === issueState.decimal
          && a.issue.initialPrice === issueState.initialPrice
          && a.issue.tokenName === issueState.tokenName
          && a.issue.tokenSymbol === issueState.tokenSymbol
          && a.issue.totalSupply === issueState.totalSupply
          && isTransactionRecent(a))) {

      return [true, false, false]

    }

    if (receiptTxs.length > 0 && receiptTxs.some(a =>
      a.issue && a.issue.allocationProportion === issueState.allocationProportion
      && a.issue.decimal === issueState.decimal
      && a.issue.initialPrice === issueState.initialPrice
      && a.issue.tokenName === issueState.tokenName
      && a.issue.tokenSymbol === issueState.tokenSymbol
      && a.issue.totalSupply === issueState.totalSupply)) {

      return [false, false, true]
    }
    return [false, true, false]
  },
    [allTransactions, issueState]
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
