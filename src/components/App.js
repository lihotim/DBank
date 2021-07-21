import { Tabs, Tab } from 'react-bootstrap'
import dBank from '../abis/dBank.json'
import React, { Component } from 'react';
import Token from '../abis/Token.json'
import dbank from '../dbank.png';
import Web3 from 'web3';
import './App.css';

//h0m3w0rk - add new tab to check accrued interest

class App extends Component {

  async componentDidMount() {
    await this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {

    //check if MetaMask exists
    if(typeof window.ethereum!=='undefined'){
      //assign to values to variables: web3, netId, accounts
      const web3 = new Web3(window.ethereum)
      const netId = await web3.eth.net.getId()
      const accounts = await web3.eth.getAccounts()
    
      //check if account is detected, then load balance&setStates, elsepush alert
      if(typeof accounts[0] !=='undefined'){
        const balance = await web3.eth.getBalance(accounts[0])
        this.setState({account: accounts[0], balance: balance, web3: web3})
      } else {
        window.alert('Please login with MetaMask')
      }

      //in try block load contracts
      try {
        const token = new web3.eth.Contract(Token.abi, Token.networks[netId].address)
        const dbank = new web3.eth.Contract(dBank.abi, dBank.networks[netId].address)
        const dBankAddress = dBank.networks[netId].address
        this.setState({token: token, dbank: dbank, dBankAddress: dBankAddress})

        // Note: how to display user's token balance on the UI?
        const tokenBalance = await token.methods.balanceOf(this.state.account).call()
        // console.log(tokenBalance)
        this.setState({tokenBalance: web3.utils.fromWei(tokenBalance)})

      } catch (e) {
        console.log('Error', e)
        window.alert('Contracts not deployed to the current network')
      }

    //if MetaMask not exists push alert
    } else {
      window.alert('Please install MetaMask')
    }

  }

  async deposit(amount) {
    //check if this.state.dbank is ok
    if(this.state.dbank!=='undefined'){
      //in try block call dBank deposit();
      try{
        await this.state.dbank.methods.deposit().send({value: amount.toString(), from: this.state.account})
      } catch (e) {
        console.log('Error, deposit: ', e)
      }
    }
  }

  async withdraw(e) {
    //prevent button from default click  
    e.preventDefault()
    //check if this.state.dbank is ok
    if(this.state.dbank!=='undefined'){
      //in try block call dBank withdraw();
      try{
        await this.state.dbank.methods.withdraw().send({from: this.state.account})
      } catch(e) {
        console.log('Error, withdraw: ', e)
      }
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      web3: 'undefined',
      account: '',
      token: null,
      dbank: null,
      balance: 0,
      dBankAddress: null,
      tokenBalance: 0
    }
  }

  render() {
    return (
      // Whole UI
      <div className='text-monospace'>

        {/* Navbar */}
        <nav className="navbar navbar-dark bg-primary
                        fixed-top
                        flex-md-nowrap p-1 shadow">
          
            <div className="col col-lg-2">
                <a
                className="navbar-brand col-sm-3 col-md-2 mr-0"
                href="http://google.com/"
                target="_blank" // Note: Opens the linked document in a new window or tab
                rel="noopener noreferrer" // Note: For security reasons, always used with "_blank"
                >
                  <img src={dbank} className="App-logo" alt="logo" height="32"/>
                  <b>dBank</b>
              </a>
            </div>

            <div className="navbar-text col-md-auto">
                Your account: {this.state.account}
            </div>
        
            <div className="navbar-text col col-lg-2">
                DCB
            </div>
        </nav>

        {/* Main */}
        <div className="container-fluid mt-5 text-center">
        <br></br>
        {/* Title */}
          <h1>Welcome to dBank!</h1>
          <br></br>
        
        {/* Whole tab */}
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">  

              <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
              
              {/* Tab 1 */}
                  <Tab eventKey="deposit" title="Deposit">
                      <div>
                      <br/>
                        How much do you want to deposit?
                        <br/><br/>
                        (min. amount is 0.01 ETH)
                        <br/>
                        (1 deposit is possible at the time)
                        <br/>
                        <form onSubmit={(e) => {
                          e.preventDefault()
                          let amount = this.depositAmount.value
                          amount = amount * 10**18 //convert to wei
                          this.deposit(amount)
                        }}>
                          <div className='form-group mr-sm-2'>
                          <br/>
                            <input
                              id='depositAmount'
                              step="0.01"
                              type='number'
                              ref={(input) => { this.depositAmount = input }}
                              className="form-control form-control-md"
                              placeholder='amount...'
                              required />
                          </div>
                          <button type='submit' className='btn btn-primary'>DEPOSIT</button>
                        </form>

                      </div>
                    </Tab>

                {/* Tab 2 */}
                    <Tab eventKey="withdraw" title="Withdraw">
                      <br/>
                        Do you want to withdraw all ETH and take interest tokens?
                        <br/><br/>
                      <div>
                        <button type='submit' className='btn btn-primary' onClick={(e) => this.withdraw(e)}>WITHDRAW</button>
                      </div>
                    </Tab>
                
              </Tabs>
              </div>
            </main>
          </div>

            <br/><br/><br/>
            <h2 className = "text-center">(You now have {this.state.tokenBalance} tokens.)</h2>
        </div>

        
      </div>
    );
  }
}

export default App;