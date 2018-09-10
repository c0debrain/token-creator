import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setAmount } from '../../redux/addTokenSale'
import icon from '../../assets/images/token-sale-amount.svg'
import './Step.css'
import './StepSingleInput.css'
import { translate } from 'react-i18next'
import { StepHeader } from './parts/StepHeader'
import bnUtils from '../../../../bnUtils'
import { getTokenInfo } from '../../utils/tokens'

class TokenSaleAmount extends Component {
  constructor (props) {
    super(props)

    this.state = {
      valid: false
    }
  }

  onChangeText = (e) => {
    e.preventDefault()
    const value = e.target.value

    const { dispatch, tokenId } = this.props
    dispatch(setAmount({ tokenAddress: tokenId, amount: value }))
    this.setState({
      valid: this.validate(value)
    })
  }

  validate = (input) => {
    const { setValid, tokenId, tokens } = this.props
    const reg = /^-?\d*\.?\d*$/
    const amountDecimalArr = input.split('.')
    const amountDecimal = (amountDecimalArr[1]) ? amountDecimalArr[1].length : 0
    const token = getTokenInfo(tokenId, tokens)
    const valid = input.length > 0 && bnUtils.gt(input, 0) && reg.test(input) && amountDecimal <= token.decimals
    if (setValid) { setValid(valid) }
    return valid
  }

  componentWillMount () {
    const { addTokenSale, tokenId } = this.props
    this.setState({ valid: this.validate(addTokenSale[tokenId].amount) })
  }

  render () {
    const { addTokenSale, nextFunction, t, tokenId, tokens } = this.props
    const { valid } = this.state
    const amount = addTokenSale[tokenId].amount
    const token = getTokenInfo(tokenId, tokens)
    const errorMessage = t(`Decimal must be separated by ' . ' and decimals lenght not more than `) + ' ' + token.decimals
    return (
      <div className={`step ${nextFunction ? 'alone' : ''} pure-u-1 d-flex flex-column flex-h-between`}>
        <StepHeader
          icon={icon}
          title={t(`Insert the Token Amount`)}
        >
          {t(`Add the quantity of the token for this smart contract. You can add many token sale, each smart contract can have different amount.`)}
        </StepHeader>
        <form className='bottom d-flex flex-row flex-h-between'>
          <div className={`input-box ${nextFunction ? 'pure-u-16-24' : 'pure-u-1'} d-flex flex-column flex-v-center`}>
            <input placeholder={t(`Insert the amount`)} className='token-name text shadow pure-u-1' value={amount} onChange={this.onChangeText} />
            {!valid && amount.length > 0 ? <div className='tooltip font-size-tiny pure-u-1 d-flex flex-row flex-v-center'><div className='triangle' />{errorMessage}</div> : null}
          </div>
          {nextFunction ? <button className='next shadow pure-u-7-24' disabled={!valid} onClick={nextFunction} >
            {t('Next')}
          </button> : null}
        </form>
      </div>
    )
  }
}

export default translate('translations')(connect(s => s)(TokenSaleAmount))
