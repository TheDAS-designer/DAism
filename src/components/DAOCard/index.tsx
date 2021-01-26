import { JSBI, Pair, Percent, TokenAmount } from '@uniswap/sdk'
import { darken } from 'polished'
import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Link } from 'react-router-dom'
import { Text } from 'rebass'
import styled from 'styled-components'
import { useTotalSupply } from '../../data/TotalSupply'

import { useActiveWeb3React } from '../../hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { ExternalLink, TYPE, HideExtraSmall, ExtraSmallOnly } from '../../theme'
import { currencyId } from '../../utils/currencyId'
import { unwrappedToken } from '../../utils/wrappedCurrency'
import { ButtonPrimary, ButtonSecondary, ButtonEmpty, ButtonUNIGradient } from '../Button'
import { transparentize } from 'polished'
import { CardNoise } from '../earn/styled'

import { useColor, useSvgColor } from '../../hooks/useColor'

import Card, { GreyCard, LightCard } from '../Card'
import { AutoColumn } from '../Column'
import CurrencyLogo from '../CurrencyLogo'
import DaoSvgLogo from '../DAOLogo'
import { RowBetween, RowFixed, AutoRow } from '../Row'
import { Dots } from '../swap/styleds'
import { BIG_INT_ZERO } from '../../constants'
import { DAO } from 'state/register/reducer'
import { daoIssueInterface } from '../../state/daoIssue/reducer';

export const FixedHeightRow = styled(RowBetween)`
  height: 24px;
`

export const HoverCard = styled(Card)`
  border: 1px solid transparent;
  :hover {
    border: 1px solid ${({ theme }) => darken(0.06, theme.bg2)};
  }
`
const StyledPositionCard = styled(LightCard)<{ bgColor: any }>`
  border: none;
  background: ${({ theme, bgColor }) =>
    `radial-gradient(91.85% 100% at 1.84% 0%, ${transparentize(0.8, bgColor)} 0%, ${theme.bg3} 100%) `};
  position: relative;
  overflow: hidden;
`

interface PositionCardProps {
  dao: DAO
}

// export function MinimalPositionCard({ dao, showUnwrapped = false, border }: PositionCardProps) {
 

//   return (
//     <>
//       {userPoolBalance && JSBI.greaterThan(userPoolBalance.raw, JSBI.BigInt(0)) ? (
//         <GreyCard border={border}>
//           <AutoColumn gap="12px">
//             <FixedHeightRow>
//               <RowFixed>
//                 <Text fontWeight={500} fontSize={16}>
//                   Your position
//                 </Text>
//               </RowFixed>
//             </FixedHeightRow>
//             <FixedHeightRow onClick={() => setShowMore(!showMore)}>
//               <RowFixed>
//                 <DaoSvgLogo svg={dao?.svg}/>
//                 <Text fontWeight={500} fontSize={20}>
//                   {currency0.symbol}/{currency1.symbol}
//                 </Text>
//               </RowFixed>
//               <RowFixed>
//                 <Text fontWeight={500} fontSize={20}>
//                   {userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}
//                 </Text>
//               </RowFixed>
//             </FixedHeightRow>
//             <AutoColumn gap="4px">
//               <FixedHeightRow>
//                 <Text fontSize={16} fontWeight={500}>
//                   Your pool share:
//                 </Text>
//                 <Text fontSize={16} fontWeight={500}>
//                   {poolTokenPercentage ? poolTokenPercentage.toFixed(6) + '%' : '-'}
//                 </Text>
//               </FixedHeightRow>
//               <FixedHeightRow>
//                 <Text fontSize={16} fontWeight={500}>
//                   {currency0.symbol}:
//                 </Text>
//                 {token0Deposited ? (
//                   <RowFixed>
//                     <Text fontSize={16} fontWeight={500} marginLeft={'6px'}>
//                       {token0Deposited?.toSignificant(6)}
//                     </Text>
//                   </RowFixed>
//                 ) : (
//                   '-'
//                 )}
//               </FixedHeightRow>
//               <FixedHeightRow>
//                 <Text fontSize={16} fontWeight={500}>
//                   {currency1.symbol}:
//                 </Text>
//                 {token1Deposited ? (
//                   <RowFixed>
//                     <Text fontSize={16} fontWeight={500} marginLeft={'6px'}>
//                       {token1Deposited?.toSignificant(6)}
//                     </Text>
//                   </RowFixed>
//                 ) : (
//                   '-'
//                 )}
//               </FixedHeightRow>
//             </AutoColumn>
//           </AutoColumn>
//         </GreyCard>
//       ) : (
//         <LightCard>
//           <TYPE.subHeader style={{ textAlign: 'center' }}>
//             <span role="img" aria-label="wizard-icon">
//               ⭐️
//             </span>{' '}
//             By adding liquidity you&apos;ll earn 0.3% of all trades on this pair proportional to your share of the pool.
//             Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.
//           </TYPE.subHeader>
//         </LightCard>
//       )}
//     </>
//   )
// }

