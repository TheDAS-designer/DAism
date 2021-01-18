import { createReducer } from '@reduxjs/toolkit'
import { JSBI } from '@uniswap/sdk';
import {
  isShowIssuePanelAction,
  saveIssueDataAction
} from './actions'

export interface Member {
  address: string
  prestige: number
}

export interface daoIssueInterface {

  isShowIssuePanel?: boolean
  allocationProportion: number
  initialPrice: number
  decimal: number
  tokenName: string
  tokenSymbol: string
  totalSupply: string
}

const initialState: daoIssueInterface = {

  isShowIssuePanel: false,
  allocationProportion: 1,
  initialPrice: 1,
  decimal: 18,
  tokenName: '',
  tokenSymbol: '',
  totalSupply: ''

}


export default createReducer<daoIssueInterface>(initialState, builder =>
  builder
  .addCase(
    isShowIssuePanelAction,
    (state) => {
      return {
        ...state,
        isShowIssuePanel: true
      }
    }
  )
  .addCase(
    saveIssueDataAction,
    (state,{payload:{data}}) => {
      return {
        ...state,
        allocationProportion: data.allocationProportion,
        initialPrice: data.initialPrice,
        decimal: data.decimal,
        tokenName: data.tokenName,
        tokenSymbol: data.tokenSymbol,
        totalSupply: data.totalSupply
      }
    }
  )
)
