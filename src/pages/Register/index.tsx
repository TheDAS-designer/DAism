import { CurrencyAmount, JSBI, Token, Trade } from '@uniswap/sdk'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ArrowDown } from 'react-feather'
import ReactGA from 'react-ga'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import FactoryAddressInputPanel from '../../components/daoFactoryAddressInputPanel'
import DfAddressInputPanel from '../../components/dfAddressInputPanel'
import MemberAddressInputPanel from '../../components/memberAddressInputPanel'
import { ButtonError, ButtonLight, ButtonPrimary, ButtonConfirmed } from '../../components/Button'
import Card, { GreyCard } from '../../components/Card'
import Column, { AutoColumn } from '../../components/Column'
import DAONameInputPanel from '../../components/DAONameInputPanel'
import TokenSymbolInputPanel from '../../components/TokenSymbolInputPanel'
import SVGInputPanel from '../../components/SVGInputPanel'
import { SwapPoolTabs } from '../../components/NavigationTabs'
import { AutoRow, RowBetween } from '../../components/Row'
import AdvancedSwapDetailsDropdown from '../../components/swap/AdvancedSwapDetailsDropdown'
import BetterTradeLink, { DefaultVersionLink } from '../../components/swap/BetterTradeLink'
import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee'
import { ArrowWrapper, BottomGrouping, SwapCallbackError, Wrapper } from '../../components/swap/styleds'
import TradePrice from '../../components/swap/TradePrice'
import TokenWarningModal from '../../components/TokenWarningModal'
import ProgressSteps from '../../components/ProgressSteps'

import { BETTER_TRADE_LINK_THRESHOLD, INITIAL_ALLOWED_SLIPPAGE } from '../../constants'
import { getTradeVersion, isTradeBetter } from '../../data/V1'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import useCheckDAOName from '../../hooks/useCheckDAOName'
//import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import { RegistState, useRegisterCallbackFromDAO, BodyState, useAddBodyCallback, useIssueCallback, IssueState } from '../../hooks/useRegisterCallback';
import useENSAddress from '../../hooks/useENSAddress'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import useToggledVersion, { DEFAULT_VERSION, Version } from '../../hooks/useToggledVersion'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { useToggleSettingsMenu, useWalletModalToggle } from '../../state/application/hooks'
import { useRegisterActionHandlers, useRegisterState } from '../../state/register/hooks'
import { useDaoComponentsActionHandlers, useDaoComponentsState } from '../../state/daoComponents/hooks';
import { useDaoIssueActionHandlers, useDaoIssueState } from '../../state/daoIssue/hooks';
import { useRegist } from '../../hooks/useRegister'
import { Field } from '../../state/swap/actions'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState
} from '../../state/swap/hooks'
import { useExpertModeManager, useUserSlippageTolerance } from '../../state/user/hooks'
import { LinkStyledButton, TYPE } from '../../theme'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import AppBody from '../AppBody'
import { ClickableText } from '../Pool/styleds'
import Loader from '../../components/Loader'
import { ButtonAddComp } from '../../components/Button/index';
import useDebounce from 'hooks/useDebounce'
import IssuePannel from 'components/IssuePanel'
import RegisterPanel from 'components/RegisterPanel'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useForm } from 'react-hook-form'
import { isShowIssuePanelAction } from '../../state/daoIssue/actions';