export default function FullPositionCard({ dao }: PositionCardProps) {
  const { account } = useActiveWeb3React()
  console.log("init FullPositionCard")
  const [showMore, setShowMore] = useState(true)

  const backgroundColor = useSvgColor(dao?.svg)

  // TODO: 查询个人是否持有这个dao的token 暂时用随机数替代
  const userToken = Math.round(Math.random()*10) %2 === 0? "500": "" //useUserToken(dao?.daoID)
  // TODO: 通过dao id获得此dao 的issue以及信息
  const issue: daoIssueInterface = {allocationProportion:49 , initialPrice: 1, decimal:12, tokenName:'哈哈', tokenSymbol:'😂', totalSupply: "1000000"} 
  return (
    <StyledPositionCard border={'1px'} bgColor={'rgb(33, 114, 229)'}>
      <CardNoise />
      <AutoColumn gap="12px">
        <FixedHeightRow>
          <AutoRow gap="8px">
            <DaoSvgLogo svg={dao?.svg} size={20} />
            <Text fontWeight={500} fontSize={20}>
              {!dao ? <Dots>Loading</Dots> : `${dao.daoName}`}
            </Text>
            {!!userToken && (
              <ButtonUNIGradient as={Link} to={`/manage/${dao?.tokenSymbol}`}>
                <HideExtraSmall>Earning UNI</HideExtraSmall>
                <ExtraSmallOnly>
                  <span role="img" aria-label="bolt">
                    ⚡
                  </span>
                </ExtraSmallOnly>
              </ButtonUNIGradient>
            )}
          </AutoRow>

          <RowFixed gap="8px">
            <ButtonEmpty
              padding="6px 8px"
              borderRadius="12px"
              width="fit-content"
              onClick={() => setShowMore(!showMore)}
            >
              {showMore ? (
                <>
                  Manage
                  <ChevronUp size="20" style={{ marginLeft: '10px' }} />
                </>
              ) : (
                <>
                  Manage
                  <ChevronDown size="20" style={{ marginLeft: '10px' }} />
                </>
              )}
            </ButtonEmpty>
          </RowFixed>
        </FixedHeightRow>

        {showMore && (
          <AutoColumn gap="8px">
            <FixedHeightRow>
              <Text fontSize={16} fontWeight={500}>
                Your total DAO tokens:
              </Text>
              <Text fontSize={16} fontWeight={500}>
                {userToken ? userToken : '-'}
              </Text>
            </FixedHeightRow>
            {userToken && (
              <FixedHeightRow>
                <Text fontSize={16} fontWeight={500}>
                  Pool tokens in rewards pool:
                </Text>
                <Text fontSize={16} fontWeight={500}>
                  {userToken}
                </Text>
              </FixedHeightRow>
            )}
            <FixedHeightRow>
              <RowFixed>
                <Text fontSize={16} fontWeight={500}>
                  Pooled {issue?.tokenName}:
                </Text>
              </RowFixed>
              {userToken ? (
                <RowFixed>
                  <Text fontSize={16} fontWeight={500} marginLeft={'6px'}>
                    {userToken}
                  </Text>
                  <DaoSvgLogo svg={dao?.svg} />
                </RowFixed>
              ) : (
                '-'
              )}
            </FixedHeightRow>

            <FixedHeightRow>
              <Text fontSize={16} fontWeight={500}>
                Your DAO share:
              </Text>
              <Text fontSize={16} fontWeight={500}>
                {userToken
                  ? (issue.allocationProportion.toString() === '0.00' ? '<0.01' : issue.allocationProportion.toString()) + '%'
                  : '-'}
              </Text>
            </FixedHeightRow>

            <ButtonSecondary padding="8px" borderRadius="8px">
              <ExternalLink
                style={{ width: '100%', textAlign: 'center' }}
                href={`https://uniswap.info/account/${account}`}
              >
                View accrued fees and analytics<span style={{ fontSize: '11px' }}>↗</span>
              </ExternalLink>
            </ButtonSecondary>
            {userToken && (
              <RowBetween marginTop="10px">
                <ButtonPrimary
                  padding="8px"
                  borderRadius="8px"
                  as={Link}
                  to={`/add/${dao?.daoName}`}
                  width="48%"
                >
                  Add
                </ButtonPrimary>
                <ButtonPrimary
                  padding="8px"
                  borderRadius="8px"
                  as={Link}
                  width="48%"
                  to={`/remove/${dao?.daoName}`}
                >
                  Remove
                </ButtonPrimary>
              </RowBetween>
            )}
            {userToken && (
              <ButtonPrimary
                padding="8px"
                borderRadius="8px"
                as={Link}
                to={`/manage/${dao?.daoName}`}
                width="100%"
              >
                Manage Liquidity in Rewards Pool
              </ButtonPrimary>
            )}
          </AutoColumn>
        )}
      </AutoColumn>
    </StyledPositionCard>
  )
}
