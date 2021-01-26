import React, { useContext, useMemo, useState, useEffect, useCallback } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { Pair, JSBI } from '@uniswap/sdk'
import { Link } from 'react-router-dom'
import { SwapPoolTabs } from '../../components/NavigationTabs'

import FullPositionCard from '../../components/DAOCard'
import { useUserHasLiquidityInAllTokens } from '../../data/V1'
import { useTokenBalancesWithLoadingIndicator } from '../../state/wallet/hooks'
import { StyledInternalLink, /*ExternalLink, */ TYPE, HideSmall } from '../../theme'
import { Text,Box } from 'rebass'
import Card from '../../components/Card'
import { RowBetween, RowFixed } from '../../components/Row'
import { ButtonPrimary, ButtonSecondary } from '../../components/Button'
import { AutoColumn } from '../../components/Column'
import SearchDAOInputPanel from '../../components/SearchDAOInputPanel'
import { useActiveWeb3React } from '../../hooks'
import {useGetDAO as useGetDAOByName}  from '../../hooks/useGetDAO'
import { usePairs } from '../../data/Reserves'
import { toV2LiquidityToken, useTrackedTokenPairs } from '../../state/user/hooks'
import { Dots } from '../../components/swap/styleds'
import {/* CardSection,*/ DataCard, CardNoise, CardBGImage } from '../../components/earn/styled'
import { useStakingInfo } from '../../state/stake/hooks'
import { BIG_INT_ZERO } from '../../constants'
import { DAO } from '../../state/register/reducer';


const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`

const VoteCard = styled(DataCard)`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #27ae60 0%, #000000 100%);
  overflow: hidden;
`

const TitleRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    flex-direction: column-reverse;
  `};
`

const ButtonRow = styled(RowFixed)`
  gap: 8px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    flex-direction: row-reverse;
    justify-content: space-between;
  `};
`

const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  width: fit-content;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 48%;
  `};
`

const ResponsiveButtonSecondary = styled(ButtonSecondary)`
  width: fit-content;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 48%;
  `};
`

const EmptyProposals = styled.div`
  border: 1px solid ${({ theme }) => theme.text4};
  padding: 16px 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`
const WrapSerchInput = styled.div`
  display: flex;
  border: 1px solid ${({ theme }) => theme.text4};
  dorder-radius: 2px;
  flex-drection: column;
  justify-content: center;
  align-items: center;
