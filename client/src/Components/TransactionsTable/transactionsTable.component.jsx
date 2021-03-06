import React from 'react';
import './transactionsTable.styles.sass';
import { Link } from 'react-router-dom';
import Transaction from '../Transaction/transaction.component';
import { withRouter } from 'react-router-dom';
import { auth } from '../../firebase/firebase.utils';
import ModalConfirm from '../ModalConfirm/modalConfirm.component';
import API from "../../utils/API";
import { connect } from 'react-redux';
import {setCurrentUser} from "../../redux/user/user.actions";
import {createStructuredSelector} from "reselect";
import {selectCurrentUser} from "../../redux/user/user.selectors";

class TransactionsTable extends React.Component {
  state = {
    counter: 3,
    show: false,
    trxAmount: '',
    trxDate: '',
    trxPayee: '',
    trxType: false
  };

  showModal = (event, transaction) => {
    this.setState({
      show: !this.state.show,
      trxAmount: transaction ? transaction.amount.$numberDecimal : '',
      trxDate: transaction ? transaction.date : '',
      trxPayee: transaction ? transaction.payee.name : '',
      trxType: transaction ? transaction.isDebit : '',
      trxId: transaction ? transaction._id : ''
    });
  };

  updateTrxBtnClicked = transactionId => {
    this.props.history.push(`/updateTransaction/${transactionId}`);
  };

  deleteTrxBtnClicked = transaction => {
    const {token, mongoId, firebaseId} = this.props.currentUser;

    API.deleteTransactionById(transaction, token, mongoId)
      .then(response => response.json())
      .then(data => {
        if (data.user) {
          this.setState({
            show: false,
            trxAmount: '',
            trxDate: '',
            trxPayee: '',
            trxType: false
          }, () => {
            this.props.setCurrentUser({
              email: data.user.email,
              firebaseId: data.user.firebaseId,
              mongoId: data.user._id,
              name: data.user.name,
              totalBalance: data.user.totalBalance,
              token});
            this.props.fetchTransactionsAsync(firebaseId, token);
          })
        }
      })
      .catch(error => console.log(error));
  };

  sessionExpired = () => {
    // todo: move to homepage and add conditional routing
    setTimeout(() => auth.signOut(), 3000);
  };

  render() {
    const { transactions } = this.props;
    const { trxDate, trxAmount, trxPayee, trxType, trxId } = this.state;
    return (
      <div className='transactionsTableContainer container-fluid h-100'>
        <div className='row h-100'>
          <div className='transactionsTableDiv h-100'>
            <Link to='/newTransaction' className='newTransactionBtn position-sticky'>
              <p className='addSign'>+</p>
            </Link>
            <h1 className={'title'}>Transactions</h1>
            <ModalConfirm
              onClose={this.showModal}
              onDelete={this.deleteTrxBtnClicked}
              show={this.state.show}
              title={'Delete Transaction'}
              body={`Are you sure you want to delete the transaction?`}
              transaction={{ trxDate, trxPayee, trxAmount, trxType, trxId }}
            />

            {transactions ? (
              transactions.length > 0 ? (
              transactions.map(transaction => {
                return (
                  <Transaction
                    key={transaction._id}
                    transaction={transaction}
                    updateTrxBtnClicked={this.updateTrxBtnClicked}
                    deleteTrxBtnClicked={event => this.showModal(event, transaction)}
                  />
                );
              })
              ) : (
                <div className="noTransactionDiv">
                  <p>Add transactions by clicking the plus sign.</p>
                </div>
              )
            ) : (
              // todo: move this to App.js and add conditional routing
              <div className='sessionExpiredContainer container-fluid'>
                <div className='row sessionExpiredDiv'>
                  <div className='col-12'>
                    <h1 onLoad={this.sessionExpired()}>Your session expired.</h1>
                  </div>
                  <div className='col-12'>
                    <p>You're being redirected to the login page.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  currentUser: selectCurrentUser
});

const mapDispatchToProps = dispatch => {
  return {
    setCurrentUser: user => dispatch(setCurrentUser(user))
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(TransactionsTable)
);
