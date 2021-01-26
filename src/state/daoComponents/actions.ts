import { createAction } from '@reduxjs/toolkit'



export const showAddDaoComponentsPanelWithDaoNameAction = createAction<{daoName: string}>('daoComponents/showAddDaoComponentsPanelWithDaoNameAction')
export const daoFactoryChangeAction = createAction<{daoFactoryAddress: string}>('daoComponents/daoFactoryChangeAction')
export const daoFundChangeAction = createAction<{daoFundAddress: string}>('daoComponents/daoFundChangeAction')
export const addMemberAddressAction = createAction<{address: string}>('daoComponents/addMemberAddressAction')
export const memberPrestigeChangeAction = createAction<{address: string, prestigeAmount: number}>('daoComponents/memberPrestigeChangeAction')
export const memberDeleteAction = createAction<{address: string}>('daoComponents/memberDeleteAction')
export const inputErrorAction = createAction<{factoryError: boolean, fundError: boolean, memberError: boolean}>('daoComponents/inputErrorAction')