`
export default function Pool() {
  const theme = useContext(ThemeContext)
  const { account } = useActiveWeb3React()
  const [openSerchInput, setOpenSerchInput] = useState(false)

  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs()
  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs.map(tokens => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
    [trackedTokenPairs]
  )
  const liquidityTokens = useMemo(() => tokenPairsWithLiquidityTokens.map(tpwlt => tpwlt.liquidityToken), [
    tokenPairsWithLiquidityTokens
  ])
  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    liquidityTokens
  )

  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        v2PairsBalances[liquidityToken.address]?.greaterThan('0')
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances]
  )

  const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens))
  const v2IsLoading =
    fetchingV2PairBalances || v2Pairs?.length < liquidityTokensWithBalances.length || v2Pairs?.some(V2Pair => !V2Pair)

  const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair))

  const hasV1Liquidity = useUserHasLiquidityInAllTokens()

  // show liquidity even if its deposited in rewards contract
  const stakingInfo = useStakingInfo()
  const stakingInfosWithBalance = stakingInfo?.filter(pool => JSBI.greaterThan(pool.stakedAmount.raw, BIG_INT_ZERO))
  const stakingPairs = usePairs(stakingInfosWithBalance?.map(stakingInfo => stakingInfo.tokens))

  // remove any pairs that also are included in pairs with stake in mining pool
  const [daos, setDaos] = useState<Array<DAO>>([])

  //TODO: 获得从合约部署开始最近99999个区块内新建的DAO
  useEffect(() => {
    let _daos = []
    for (var i = 0; i < 20; i++) {
      const _dao: DAO = { tokenSymbol: 'Symbol'+i, daoName: 'test' + i, svg: '<svg id="图层_1" data-name="图层 1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="300" height="300" viewBox="0 0 300 300"><defs><style>.cls-2{fill:#141e3d;}.cls-3{fill:none;stroke:#231815;stroke-miterlimit:10;stroke-width:0.01px;}.cls-4{fill:url(#未命名的渐变_50);}.cls-5{fill:url(#未命名的渐变_80);}.cls-6{fill:url(#未命名的渐变_84);}.cls-7{fill:url(#未命名的渐变_52);}.cls-8{fill:url(#未命名的渐变_64);}.cls-9{fill:url(#未命名的渐变_83);}.cls-10{fill:url(#未命名的渐变_81);}.cls-11{fill:url(#未命名的渐变_49);}.cls-12{fill:url(#未命名的渐变_60);}.cls-13{fill:url(#未命名的渐变_78);}.cls-14{fill:url(#未命名的渐变_85);}.cls-15{fill:url(#未命名的渐变_82);}.cls-16{fill:#3d3e3f;}</style><linearGradient id="未命名的渐变_50" x1="140.52" y1="84.38" x2="101.82" y2="121.12" gradientUnits="userSpaceOnUse"><stop offset="0.05" stop-color="#fff"/><stop offset="0.47" stop-color="#9b8278"/><stop offset="0.62" stop-color="#736264"/><stop offset="0.82" stop-color="#413a4c"/><stop offset="0.93" stop-color="#2d2a42"/></linearGradient><linearGradient id="未命名的渐变_80" x1="229.28" y1="130.64" x2="190.52" y2="172.04" gradientUnits="userSpaceOnUse"><stop offset="0.15" stop-color="#f7f7f7"/><stop offset="0.49" stop-color="#9b8278"/><stop offset="0.56" stop-color="#8a7470"/><stop offset="0.75" stop-color="#584c57"/><stop offset="0.9" stop-color="#393348"/><stop offset="0.99" stop-color="#2d2a42"/></linearGradient><linearGradient id="未命名的渐变_84" x1="175.67" y1="92.08" x2="122.17" y2="78.92" gradientUnits="userSpaceOnUse"><stop offset="0.17" stop-color="#f7f7f7"/><stop offset="0.55" stop-color="#9b8278"/><stop offset="0.81" stop-color="#554a56"/><stop offset="0.99" stop-color="#2d2a42"/></linearGradient><linearGradient id="未命名的渐变_52" x1="170.32" y1="190" x2="118.15" y2="178.64" gradientUnits="userSpaceOnUse"><stop offset="0.09" stop-color="#f7f7f7"/><stop offset="0.42" stop-color="#9b8278"/><stop offset="0.56" stop-color="#736264"/><stop offset="0.76" stop-color="#413a4c"/><stop offset="0.86" stop-color="#2d2a42"/></linearGradient><linearGradient id="未命名的渐变_64" x1="127.74" y1="37.55" x2="181.64" y2="51.45" gradientUnits="userSpaceOnUse"><stop offset="0.16" stop-color="#f7f7f7"/><stop offset="0.17" stop-color="#f3f2f2"/><stop offset="0.31" stop-color="#c4b6b0"/><stop offset="0.42" stop-color="#a69088"/><stop offset="0.47" stop-color="#9b8278"/><stop offset="0.68" stop-color="#63555c"/><stop offset="0.87" stop-color="#2d2a42"/></linearGradient><linearGradient id="未命名的渐变_83" x1="182.96" y1="127.7" x2="164.92" y2="73.21" gradientUnits="userSpaceOnUse"><stop offset="0.12" stop-color="#f7f7f7"/><stop offset="0.51" stop-color="#9b8278"/><stop offset="0.99" stop-color="#2d2a42"/></linearGradient><linearGradient id="未命名的渐变_81" x1="95.23" y1="174.55" x2="80.89" y2="120.76" gradientUnits="userSpaceOnUse"><stop offset="0.16" stop-color="#f7f7f7"/><stop offset="0.51" stop-color="#9b8278"/><stop offset="0.65" stop-color="#736264"/><stop offset="0.86" stop-color="#413a4c"/><stop offset="0.96" stop-color="#2d2a42"/></linearGradient><linearGradient id="未命名的渐变_49" x1="157.12" y1="146.34" x2="193.15" y2="108.19" gradientUnits="userSpaceOnUse"><stop offset="0.12" stop-color="#f7f7f7"/><stop offset="0.54" stop-color="#9b8278"/><stop offset="0.93" stop-color="#2d2a42"/></linearGradient><linearGradient id="未命名的渐变_60" x1="71.8" y1="95.55" x2="111.15" y2="55.57" gradientUnits="userSpaceOnUse"><stop offset="0.08" stop-color="#f7f7f7"/><stop offset="0.45" stop-color="#9b8278"/><stop offset="0.66" stop-color="#61545c"/><stop offset="0.81" stop-color="#3b3649"/><stop offset="0.9" stop-color="#2d2a42"/></linearGradient><linearGradient id="未命名的渐变_78" x1="118.67" y1="106.17" x2="134.07" y2="157.3" gradientUnits="userSpaceOnUse"><stop offset="0.11" stop-color="#f7f7f7"/><stop offset="0.43" stop-color="#9b8278"/><stop offset="0.61" stop-color="#736264"/><stop offset="0.85" stop-color="#413a4c"/><stop offset="0.97" stop-color="#2d2a42"/></linearGradient><linearGradient id="未命名的渐变_85" x1="204.78" y1="52.34" x2="216.48" y2="111.77" gradientUnits="userSpaceOnUse"><stop offset="0.21" stop-color="#f7f7f7"/><stop offset="0.5" stop-color="#9b8278"/><stop offset="0.71" stop-color="#61535b"/><stop offset="0.87" stop-color="#3b3549"/><stop offset="0.95" stop-color="#2d2a42"/></linearGradient><linearGradient id="未命名的渐变_82" x1="125.63" y1="136.88" x2="179.16" y2="148.19" gradientUnits="userSpaceOnUse"><stop offset="0.13" stop-color="#f7f7f7"/><stop offset="0.47" stop-color="#9b8278"/><stop offset="0.56" stop-color="#836f6c"/><stop offset="0.76" stop-color="#554a55"/><stop offset="0.91" stop-color="#383347"/><stop offset="1" stop-color="#2d2a42"/></linearGradient></defs><title>DAISM有字1</title><rect fill="#fff" fill-opacity="0.0" width="300" height="300"/><circle class="cls-2" cx="149.76" cy="114.09" r="100.94"/><path class="cls-3" d="M121,65.31" transform="translate(0 -1)"/><polygon class="cls-4" points="149.75 114.09 121.06 64.38 92.36 114.09 149.75 114.09"/><polygon class="cls-5" points="235.85 163.8 207.15 114.09 178.46 163.8 235.85 163.8"/><polygon class="cls-6" points="149.76 114.08 178.45 64.38 121.06 64.38 149.76 114.08"/><polygon class="cls-7" points="149.76 213.5 178.45 163.8 121.06 163.8 149.76 213.5"/><polygon class="cls-8" points="149.76 14.68 121.06 64.38 178.45 64.38 149.76 14.68"/><polygon class="cls-9" points="178.46 64.39 149.76 114.09 207.15 114.09 178.46 64.39"/><polygon class="cls-10" points="92.36 114.09 63.66 163.8 121.06 163.8 92.36 114.09"/><polygon class="cls-11" points="149.76 114.09 178.46 163.8 207.15 114.09 149.76 114.09"/><polygon class="cls-12" points="63.66 64.38 92.36 114.09 121.06 64.38 63.66 64.38"/><polygon class="cls-13" points="149.75 114.09 92.36 114.09 121.06 163.8 149.75 114.09"/><polygon class="cls-14" points="235.85 64.39 178.46 64.39 207.15 114.09 235.85 64.39"/><polygon class="cls-15" points="149.76 114.09 121.06 163.8 178.45 163.8 149.76 114.09"/><path class="cls-16" d="M154.12,249.9l13.15-1.29v20.72s.07,5.33.27,6.1c.73,2.77,4,3.21,6.26,3.54v.76H153.62V279a18.6,18.6,0,0,0,3.92-.8c3.2-1.06,2.84-7,2.84-9.08v-8.84c.63-9.92-4.42-9.25-6.26-9.59Zm9.47-14.12c-1.41.05-4.29-1-4.08-3.26.23-2.58,3.12-3.07,4.13-3.05,2.75.05,4.17,1.81,4.13,3.05C167.71,235.15,165,235.72,163.59,235.78Z" transform="translate(0 -1)"/><path class="cls-16" d="M222.39,248.71a22.56,22.56,0,0,1,1.06,5,21.29,21.29,0,0,1,6.46-3.71c2.39-.86,12.39-4,18.61,4.07a22.82,22.82,0,0,1,14.57-5.36c10.3.08,12.38,6,12.38,8.51v16.59s-.13,4.92,6.53,5.26v.76H261.81v-.76a16.38,16.38,0,0,0,3.91-.8c3.16-1.23,2.85-7,2.85-9.08,0,0-.1-11.46-.32-12.68s-.78-5.91-8.61-6.18c-9.73-.34-10.43,8.14-10.43,12.14l0,9.67c-.35,6.52,3.75,6.32,6.49,6.93v.76H235.55v-.76c2.45-.55,7.22.73,6.76-9.88v-6.65c-.21-3.26,1.07-12.35-8.57-12.11C222.3,250.72,223,260.72,223,262.9v6.58s-.49,6.9,1.83,8.12a10.51,10.51,0,0,0,4.7,1.47v.76H209.34v-.76a14.68,14.68,0,0,0,3.92-.8c.8-.35,3.07-1.16,2.84-9.1V260.3c.5-10.58-4.21-9.1-6.26-9.61v-.76Z" transform="translate(0 -1)"/><path class="cls-16" d="M17.51,278.93c1-.09,6.18.18,8.45-3.65.95-1.6,1.18-3.92,1.14-7.26V242c.08-3.72-.36-6-1.59-7.5-2.43-3-6.74-2.88-8-3v-.83s34.24,0,35.76.14c33.61,3.05,31.39,29.2,27.84,35.61-2.61,4.7-6,13.37-29.85,13.36H17.51Zm19.6-47.17v35.77c0,2.35,0,6.59,2.37,8.49,2,1.87,3.58,2.47,9.5,2.81s22.26-2,23.11-22.13c.15-3.58-1.76-25.48-29.46-24.94Z" transform="translate(0 -1)"/><path class="cls-16" d="M153.29,279.76h-30v-.83c2.71-.19,11.71-.47,7.21-8.92l-5.16-10H105.25s-5.55,10.84-5.57,13.42c-.05,4.32,5.57,5.5,7.35,5.5v.83H86.57v-.83c1.61-.07,5.66.33,10.66-7.39,1-1.51,20.4-40.89,20.4-40.89h2.6l19.87,37.81c1.49,2.86,3.69,7.35,6.44,8.89,1.85,1,4.87,1.42,6.75,1.58Zm-28.68-21.23L115,239.9l-9,18.63Z" transform="translate(0 -1)"/><path class="cls-16" d="M179.43,279.83V269.65l.75,0c.65,2.32,4.36,10.86,12.29,10,7.62-.79,6.89-7,5.13-9.09-1.89-2.29-7.32-4.25-8.46-4.74-1.95-.83-9-3.31-9.31-8.3-.31-4.58,3.47-8.62,10.71-8.83,3.25-.09,3.76.48,6.56,1.28a2,2,0,0,0,2.57-1h.93l.49,8.19-1,0a10,10,0,0,0-9.36-7.68c-5.1-.12-6.42,3.58-6.44,5.06-.06,4.16,7.89,6.23,11.23,7.45,3.95,1.44,8.75,3.77,8.84,9.17.1,5.25-4.67,9.15-12,9.32a19.41,19.41,0,0,1-6.83-1.09c-3.64-1.34-4.87-.35-5.43.43Z" transform="translate(0 -1)"/></svg>' }
      _daos.push(_dao)
    }
    setDaos(_daos)
    console.log('daos:', daos)
  }, [account])


  return (
    <>
      <PageWrapper >
        <SwapPoolTabs active={'pool'} />
        <VoteCard>
          <CardBGImage />
          <CardNoise />
          {/* <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <TYPE.white fontWeight={600}>Liquidity provider rewards</TYPE.white>
              </RowBetween>
              <RowBetween>
                <TYPE.white fontSize={14}>
                  {`Liquidity providers earn a 0.3% fee on all trades proportional to their share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.`}
                </TYPE.white>
              </RowBetween>
              <ExternalLink
                style={{ color: 'white', textDecoration: 'underline' }}
                target="_blank"
                href="https://uniswap.org/docs/v2/core-concepts/pools/"
              >
                <TYPE.white fontSize={14}>Read more about providing liquidity</TYPE.white>
              </ExternalLink>
            </AutoColumn>
          </CardSection> */}
          <CardBGImage />
          <CardNoise />
        </VoteCard>

        <AutoColumn gap="lg" justify="center">
          <AutoColumn gap="lg" style={{ width: '100%' }}>
            <TitleRow style={{ marginTop: '1rem' }} padding={'0'}>
              <HideSmall>
                <TYPE.mediumHeader style={{ marginTop: '0.5rem', justifySelf: 'flex-start' }}>
                  DAOs List:
                </TYPE.mediumHeader>
              </HideSmall>
              <ButtonRow>
                <ResponsiveButtonSecondary as={Link} padding="6px 8px" to="/create/ETH">
                  Create a DAO
                </ResponsiveButtonSecondary>

                <ResponsiveButtonPrimary id="join-pool-button" padding="6px 8px" onClick={(e) => {
                  console.log('openSearchInput:', openSerchInput)
                  if (!openSerchInput) {
                    setOpenSerchInput(true)
                  } else {
                    //TODO search DAO by DAOName
                    setOpenSerchInput(false)
                  }
                }}>
                  <Text fontWeight={500} fontSize={16}>
                    {/* Add Liquidity */}
                    Search
                  </Text>

                </ResponsiveButtonPrimary>
              </ButtonRow>
            </TitleRow>

            {/* {openSerchInput && (<WrapSerchInput><SearchDAOInputPanel onUserInput={(e)=>{console.log('123123')}}/></WrapSerchInput>)} */}
            {openSerchInput && <SearchDAOInputPanel />}
            {!account ? (
              <Card padding="40px">
                <TYPE.body color={theme.text3} textAlign="center">
                  Connect to a wallet to search DAO.
                </TYPE.body>
              </Card>
            ) : (
                <>
                  {/* <ButtonSecondary>
                  <RowBetween>
                    <ExternalLink href={'https://uniswap.info/account/' + account}>
                      Account analytics and accrued fees
                    </ExternalLink>
                    <span> ↗</span>
                  </RowBetween>
                </ButtonSecondary> */}
                  {daos.map(dao => (
                    <FullPositionCard key={dao.daoName} dao={dao} />
                  ))}
                </>
              )}

            <AutoColumn justify={'center'} gap="md">
              <Text textAlign="center" fontSize={14} style={{ padding: '.5rem 0 .5rem 0' }}>
                {hasV1Liquidity ? 'Uniswap V1 liquidity found!' : "Don't see a DAO you want?"}{' '}
                <StyledInternalLink id="import-pool-link" to={hasV1Liquidity ? '/migrate/v1' : '/find'}>
                  {hasV1Liquidity ? 'Migrate now.' : 'Create it.'}
                </StyledInternalLink>
              </Text>
            </AutoColumn>
          </AutoColumn>
        </AutoColumn>
      </PageWrapper>
    </>
  )
}
