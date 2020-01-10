import React from 'react';
import './newTrasnactionForm.styles.sass';
import moment from 'moment';

import API from '../../utils/API';

import { connect } from 'react-redux';
import {selectCurrentUser} from "../../redux/user/user.selectors";
import {createStructuredSelector} from "reselect";

//TODO: AirBnB Date Picker

class NewTransactionForm extends React.Component {
  state = {
    trxDate: moment().format('MM/DD/YYYY'),
    trxPayee: '',
    trxMemo: '',
    trxAmount: '',
    trxType: ''
  };

  // set state based on the text/values in the input fields
  handleInputChange = event => {
    const { name } = event.target;
    let { value } = event.target;

    // TODO: Validate and format amount before setting state
    if (name === 'trxAmount') {
      value = parseFloat(value).toFixed(2);
    }

    this.setState(
      {
        [name]: value
      },
      () => console.log(this.state)
    );
  };

  // validate field content and add transaction to Mongo
  handleAddTransactionButton = event => {
    event.preventDefault();

    const { trxDate, trxPayee, trxAmount, trxMemo, trxType } = this.state;
    const { currentUser } = this.props;

    if (
      !trxDate ||
      !trxPayee ||
      trxPayee === '' ||
      !trxAmount ||
      trxAmount < 0.01 ||
      trxAmount === '' ||
      !trxType
    ) {
      // TODO: remove alert() and add a message div
      alert('Date, Payee, Amount and Transaction Type are required');
    } else {
      // TODO: submit transaction to Mongo
      // API takes transaction Object which
      const transaction = {
        payee: trxPayee,
        amount: trxAmount,
        memo: trxMemo,
        date: trxDate,
        isDebit: trxType === 'expense'
      };

      // send transaction:
      API.createTransaction(transaction, currentUser.mongoId, currentUser.token)
        .then(response => response.json())
        .then(data => console.log(data))
      // TODO: update Redux with response (total balance, etc)
      ;
    }
  };

  // TODO: Move input fields to separate components
  render() {
    return (
      <div className='newTrxFormContainer'>
        <div className='newTrxFormTitleContainer'>
          <h1 className='newTransactionFormTitle'>New Transaction</h1>
        </div>

        <form className='newTransactionForm'>
          <div className='rowContainer'>
            <div className='form-group'>
              <div className='input-group'>
                <div className='input-group-prepend'>
                  <span className='input-group-text'>Date</span>
                </div>
                <input
                  className='trxDate'
                  type='date'
                  name='trxDate'
                  defaultValue={this.state.trxDate}
                  onChange={this.handleInputChange}
                />
              </div>
            </div>
            <div className='form-group'>
              <div className='input-group'>
                <div className='input-group-prepend'>
                  <span className='input-group-text'>Payee:</span>
                  <input
                    className='trxPayee'
                    id='trxPayee'
                    type='text'
                    name='trxPayee'
                    onChange={this.handleInputChange}
                  />
                </div>
              </div>
            </div>
            <div className='form-group'>
              <div className='input-group'>
                <div className='input-group-prepend'>
                  <span className='input-group-text'>Amount ($)</span>
                  <input
                    id='trxAmount'
                    name='trxAmount'
                    className='trxAmount'
                    type='number'
                    min='0.00'
                    step='0.01'
                    onChange={this.handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className='rowContainer'>
            <div className='from-group trxMemoFormGroup'>
              <div className='input-group'>
                <div className='input-group-prepend trxMemoInput'>
                  <span className='input-group-text'>Memo:</span>
                  <input
                    type='text'
                    name='trxMemo'
                    className='trxMemo w-100'
                    placeholder='Optional'
                    onChange={this.handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className='debitCreditSelectContainer'>
            <label htmlFor='trxType'>Transaction Type:</label>
            <select name='trxType' id='trxType' onChange={this.handleInputChange}>
              <option defaultValue>Choose one...</option>
              <option value='expense'>Expense</option>
              <option value='income'>Income</option>
            </select>
          </div>
          <button type='submit' className='addTrxButton' onClick={this.handleAddTransactionButton}>
            Add Transaction
          </button>
        </form>
      </div>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  currentUser: selectCurrentUser
});

export default connect(mapStateToProps)(NewTransactionForm);