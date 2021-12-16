
import { useEffect, useState } from 'react';
import stack from './assets/images/stack.png'
import './App.css';
import { useHistory } from 'react-router';
import {
    clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey,
  } from "@solana/web3.js";
  import {
    Link,
  } from "react-router-dom";
import { transferCustomToken } from './utils/transferToken';
const NETWORK = clusterApiUrl("devnet");
let lamportsRequiredToPlay = 0.1 * LAMPORTS_PER_SOL
const gameWalletPublicKey = new PublicKey("62AtDMhgaW1YQZCxv7hGBE7HDTU67L71vs4VQrRVBq3p")

function App() {
  
  const [provider, setProvider] = useState()
  const [providerPubKey, setProviderPub] = useState()
  const [loading, setLoading] = useState(false)
  const history = useHistory()
  
  /**
   * 
   * Connection to the Solana cluster
   */

  const connection = new Connection(NETWORK);

  const playStack = async () =>{
    /**
     * Flow to play the game
     * 1. Check if the user is logged in
     * 2. Check the wallet has SOL in it
     * 3. If no SOL then ask him to fund the wallet first
     * 4. If required SOL present the, proceed with the transaction
     * 
     */

    /**
     * Check if the user is logged in
     */
    if(!providerPubKey){
      alert("Ooops... Please login via wallet")
      return
    }

    /**
     * Check if the user has SOL in his wallet
     */
     const accountBalance = await connection.getBalance(providerPubKey)
     const balanceInLamports = accountBalance ? parseInt(accountBalance):0
     if(balanceInLamports < lamportsRequiredToPlay){
      alert("Not enough balance, please fund your wallet")
      return
    }
    
    /**
     * If user has required SOL in the wallet, then deduct the amount
     */
    setLoading(true)
    lamportsRequiredToPlay = lamportsRequiredToPlay/LAMPORTS_PER_SOL
    const result = await transferCustomToken(provider, connection, lamportsRequiredToPlay,providerPubKey, gameWalletPublicKey)
    
    if(!result.status){
      alert("Error in sending the tokens, Please try again!!!")
      return
    }


    /**
     * If the status is true, that means transaction got successful and we can proceed
     */
     setLoading(false)
    history.push('/stack')
        
  }

  const loginHandler = () =>{
    if(!provider && window.solana){
      setProvider(window.solana)
    }else if(!provider){
      console.log("No provider found")
      return
    }else if(provider && !provider.isConnected){
      provider.connect()
    }
  }

  /**
   * React will call this useEffect everytime there is update in the provider variable.
   * Phantom provider provides 2 methods to listen on
   * 1. connect -> This method gets triggered when the wallet connection is successful
   * 2. disconnect -> This callback method gets triggered when the wallet gets disconnected from the application
   */

  useEffect(() => {
    if (provider) {
        provider.on("connect", async() => {
          console.log("wallet got connected", provider.publicKey)
          setProviderPub(provider.publicKey)

        });
        provider.on("disconnect", () => {
          console.log("Disconnected from wallet");
        });
    }
  }, [provider]);


  /**
   * React will call this useEffect only one time after page the loads
   * We will check if the browser has Phantom wallet installed or not.
   * If a phantom wallet is installed then it provides a "solana" variable on the window object.
   */
  useEffect(() => {
    if ("solana" in window && !provider) {
      console.log("Phantom wallet present")
      setProvider(window.solana)
    }
  },[])

  return (
    <div className="App">
        <header className="header">
          <Link to="/"> <h2 className="gameHeader">STACK GAME</h2> </Link>
          
          {!providerPubKey && <button className="loginButton" onClick={()=>loginHandler()}> Login</button>}
          {providerPubKey && <span>{providerPubKey.toBase58()}</span> }
        </header>
        <div className="gameThumbnail">
            <div className="amountNeed">SOL needed to play: 0.1 SOL </div>
            <img src={stack} alt="Stack Game" />
            <button className="playButton" onClick={() => playStack()}>{loading ? "Transferring SOL ..." : "Play Stack It"}</button>
        </div>
    </div>
  );
}

export default App;