export default function Register() {
  const loadedUrlParams = useDefaultsFromURLSearch()

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId)
  ]
  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)
  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c instanceof Token) ?? [],
    [loadedInputCurrency, loadedOutputCurrency]
  )
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
  }, [])

  const { account } = useActiveWeb3React()
  const theme = useContext(ThemeContext)

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  // for expert mode
  const toggleSettings = useToggleSettingsMenu()
  const [isExpertMode] = useExpertModeManager()

  // get custom setting values for user
  const [allowedSlippage] = useUserSlippageTolerance()

  // swap state
  const { independentField, typedValue, recipient } = useSwapState()
  const {
    v1Trade,
    v2Trade,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError
  } = useDerivedSwapInfo()
  const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
    currencies[Field.INPUT],
    currencies[Field.OUTPUT],
    typedValue
  )
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const { address: recipientAddress } = useENSAddress(recipient)
  const toggledVersion = useToggledVersion()
  const tradesByVersion = {
    [Version.v1]: v1Trade,
    [Version.v2]: v2Trade
  }
  const trade = showWrap ? undefined : tradesByVersion[toggledVersion]
  const defaultTrade = showWrap ? undefined : tradesByVersion[DEFAULT_VERSION]

  const betterTradeLinkVersion: Version | undefined =
    toggledVersion === Version.v2 && isTradeBetter(v2Trade, v1Trade, BETTER_TRADE_LINK_THRESHOLD)
      ? Version.v1
      : toggledVersion === Version.v1 && isTradeBetter(v1Trade, v2Trade)
        ? Version.v2
        : undefined

  const parsedAmounts = showWrap
    ? {
      [Field.INPUT]: parsedAmount,
      [Field.OUTPUT]: parsedAmount
    }
    : {
      [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
      [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount
    }

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()
  const isValid = !swapInputError
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT


  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )
  const [isChecking, setIschecking] = useState(false)
 
  // register hooks
  const { onTokenSymbolChange, onSvgChange } = useRegisterActionHandlers()
  const checkName = useCheckDAOName()
 

  const handleTokenSymbolInput = useCallback(
    (tokenSymbol: string) => {
      onTokenSymbolChange(tokenSymbol)
    }, [onTokenSymbolChange])

  const handleSvgInput = useCallback(
    (svg: string) => {
      onSvgChange(svg)
    }, [onSvgChange])


  const { daoName, tokenSymbol, svg: svg, checkingDAOName, checkedDAOName } = useRegisterState()
  const { daoFactoryAddress, daoFundAddress, daoMemebers } = useDaoComponentsState()
  const [bodyState, addBody] = useAddBodyCallback()


  const schema = yup.object().shape({
    allocationProportion: yup.string().matches(/^[0-9]*$/, 'Proportion must be a number').required('Required!'),//new Percent(JSBI.BigInt(1), JSBI.BigInt(100)),
    initialPrice: yup.string().matches(/^[0-9]*$/, 'initialPrice must be a number').required('Required!'),
    decimal: yup.string().matches(/^[0-9]*$/, 'decimal must be a number').required('Required!'),
    tokenName: yup.string().required('Required!'),
    tokenSymbol: yup.string().required('Required!'),
    totalSupply: yup.string().matches(/^[0-9]*$/, 'totalSupply must be a number').required('Required!')
  })

  // react-hook-form tools
  const { register, handleSubmit, control, errors, watch } = useForm({
    resolver: yupResolver(schema),
    mode: 'onBlur'
  })

  const [IssueState, issue] = useIssueCallback()
  const { onShowDaoComponentsPanel, isShowDaoComponentsState, onAddDaoFactory, daoFactoryState, onAddDaoFund, onAddDaoMemberAddress } = useDaoComponentsActionHandlers()
  const { onClickShowIssuePanel, saveIssueData } = useDaoIssueActionHandlers()


  const onSubmit = (data: any) => {
    console.log(data)
    if (!saveIssueData(data)) return
    issue(data)
  }

  const showIssue = useDaoIssueState().isShowIssuePanel
  const handleShowAddDaoComponentsPanel = useCallback(
    () => {

      if (isShowDaoComponentsState) { //是否为dao组件流程
        if (bodyState === BodyState.ADDED) {
          //添加dao组件成功则显示issue表单
          onClickShowIssuePanel()

        } else {
          console.log('isShowDaoComponentsState :', isShowDaoComponentsState)
          addBody()
        }
      }
      else {//false时代表第一次点击此按钮为了打开输入框

        onShowDaoComponentsPanel(daoName)
      }

    }, [onShowDaoComponentsPanel, isShowDaoComponentsState, daoName, daoFactoryAddress, daoFundAddress, daoMemebers, bodyState, showIssue])

  const handleAddDaoFactoryInput = useCallback((address: string): boolean => {
    return onAddDaoFactory(address)
  }, [onAddDaoFactory])

  const handleAddDaoFundInput = useCallback((address: string): boolean => {
    return onAddDaoFund(address)
  }, [onAddDaoFund])

  //  const handleMemberAddressInput = useCallback((address:string): boolean=> {
  //   return onAddDaoMemberAddress(address)
  //  }, [onAddDaoMemberAddress])

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean
    tradeToConfirm: Trade | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined
  })

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? ''
  }

  const route = trade?.route
  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )
  const noRoute = !route

  // check whether the user has approved the router on the input token
  const [registerStateMemo, registering] = useRegisterCallbackFromDAO()


  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (registerStateMemo === RegistState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [registerStateMemo, approvalSubmitted])

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(trade, allowedSlippage, recipient)

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)
  const [{ daoNameChecked, tokenSymbolChecked, svgChecked }, setInputCheck] = useState<
    {
      daoNameChecked: boolean,
      tokenSymbolChecked: boolean,
      svgChecked: boolean
    }>({
      daoNameChecked: false,
      tokenSymbolChecked: false,
      svgChecked: false
    })
  
  
  useEffect(() => {
    let nameChecked = false, symbolChecked = false, svgChecked = false
    if (daoName && checkedDAOName) {
      nameChecked = true
      setIschecking(false) 
    }

    if (tokenSymbol) {
      symbolChecked = true 
    }
    if (svg) {
      svgChecked = true
    }

    setInputCheck({ daoNameChecked: nameChecked, tokenSymbolChecked: symbolChecked, svgChecked: svgChecked })
  }, [daoName, tokenSymbol, svg, checkedDAOName])

  const [registerButtonActive, setRegisterButtonActive] = useState<boolean>(daoNameChecked && tokenSymbolChecked && svgChecked)
  useEffect(() => {
    setRegisterButtonActive(daoNameChecked && tokenSymbolChecked && svgChecked)
  }, [daoNameChecked, tokenSymbolChecked, svgChecked, setInputCheck])

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    registerButtonActive &&
    (registerStateMemo === RegistState.NOT_REGISTERD ||
      registerStateMemo === RegistState.PENDING ||
      (approvalSubmitted && registerStateMemo === RegistState.REGISTERD))
  return (
    <>
      <TokenWarningModal
        isOpen={urlLoadedTokens.length > 0 && !dismissTokenWarning}
        tokens={urlLoadedTokens}
        onConfirm={handleConfirmTokenWarning}
      />
      <AppBody>
        <SwapPoolTabs active={'swap'} />
        <Wrapper id="swap-page">
          <AutoColumn gap={'md'}>
            {/* <RegisterPanel register={register} handleSubmit={handleSubmit} control={control} errors={errors} watch={watch} ></RegisterPanel> */}
            <DAONameInputPanel
              label={'DAO/Token Name:'}
              onUserInput={checkName}
              id="register-dao-name"
              disabled={registerStateMemo === RegistState.REGISTERD || registerStateMemo === RegistState.PENDING}
            />
            <TokenSymbolInputPanel
              label={'Token Symbol:'}
              onUserInput={handleTokenSymbolInput}
              id="register-token-symbol"
              disabled={registerStateMemo === RegistState.REGISTERD || registerStateMemo === RegistState.PENDING}
            />
            <SVGInputPanel
              label={'Svg icon:'}
              onUserInput={handleSvgInput}
              id="register-dao-svg"
              disabled={registerStateMemo === RegistState.REGISTERD || registerStateMemo === RegistState.PENDING}
            />
            <AutoColumn justify="space-between" displayThis={registerStateMemo === RegistState.REGISTERD && isShowDaoComponentsState}>
              <AutoRow justify={isExpertMode ? 'space-between' : 'center'} style={{ padding: '0 1rem' }}>
                <ArrowWrapper clickable>
                  <ArrowDown
                    size="25"
                    onClick={() => {
                      console.log('awwww')
                    }}
                    color={currencies[Field.INPUT] && currencies[Field.OUTPUT] ? theme.primary1 : theme.text2}
                  />
                </ArrowWrapper>
                {
                  //recipient === null && !showWrap && isExpertMode ? (
                  true ? (
                    <LinkStyledButton id="add-recipient-button" onClick={() => onChangeRecipient('')}>
                      + Add a send (optional)
                    </LinkStyledButton>
                  ) : null}
              </AutoRow>
            </AutoColumn>
            {!showIssue ?
              (<><FactoryAddressInputPanel id="factoryPanel" onChange={handleAddDaoFactoryInput} displayThis={registerStateMemo === RegistState.REGISTERD && isShowDaoComponentsState} />
                <DfAddressInputPanel id="dfPanel" onChange={handleAddDaoFundInput} displayThis={registerStateMemo === RegistState.REGISTERD && isShowDaoComponentsState} />
                <MemberAddressInputPanel id="memberPanel" displayThis={registerStateMemo === RegistState.REGISTERD && isShowDaoComponentsState} /> </>)
              : (<IssuePannel register={register} handleSubmit={handleSubmit} control={control} errors={errors} watch={watch} ></IssuePannel>)}
          </AutoColumn>
          <BottomGrouping>
            {
              //!!account && registerButtonActive ?
              !!account && showApproveFlow ?
                <RowBetween>
                  <ButtonConfirmed
                    onClick={registering}
                    disabled={registerStateMemo !== RegistState.NOT_REGISTERD || approvalSubmitted}
                    width="48%"
                    altDisabledStyle={registerStateMemo === RegistState.PENDING} // show solid button while waiting
                    //altDisabledStyle={true} // show solid button while waiting
                    confirmed={registerStateMemo === RegistState.REGISTERD}
                  //confirmed={true}
                  >
                    {
                      registerStateMemo === RegistState.PENDING || checkingDAOName ? (
                        //true ? (
                        <AutoRow gap="6px" justify="center">
                          Registering <Loader stroke="white" />
                        </AutoRow>
                      ) : approvalSubmitted && registerStateMemo === RegistState.REGISTERD ? (
                        // ) : false? (
                        'Done!'
                      ) : (
                            `Register`
                          )}
                  </ButtonConfirmed>
                  {!showIssue ? (<ButtonAddComp
                    onClick={handleShowAddDaoComponentsPanel}
                    width="48%"
                    id="next-button"
                    disabled={
                      registerStateMemo !== RegistState.REGISTERD ||
                        isShowDaoComponentsState ?
                        (bodyState === BodyState.UNCHECK ||
                          bodyState === BodyState.PENDING ||
                          bodyState === BodyState.ERROR ||
                          bodyState === BodyState.UNKNOWN)
                        : false

                    }
                    //error={registerStateMemo !== RegistState.REGISTERD}
                    registeredAndNoShowComponents={(registerStateMemo === RegistState.REGISTERD && !isShowDaoComponentsState) || (bodyState === BodyState.NOT_ADD)}
                    confirmed={registerStateMemo === RegistState.REGISTERD && bodyState === BodyState.ADDED}
                  >
                    <Text fontSize={16} fontWeight={500}>
                      {bodyState === BodyState.PENDING ? (
                        //true ? (
                        <AutoRow gap="6px" justify="center">
                          Waiting <Loader stroke="white" />
                        </AutoRow>) : bodyState === BodyState.ADDED ? 'Issue token?' : 'Add Components'}
                    </Text>
                  </ButtonAddComp>)
                    :
                    (<ButtonAddComp onClick={handleSubmit(onSubmit)} id="next-button" width="48%" confirmed={false}>
                      <Text fontSize={16} fontWeight={500}>
                        {/* {bodyState === BodyState.PENDING ? (
                        //true ? (
                        <AutoRow gap="6px" justify="center">
                          Waiting <Loader stroke="white" />
                        </AutoRow>) : bodyState === BodyState.ADDED ? 'Issue token?' : 'Add Components'} */}
                        Issue
                    </Text>

                    </ButtonAddComp>)}
                </RowBetween>
                :
                <ButtonError
                  id="register-button"
                  disabled={!registerButtonActive}
                // error={isValid && priceImpactSeverity > 2 && !swapCallbackError}
                >
                  <Text fontSize={20} fontWeight={500}>
                    {/* 如果输入的dao已经存，此按钮显示为修改dao信息 */}
                    {!!account ? (!daoNameChecked ? 'Required DAO name' : !tokenSymbolChecked ? 'Required Token Symbol' : !svgChecked ? 'Required svg pic' : 'Required unlock wallet')
                      : 'Required unlock wallet'}
                  </Text>
                </ButtonError>

            }
            {showApproveFlow && (
              <Column style={{ marginTop: '1rem' }}>
                <ProgressSteps steps={[registerStateMemo === RegistState.REGISTERD, bodyState === BodyState.ADDED]} />
              </Column>
            )}
            {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
            {betterTradeLinkVersion ? (
              <BetterTradeLink version={betterTradeLinkVersion} />
            ) : toggledVersion !== DEFAULT_VERSION && defaultTrade ? (
              <DefaultVersionLink />
            ) : null}
          </BottomGrouping>
        </Wrapper>
      </AppBody>
      <AdvancedSwapDetailsDropdown trade={trade} />
    </>
  )
}
