import React from 'react'
import { connect } from 'react-redux'
import { translate } from 'react-i18next'
import { withRouter } from 'react-router-dom'
import plus from '../../assets/images/plus.svg'
import Modal from '../Modal'
import WalletSelection from '../steps/WalletSelection'
import MainTokenSaleAddAmount from '../steps/MainTokenSaleAddAmount'
import prepareTransferTokenTransaction from '../../utils/prepareTransferTokenTransaction'
import { saveAddMoreTokenTransaction, saveAddMoreTokenReceipt } from '../../redux/actions'
import { setAmount } from '../../redux/addMainTokenSale'
import bnUtils from '../../../../bnUtils'
import { StepHeader } from '../steps/parts/StepHeader'
import icon from '../../assets/images/help.svg'

class AddMoreToken extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      amount: null,
      visible: true,
      transaction: null
    }
  }
  toggleVisibility = () => {
    const { history, tokenId } = this.props
    // this.setState({ visible: !this.state.visible })
    history.push(`/token/details/${tokenId}`)
  }
  prepareTransaction = async (amount) => {
    const { web3, tokens, tokenId, mainTokenSales } = this.props
    const transactionHash = tokens.receipts[tokenId].transactionHash
    const tokenType = tokens.transactions[transactionHash].type
    const mainTokenSaleAddress = mainTokenSales[tokenId].receipt.contractAddress
    const transaction = await prepareTransferTokenTransaction({web3, tokenType, tokenAddress: tokenId, to: mainTokenSaleAddress, tokenAmount: amount})
    this.setState({
      amount,
      transaction,
      loading: false
    })
  }

  onTransactionHash = (transactionHash) => {
    const { dispatch, tokenId, mainTokenSales } = this.props
    const { amount } = this.state
    const mainTokenSaleAddress = mainTokenSales[tokenId].receipt.contractAddress
    dispatch(saveAddMoreTokenTransaction({mainTokenSaleAddress, txId: transactionHash, amount}))
  }

  onReceipt = (receipt) => {
    const { dispatch, tokenId, mainTokenSales, addMainTokenSale } = this.props
    const { amount } = this.state
    const mainTokenSaleAddress = mainTokenSales[tokenId].receipt.contractAddress
    dispatch(saveAddMoreTokenReceipt({ mainTokenSaleAddress, receipt }))
    dispatch(setAmount({tokenAddress: tokenId, amount: bnUtils.plus(addMainTokenSale[tokenId].amount, amount)}))
  }

  changeAmount = (e) => {
    e.preventDefault()
    this.setState({
      transaction: null
    })
  }

  render () {
    const { t, tokenId } = this.props
    const { visible, transaction, amount } = this.state
    return (
      <Modal icon={plus} visible={visible} title={t('Add More Tokens')} toggleVisibility={this.toggleVisibility}>
        {transaction
          ? <WalletSelection connectorName='addMoreToken' transaction={transaction} onTransactionHash={this.onTransactionHash} onReceipt={this.onReceipt} tokenId={tokenId}>
            <StepHeader
              icon={icon}
              title={t(`Add More Token to Sale`)}
            >
              {t(`You need to make the transaction to add more tokens to sale.`)}
              <p>
                {t('You are adding')}: {amount} {t('tokens for sale')} <button onClick={this.changeAmount}><i className='fas fa-undo-alt' /> Change the amount</button>
              </p>
            </StepHeader>
          </WalletSelection>
          : <MainTokenSaleAddAmount onIsValidCB={this.prepareTransaction} tokenId={tokenId} />
        }
        <div className='separator-twentyfive' />

      </Modal>
    )
  }
}
export default withRouter(translate('translations')(connect(s => s)(AddMoreToken)))
