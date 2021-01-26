import { createAction } from '@reduxjs/toolkit'

export const setDAOName = createAction<{daoName: string }>('register/setDAOName')
export const setDAOID = createAction<{daoID: string}>('register/setDAOID')
export const setTokenSymbol = createAction<{tokenSymbol: string}>('register/setTokenSymbol')
export const setSvg = createAction<{svg: string | null}>('register/setSvg')
export const checkingDAOName = createAction<{isChecking:boolean}>('register/checkingDAOName')
export const checkedDAOName = createAction('register/checkedDAOName')
