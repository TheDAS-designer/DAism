import { createReducer } from '@reduxjs/toolkit'
import { DateObject } from 'luxon';
import { setDAOName, setDAOID, setSvg, registerDAO } from './actions';
import Register from '../../pages/Register/index';

export interface RegisterState {
  readonly daoName: string
  readonly daoID: string
  readonly svg: string | null
  pendingDAOs?: PendingDAOs
}

export interface DAO {
  readonly daoName: string
  readonly svg: string
  readonly daoID: string
}
export type PendingDAOs = Array<DAO>

const initialState: RegisterState = {
  daoName: '',
  daoID: '',
  svg: ''
}

export default createReducer<RegisterState>(initialState, builder =>
  builder
    .addCase(
      setDAOName,
      (state,{ payload: {daoName} }) => {
        return {
          ...state,
         daoName
        }
      }
    )
    .addCase(setDAOID,(state, {payload: {daoID}}) => {
      return{
        ...state,
        daoID
      }
    })
    .addCase(setSvg, (state, {payload: {svg}}) =>  {
      return{...state ,svg}
    })
    .addCase(registerDAO,(state) => {
      if(!state.daoName || !state.daoID || !state.svg){
        return state
      }
      const dao : DAO = {daoName:state.daoName, svg: state.svg as string, daoID: state.daoID}
      // let daos : PendingDAOs
      // if(state.pendingDAOs && state.pendingDAOs.length > 0){
      //   daos = state.pendingDAOs
      // }else{
      //   state.pendingDAOs = [dao]
      // }
      return{
        ...state,
        pendingDAOs:[...state.pendingDAOs, dao]
      }
    })
)
