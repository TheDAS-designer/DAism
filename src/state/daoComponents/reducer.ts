import { createReducer } from '@reduxjs/toolkit'
import { DateObject } from 'luxon';
import {
  showAddDaoComponentsPanelWithDaoIDAction,
  daoFactoryChangeAction
  , daoFundChangeAction
  , addMemberAddressAction
  , memberPrestigeChangeAction
  , memberDeleteAction
  ,inputErrorAction
} from './actions'

export interface Member {
  address: string
  prestige: number
}

export interface daoComponentsInterface {
  daoId: string
  showAddDaoComponentsPanel: boolean
  daoFactoryAddress: string
  daoFundAddress: string
  daoMemebers: Array<Member>
  inputError: {factoryError: boolean, fundError: boolean, memberError: boolean}
}

const initialState: daoComponentsInterface = {
  daoId:'',
  showAddDaoComponentsPanel: false,
  daoFactoryAddress: '',
  daoFundAddress: '',
  daoMemebers: [],
  inputError: {factoryError: false, fundError: false, memberError: false}

}


export default createReducer<daoComponentsInterface>(initialState, builder =>
  builder
    .addCase(
      showAddDaoComponentsPanelWithDaoIDAction,
      (state, {payload:{daoId}}) => {
        return {
          ...state,
          showAddDaoComponentsPanel: true,
          daoId
        }
      }
    )
    .addCase(daoFactoryChangeAction, (state, { payload: { daoFactoryAddress } }) => {
      return {
        ...state,
        daoFactoryAddress,
        inputError: {...state.inputError, factoryError: false}
      }
    })
    .addCase(daoFundChangeAction, (state, { payload: { daoFundAddress } }) => {
      return {
        ...state,
        daoFundAddress,
        inputError: {...state.inputError, fundError: false}
      }
    })
    .addCase(addMemberAddressAction, (state, { payload: { address } }) => {
      const exists = state.daoMemebers.filter(m => m.address === address);
      if (exists && exists.length > 0) return
      const newMember: Member = { address, prestige: 0 }
      state.daoMemebers.push(newMember)
      state.inputError = {...state.inputError, memberError: false}
    })
    .addCase(memberPrestigeChangeAction, (state, { payload: { address, prestigeAmount } }) => {
      const newMembers = state.daoMemebers.map(m => {
        if (m.address === address) {
          // const newMember: Member = {address, prestige: prestigeAmmount}
          m.prestige = prestigeAmount
        }
        return m
      })

    })
    .addCase(memberDeleteAction, (state, { payload: { address } }) => {
      const newMembers = state.daoMemebers.filter(m => m.address !== address)
      return {
        ...state,
        daoMemebers:newMembers
      }
      //state.daoMemebers.filter(m => m.address !== address)
    })
    .addCase(inputErrorAction, (state, { payload: error }) => {
      return {
        ...state,
        inputError: error
      }
    })
)
