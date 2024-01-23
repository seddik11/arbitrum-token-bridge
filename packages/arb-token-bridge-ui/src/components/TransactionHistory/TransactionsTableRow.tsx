import { useCallback, useEffect, useMemo, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import dayjs from 'dayjs'
import {
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

import { DepositStatus, MergedTransaction } from '../../state/app/state'
import { formatAmount } from '../../util/NumberUtils'
import { sanitizeTokenSymbol } from '../../util/TokenUtils'
import { getExplorerUrl, getNetworkName, isNetwork } from '../../util/networks'
import { NetworkImage } from '../common/NetworkImage'
import {
  getDestinationNetworkTxId,
  isTxClaimable,
  isTxExpired,
  isTxFailed,
  isTxPending
} from './helpers'
import { ExternalLink } from '../common/ExternalLink'
import { Button } from '../common/Button'
import { TransactionsTableRowAction } from './TransactionsTableRowAction'
import { AssetType } from '../../hooks/arbTokenBridge.types'
import { TransactionsTableTokenImage } from './TransactionsTableTokenImage'
import { useTxDetailsStore } from './TransactionHistory'
import { TransactionsTableExternalLink } from './TransactionsTableExternalLink'

export function TransactionsTableRow({
  tx,
  className = ''
}: {
  tx: MergedTransaction
  className?: string
}) {
  const [shouldHighlightTx, setShouldHighlightTx] = useState(false)
  const { open: openTxDetails } = useTxDetailsStore()

  const sourceChainId = tx.isWithdrawal ? tx.childChainId : tx.parentChainId
  const destChainId = tx.isWithdrawal ? tx.parentChainId : tx.childChainId

  const [txRelativeTime, setTxRelativeTime] = useState(
    dayjs(tx.createdAt).fromNow()
  )

  const { isEthereumMainnetOrTestnet: isSourceChainIdEthereum } =
    isNetwork(sourceChainId)

  const isClaimableTx = tx.isCctp || tx.isWithdrawal

  useEffect(() => {
    // make sure relative time updates periodically
    const interval = setInterval(() => {
      setTxRelativeTime(dayjs(tx.createdAt).fromNow())
    }, 10_000)

    return () => clearInterval(interval)
  }, [tx])

  useEffect(() => {
    const secondsPassed = dayjs().diff(dayjs(tx.createdAt), 'second')
    if (secondsPassed <= 20) {
      setShouldHighlightTx(true)
    }
  }, [tx])

  const tokenSymbol = useMemo(
    () =>
      sanitizeTokenSymbol(tx.asset, {
        erc20L1Address: tx.tokenAddress,
        chainId: isSourceChainIdEthereum ? tx.parentChainId : tx.childChainId
      }),
    [
      tx.asset,
      tx.tokenAddress,
      tx.parentChainId,
      tx.childChainId,
      isSourceChainIdEthereum
    ]
  )

  const StatusLabel = useCallback(() => {
    if (isTxFailed(tx)) {
      return (
        <ExternalLink
          href={`${getExplorerUrl(sourceChainId)}/tx/${tx.txId}`}
          className="arb-hover flex items-center space-x-1 text-red-400"
        >
          <XCircleIcon height={14} className="mr-1" />
          <span>Failed</span>
          <ArrowTopRightOnSquareIcon height={10} />
        </ExternalLink>
      )
    }

    if (isTxExpired(tx)) {
      return (
        <ExternalLink
          href={`${getExplorerUrl(sourceChainId)}/tx/${tx.txId}`}
          className="arb-hover flex items-center space-x-1 text-red-400"
        >
          <XCircleIcon height={14} className="mr-1" />
          <span>Expired</span>
          <ArrowTopRightOnSquareIcon height={10} />
        </ExternalLink>
      )
    }

    if (isTxPending(tx)) {
      return (
        <ExternalLink
          href={`${getExplorerUrl(sourceChainId)}/tx/${tx.txId}`}
          className="arb-hover flex items-center space-x-1 text-yellow-400"
        >
          <div className="mr-1 h-[10px] w-[10px] rounded-full border border-yellow-400" />
          <span>Pending</span>
          <ArrowTopRightOnSquareIcon height={10} />
        </ExternalLink>
      )
    }

    if (isTxClaimable(tx)) {
      return (
        <ExternalLink
          href={`${getExplorerUrl(sourceChainId)}/tx/${tx.txId}`}
          className="arb-hover flex items-center space-x-1 text-green-400"
        >
          <div className="mr-1 h-[10px] w-[10px] rounded-full border border-green-400" />
          <span>Claimable</span>
          <ArrowTopRightOnSquareIcon height={10} />
        </ExternalLink>
      )
    }

    const destinationNetworkTxId = getDestinationNetworkTxId(tx)

    // Success
    return (
      <ExternalLink
        href={
          destinationNetworkTxId
            ? `${getExplorerUrl(destChainId)}/tx/${destinationNetworkTxId}`
            : ''
        }
        className={destinationNetworkTxId ? 'arb-hover' : 'pointer-events-none'}
      >
        <div className="flex items-center space-x-1">
          <CheckCircleIcon height={14} className="mr-1" />
          <span>Success</span>

          <ArrowTopRightOnSquareIcon height={10} />
        </div>
      </ExternalLink>
    )
  }, [tx, sourceChainId, destChainId])

  const isError = useMemo(() => {
    if (tx.isCctp || !tx.isWithdrawal) {
      if (
        tx.depositStatus === DepositStatus.L1_FAILURE ||
        tx.depositStatus === DepositStatus.EXPIRED
      ) {
        return true
      }

      if (tx.depositStatus === DepositStatus.CREATION_FAILED) {
        // In case of a retryable ticket creation failure, mark only the token deposits as errors
        return tx.assetType === AssetType.ETH
      }
    }

    // Withdrawal
    return tx.status === 'Failure'
  }, [tx])

  return (
    <div
      data-testid={`${isClaimableTx ? 'claimable' : 'deposit'}-row-${tx.txId}`}
      className={twMerge(
        'relative mx-4 grid h-[60px] grid-cols-[140px_140px_140px_140px_100px_180px_140px] items-center justify-between border-b border-white/30 text-xs text-white',
        className,
        shouldHighlightTx && 'blink'
      )}
      onClick={() => setShouldHighlightTx(false)}
      onMouseOver={() => setShouldHighlightTx(false)}
    >
      <div className="pr-3 align-middle">{txRelativeTime}</div>
      <div className="flex items-center pr-3 align-middle">
        <TransactionsTableExternalLink
          href={`${getExplorerUrl(
            tx.isWithdrawal ? tx.childChainId : tx.parentChainId
          )}/token/${tx.tokenAddress}`}
          disabled={!tx.tokenAddress}
        >
          <TransactionsTableTokenImage tx={tx} />
          <span className="ml-2">
            {formatAmount(Number(tx.value), {
              symbol: tokenSymbol
            })}
          </span>
        </TransactionsTableExternalLink>
      </div>
      <div className="flex items-center space-x-2">
        <TransactionsTableExternalLink
          href={`${getExplorerUrl(
            tx.isWithdrawal ? tx.childChainId : tx.parentChainId
          )}/address/${tx.sender}`}
        >
          <span>
            <NetworkImage
              chainId={tx.isWithdrawal ? tx.childChainId : tx.parentChainId}
            />
          </span>
          <span className="inline-block max-w-[55px] break-words">
            {getNetworkName(
              tx.isWithdrawal ? tx.childChainId : tx.parentChainId
            )}
          </span>
        </TransactionsTableExternalLink>
      </div>
      <div className="flex items-center space-x-2">
        <TransactionsTableExternalLink
          href={`${getExplorerUrl(
            tx.isWithdrawal ? tx.parentChainId : tx.childChainId
          )}/address/${tx.destination ?? tx.sender}`}
        >
          <span>
            <NetworkImage
              chainId={tx.isWithdrawal ? tx.parentChainId : tx.childChainId}
            />
          </span>
          <span className="inline-block max-w-[55px] break-words">
            {getNetworkName(
              tx.isWithdrawal ? tx.parentChainId : tx.childChainId
            )}
          </span>
        </TransactionsTableExternalLink>
      </div>
      <div className="pr-3 align-middle">
        <StatusLabel />
      </div>
      <div className="flex justify-center px-3 align-middle">
        <TransactionsTableRowAction
          tx={tx}
          isError={isError}
          type={tx.isWithdrawal ? 'withdrawals' : 'deposits'}
        />
      </div>
      <div className="pl-3 align-middle">
        <Button
          variant="primary"
          className="rounded border border-white p-2 text-xs text-white"
          onClick={() => openTxDetails(tx)}
        >
          See Details
        </Button>
      </div>
    </div>
  )
}
