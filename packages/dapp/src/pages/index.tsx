import type { NextPage } from "next"
import Head from "next/head"
import { useEffect, useState } from "react"
import { AccountInterface, session } from "starknet"

import { TokenDapp } from "../components/TokenDapp"
import { truncateAddress } from "../services/address.service"
import {
  addWalletChangeListener,
  chainId,
  connectWallet,
  removeWalletChangeListener,
  silentConnectWallet,
} from "../services/wallet.service"
import styles from "../styles/Home.module.css"

const Home: NextPage = () => {
  const [address, setAddress] = useState<string>()
  const [supportsSessions, setSupportsSessions] = useState<boolean | null>(null)
  const [chain, setChain] = useState(chainId())
  const [isConnected, setConnected] = useState(false)
  const [account, setAccount] = useState<AccountInterface | null>(null)

  useEffect(() => {
    const handler = async () => {
      const wallet = await silentConnectWallet()
      setAddress(wallet?.selectedAddress)
      setChain(chainId())
      setConnected(!!wallet?.isConnected)
      if (wallet?.account) {
        setAccount(wallet.account)
      }
      setSupportsSessions(null)
      if (wallet?.selectedAddress) {
        const sessionSupport = await session.supportsSessions(
          wallet.selectedAddress,
          wallet.provider,
        )
        setSupportsSessions(sessionSupport)
      }
    }

    ;(async () => {
      await handler()
      addWalletChangeListener(handler)
    })()

    return () => {
      removeWalletChangeListener(handler)
    }
  }, [])

  const handleConnectClick = async () => {
    const wallet = await connectWallet()
    setAddress(wallet?.selectedAddress)
    setChain(chainId())
    setConnected(!!wallet?.isConnected)
    if (wallet?.account) {
      setAccount(wallet.account)
    }
    setSupportsSessions(null)
    if (wallet?.selectedAddress) {
      const sessionSupport = await session.supportsSessions(
        wallet.selectedAddress,
        wallet.provider,
      )
      setSupportsSessions(sessionSupport)
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Argent x StarkNet test dapp</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {isConnected ? (
          <>
            <h3 style={{ margin: 0 }}>
              Wallet address: <code>{address && truncateAddress(address)}</code>
            </h3>
            <h3 style={{ margin: 0 }}>
              supports sessions: <code>{`${supportsSessions}`}</code>
            </h3>
            <h3 style={{ margin: 0 }}>
              Url: <code>{chain}</code>
            </h3>
            {account && (
              <TokenDapp showSession={supportsSessions} account={account} />
            )}
          </>
        ) : (
          <>
            <button className={styles.connect} onClick={handleConnectClick}>
              Connect Wallet
            </button>
            <p>First connect wallet to use dapp.</p>
          </>
        )}
      </main>
    </div>
  )
}

export default Home
