import { createAction } from '@reduxjs/toolkit'
import { daoIssueInterface } from './reducer';



export const isShowIssuePanelAction = createAction('daoIssue/isShowIssuePanelAction')
export const saveIssueDataAction = createAction<{data:daoIssueInterface}>('daoIssue/saveIssueDataAction')