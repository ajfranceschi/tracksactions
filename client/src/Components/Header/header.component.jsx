import React from "react";
import "./header.styles.sass";
import { Link } from "react-router-dom";
import { auth } from "../../firebase/firebase.utils";
import { connect } from 'react-redux';

const Header = ({ currentUser }) => {
  return (
    <div className="navbar header">
      <Link to={"/"} className="navbar-brand logo">
        <span>Track</span>Sactions
      </Link>

      <div className="navbar-nav headerLinks ml-auto d-flex flex-row">
        <Link className="nav-item headerLink" to={"/profile"} >
          Profile
        </Link>
        {currentUser ? (
          <Link className="nav-item headerLink" onClick={() => auth.signOut()}>
            Sign Out
          </Link>
        ) : (
          <Link className="nav-item headerLink" to={"/signin"}>
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    currentUser : state.user.setCurrentUser
  }
};

export default connect(mapStateToProps)(Header);
