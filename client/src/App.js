import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import './App.css';
import HomePage from './Pages/HomePage/homepage.component';
import SignInRegister from './Pages/SignIn-Register/signIn-register.component';
import NewTransactionForm from './Pages/NewTransactionForm/newTransactionForm.component';
import ProfilePage from './Pages/ProfilePage/profilePage.component';

//firebase Auth
import { auth } from './firebase/firebase.utils';
import Header from './Components/Header/header.component';

// Redux:
import { connect } from 'react-redux';
import { setCurrentUser } from './redux/user/user.actions';
import { selectCurrentUser } from './redux/user/user.selectors';
import { createStructuredSelector } from 'reselect';
import PageNotFound from './Pages/404/PageNotFound.component';
import UpdateTransaction from './Pages/UpdateTransaction/updateTransaction.component';

class App extends React.Component {
  unsubscribeFromAuth = null;

  componentDidMount() {
    const { setCurrentUser } = this.props;
    this.unsubscribeFromAuth = auth.onAuthStateChanged(async userObject => {
      let data = null;
      if (userObject) {
        const token = await auth.currentUser.getIdToken();
        const response = await fetch('/api/users/getuserobject', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ uid: userObject.uid })
        });

        data = await response.json();

        data = {
          ...data,
          token
        };
      }
      setCurrentUser(data);
    });
  }

  componentWillUnmount() {
    this.unsubscribeFromAuth();
  }

  render() {
    return (
      <div className='App h-100'>
        <div className='sticky-top'>
          <Header />
        </div>

        <Switch>
          <Route
            exact
            path={'/'}
            render={() => {
              return this.props.currentUser ? <HomePage /> : <Redirect to={'/signIn'} />;
            }}
          />
          <Route
            exact
            path={'/signIn'}
            render={() => {
              return this.props.currentUser ? <Redirect to={'/'} /> : <SignInRegister />;
            }}
          />
          <Route
            exact
            path={'/register'}
            render={() => {
              return this.props.currentUser ? <Redirect to={'/'} /> : <SignInRegister />;
            }}
          />
          <Route
            exact
            path={'/newTransaction'}
            render={() => {
              return this.props.currentUser ? <NewTransactionForm /> : <Redirect to={'/signIn'} />;
            }}
          />
          <Route
            exact
            path={'/profile'}
            render={() => (this.props.currentUser ? <ProfilePage /> : <Redirect to={'/signIn'} />)}
          />

          <Route
            path={'/updateTransaction/:transactionId'}
            render={() => (this.props.currentUser ? <UpdateTransaction /> : <Redirect to={'/'} />)}
          />
          <Route component={PageNotFound} />
        </Switch>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
