import { createReducer } from '@reduxjs/toolkit'
import { DateObject } from 'luxon';
import { setDAOName, setSvg, setTokenSymbol, checkedDAOName, checkingDAOName,  } from './actions';

export interface RegisterState {
  daoName: string
  //daoID: string
  tokenSymbol: string
  svg: string | null
  checkedDAOName: boolean
 
  checkingDAOName: boolean
  
}

export interface DAO {
  daoName: string
  svg: string
  tokenSymbol: string
}

const initialState: RegisterState = {
  daoName: '',
  tokenSymbol: '',
  svg: '',
  
  checkingDAOName: false,
  
  checkedDAOName: false
}

export default createReducer<RegisterState>(initialState, builder =>
  builder
    .addCase(
      setDAOName,
      (state, { payload: { daoName } }) => {
        state.daoName = daoName
      }
    )
    // .addCase(setDAOID,(state, {payload: {daoID}}) => {
    //   return{
    //     ...state,
    //     daoID
    //   }
    // })
    .addCase(setTokenSymbol, (state, { payload: { tokenSymbol } }) => {
      state.tokenSymbol = tokenSymbol
    })
    .addCase(setSvg, (state, { payload: { svg } }) => {
      return { ...state, svg }
    })
    
    .addCase(checkedDAOName, (state) => {
      state.checkedDAOName = true
    })
    .addCase(checkingDAOName, (state, { payload: { isChecking } }) => {
      state.checkingDAOName = isChecking
    })

)
