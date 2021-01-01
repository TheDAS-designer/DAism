import { CurrencyAmount, JSBI, Token, Trade } from '@uniswap/sdk'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ArrowDown } from 'react-feather'
import ReactGA from 'react-ga'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import AddressInputPanel from '../../components/AddressInputPanel'
import FactoryAddressInputPanel from '../../components/daoFactoryAddressInputPanel'
import DfAddressInputPanel from '../../components/dfAddressInputPanel'
import MemberAddressInputPanel from '../../components/memberAddressInputPanel'
import { ButtonError, ButtonLight, ButtonPrimary, ButtonConfirmed } from '../../components/Button'
import Card, { GreyCard } from '../../components/Card'
import Column, { AutoColumn } from '../../components/Column'
import ConfirmSwapModal from '../../components/swap/ConfirmSwapModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import DAONameInputPanel from '../../components/DAONameInputPanel'
import IDInputPanel from '../../components/IDInputPanel'
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
//import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import { RegistState, useRegisterCallbackFromDAO, BodyState, useAddBodyCallback } from '../../hooks/useRegisterCallback'
import useENSAddress from '../../hooks/useENSAddress'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import useToggledVersion, { DEFAULT_VERSION, Version } from '../../hooks/useToggledVersion'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { useToggleSettingsMenu, useWalletModalToggle } from '../../state/application/hooks'
import { useRegisterActionHandlers, useRegisterState } from '../../state/register/hooks'
import { useDaoComponentsActionHandlers, useDaoComponentsState } from '../../state/daoComponents/hooks';
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
  // register hooks
  const { onDAONameChange, onDAOIDChange, onSvgChange } = useRegisterActionHandlers()
  const handleDaoNameInput = useCallback(
    (daoName: string) => {
      onDAONameChange(daoName)
    }, [onDAONameChange])

  const handleDAOIDInput = useCallback(
    (daoId: string) => {
      onDAOIDChange(daoId)
    }, [onDAOIDChange])

  const handleSvgInput = useCallback(
    (svg: string) => {
      onSvgChange(svg)
    }, [onSvgChange])


  const { daoName, daoID, svg: svg } = useRegisterState()
  const { daoFactoryAddress, daoFundAddress , daoMemebers} = useDaoComponentsState()
  const [bodyState, addBody] = useAddBodyCallback()

  const { onShowDaoComponentsPanel, isShowDaoComponentsState, onAddDaoFactory, daoFactoryState, onAddDaoFund, onAddDaoMemberAddress } = useDaoComponentsActionHandlers()
  const handleShowAddDaoComponentsPanel = useCallback(
    () => {

      if (isShowDaoComponentsState) { //如果已经打开则触发提交方法
        if(bodyState === BodyState.ADDED) return
        console.log('isShowDaoComponentsState :', isShowDaoComponentsState)
        addBody()
      } else {

        onShowDaoComponentsPanel(daoID)
      }

    }, [onShowDaoComponentsPanel, isShowDaoComponentsState, daoID, daoFactoryAddress, daoFundAddress , daoMemebers, bodyState ])

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

  const handleSwap = useCallback(() => {
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
      return
    }
    if (!swapCallback) {
      return
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: undefined })
    swapCallback()
      .then(hash => {
        setSwapState({ attemptingTxn: false, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: hash })

        ReactGA.event({
          category: 'Swap',
          action:
            recipient === null
              ? 'Swap w/o Send'
              : (recipientAddress ?? recipient) === account
                ? 'Swap w/o Send + recipient'
                : 'Swap w/ Send',
          label: [
            trade?.inputAmount?.currency?.symbol,
            trade?.outputAmount?.currency?.symbol,
            getTradeVersion(trade)
          ].join('/')
        })
      })
      .catch(error => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined
        })
      })
  }, [tradeToConfirm, account, priceImpactWithoutFee, recipient, recipientAddress, showConfirm, swapCallback, trade])

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)

  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)



  const [{ daoNameChecked, daoIDChecked, svgChecked }, setInputCheck] = useState<
    {
      daoNameChecked: boolean,
      daoIDChecked: boolean,
      svgChecked: boolean
    }>({
      daoNameChecked: false,
      daoIDChecked: false,
      svgChecked: false
    })




  useMemo(() => {
    let nameChecked = false, idChecked = false, svgChecked = false
    if (daoName) {
      nameChecked = true
    }

    if (daoID) {
      idChecked = true
    }
    if (svg) {
      svgChecked = true
    }

    setInputCheck({ daoNameChecked: nameChecked, daoIDChecked: idChecked, svgChecked: svgChecked })
  }, [daoName, daoID, svg])

  const [registerButtonActive, setRegisterButtonActive] = useState<boolean>(daoNameChecked && daoIDChecked && svgChecked)
  useMemo(() => {
    setRegisterButtonActive(daoNameChecked && daoIDChecked && svgChecked)
  }, [daoNameChecked, daoIDChecked, svgChecked, setInputCheck])

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    registerButtonActive &&
    (registerStateMemo === RegistState.NOT_REGISTERD ||
      registerStateMemo === RegistState.PENDING ||
      (approvalSubmitted && registerStateMemo === RegistState.REGISTERD))
  // &&!(priceImpactSeverity > 3 && !isExpertMode)




  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn, showConfirm })
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash])

  const handleInputSelect = useCallback(
    inputCurrency => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection]
  )

  const handleMaxInput = useCallback(() => {
    maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])

  const handleOutputSelect = useCallback(outputCurrency => onCurrencySelection(Field.OUTPUT, outputCurrency), [
    onCurrencySelection
  ])

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
          <ConfirmSwapModal
            isOpen={showConfirm}
            trade={trade}
            originalTrade={tradeToConfirm}
            onAcceptChanges={handleAcceptChanges}
            attemptingTxn={attemptingTxn}
            txHash={txHash}
            recipient={recipient}
            allowedSlippage={allowedSlippage}
            onConfirm={handleSwap}
            swapErrorMessage={swapErrorMessage}
            onDismiss={handleConfirmDismiss}
          />

          <AutoColumn gap={'md'}>
            <DAONameInputPanel
              label={'DAO Name:'}
              onUserInput={handleDaoNameInput}
              id="register-dao-name"
              disabled={registerStateMemo === RegistState.REGISTERD || registerStateMemo === RegistState.PENDING}
            />
            <IDInputPanel
              label={'ID:'}
              onUserInput={handleDAOIDInput}
              id="register-dao-id"
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

            <FactoryAddressInputPanel id="factoryPanel" onChange={handleAddDaoFactoryInput} displayThis={registerStateMemo === RegistState.REGISTERD && isShowDaoComponentsState}/>
            <DfAddressInputPanel id="dfPanel" onChange={handleAddDaoFundInput} displayThis={registerStateMemo === RegistState.REGISTERD && isShowDaoComponentsState}/>
            <MemberAddressInputPanel id="memberPanel" displayThis={registerStateMemo === RegistState.REGISTERD && isShowDaoComponentsState}/>

            {/* <LinkStyledButton id="add-members-button" onClick={() => onChangeRecipient('')} >
              + Add more members
             </LinkStyledButton>
            <CurrencyInputPanel
              value={formattedAmounts[Field.OUTPUT]}
              onUserInput={handleTypeOutput}
              label={independentField === Field.INPUT && !showWrap && trade ? 'To (estimated)' : 'To'}
              showMaxButton={false}
              currency={currencies[Field.OUTPUT]}
              onCurrencySelect={handleOutputSelect}
              otherCurrency={currencies[Field.INPUT]}
              id="swap-currency-output"
            /> */}

            {/* {
              //recipient !== null && !showWrap ? (
              true ? (
                <>
                  <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                    <ArrowWrapper clickable={false}>
                      <ArrowDown size="16" color={theme.text2} />
                    </ArrowWrapper>
                    <LinkStyledButton id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                      - Remove send
                  </LinkStyledButton>
                  </AutoRow>
                  <AddressInputPanel id="recipient" value={recipient?.toString() ?? ''} onChange={onChangeRecipient} />
                </>
              ) : null}

            {
              //showWrap ? null : (
              false ? null : (
                <Card padding={'.25rem .75rem 0 .75rem'} borderRadius={'20px'}>
                  <AutoColumn gap="4px">
                    {
                      //Boolean(trade) && (
                      true && (
                        <RowBetween align="center">
                          <Text fontWeight={500} fontSize={14} color={theme.text2}>
                            Price
                      </Text>
                          <TradePrice
                            price={trade?.executionPrice}
                            showInverted={showInverted}
                            setShowInverted={setShowInverted}
                          />
                        </RowBetween>
                      )}
                    {
                      // 用来做小提示不错
                      //allowedSlippage !== INITIAL_ALLOWED_SLIPPAGE && (
                      true && (
                        <RowBetween align="center">
                          <ClickableText fontWeight={500} fontSize={14} color={theme.text2} onClick={toggleSettings}>
                            Slippage Tolerance
                      </ClickableText>
                          <ClickableText fontWeight={500} fontSize={14} color={theme.text2} onClick={toggleSettings}>
                            {allowedSlippage / 100}%
                      </ClickableText>
                        </RowBetween>
                      )}
                  </AutoColumn>
                </Card>
              )} */}
          </AutoColumn>
          <BottomGrouping>
            {
              //!!account && registerButtonActive ?
              !!account && showApproveFlow ?
                // <ButtonPrimary disabled={Boolean(wrapInputError)} onClick={handleRegister}>
                //  Regist
                // </ButtonPrimary>
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
                      registerStateMemo === RegistState.PENDING ? (
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
                  <ButtonAddComp
                    onClick={handleShowAddDaoComponentsPanel}
                    width="48%"
                    id="next-button"
                    disabled={
                      registerStateMemo !== RegistState.REGISTERD ||
                      isShowDaoComponentsState? 
                      (bodyState === BodyState.UNCHECK ||
                        bodyState === BodyState.PENDING||
                        bodyState === BodyState.ERROR ||
                        bodyState === BodyState.UNKNOWN )
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
                        </AutoRow>): bodyState === BodyState.ADDED? 'Issue token?' :'Add Components'}
                    </Text>
                  </ButtonAddComp>
                </RowBetween>
                :
                <ButtonError
                  id="register-button"
                  disabled={!registerButtonActive}
                // error={isValid && priceImpactSeverity > 2 && !swapCallbackError}
                >
                  <Text fontSize={20} fontWeight={500}>
                    {/* 如果输入的dao已经存，此按钮显示为修改dao信息 */}
                    {(!daoNameChecked ? 'Need a DAO name' : !daoIDChecked ? 'Need a DAO ID' : !svgChecked ? 'Need a svg pic' : 'Modify DAO info')}
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
