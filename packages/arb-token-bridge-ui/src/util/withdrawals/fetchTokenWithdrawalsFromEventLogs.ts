import { Provider, BlockTag } from '@ethersproject/providers'
import { Erc20Bridger } from '@arbitrum/sdk'

/**
 * Fetches initiated token withdrawals from event logs in range of [fromBlock, toBlock].
 *
 * @param query Query params
 * @param query.address Address that initiated the withdrawal, or received the funds
 * @param query.fromBlock Start at this block number (including)
 * @param query.toBlock Stop at this block number (including)
 * @param query.l2Provider Provider for the L2 network
 * @param query.l2GatewayAddresses L2 gateway addresses to use
 */
export async function fetchTokenWithdrawalsFromEventLogs({
  address,
  fromBlock,
  toBlock,
  l2Provider,
  l2GatewayAddresses = []
}: {
  address: string
  fromBlock: BlockTag
  toBlock: BlockTag
  l2Provider: Provider
  l2GatewayAddresses?: string[]
}) {
  const erc20Bridger = await Erc20Bridger.fromProvider(l2Provider)

  const promises = l2GatewayAddresses.flatMap(gatewayAddress => [
    // funds sent by this address
    erc20Bridger.getL2WithdrawalEvents(
      l2Provider,
      gatewayAddress,
      { fromBlock, toBlock },
      undefined,
      address,
      undefined
    ),
    // funds received by this address
    erc20Bridger.getL2WithdrawalEvents(
      l2Provider,
      gatewayAddress,
      { fromBlock, toBlock },
      undefined,
      undefined,
      address
    )
  ])

  return (
    (await Promise.all(promises))
      .flat()
      // when getting funds received by this address we will also get duplicate txs that are overlapping with the previous query
      // we have to filter them out
      .filter(
        (item, index, self) =>
          index === self.findIndex(tx => tx.txHash === item.txHash)
      )
  )
}
