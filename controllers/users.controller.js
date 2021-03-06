const db = require('../models');
const admin = require('firebase-admin');

module.exports = {
  findAll: (req, res) => {
    db.User.find()
      .sort({ name: 1 })
      .then(users => res.json(users))
      .catch(error => res.status(422).json(error));
  },
  findTransactions: (req, res) => {
    db.User.findOne({ firebaseId: req.params.id })
      .populate({
        path: 'transactions',
        populate: {
          path: 'payee',
          select: 'name'
        },
        options: {
          sort: {
            date: -1
          }
        }
      })
      .select('transactions')
      .then(transactions => res.json(transactions))
      .catch(err => res.status(422).json(err));
  },
  transactionsByPayee: (req, res) => {
    db.User.findOne({ firebaseId: req.params.id })
      .populate({ path: 'transactions', populate: { path: 'payee' } })
      .then(user => {
        const transactionsByPayee = user.transactions.filter(
          transaction => req.body.payeeName === transaction.payee.name
        );
        res.json(transactionsByPayee);
      })
      .catch(err => res.status(422).json(err));
  },
  createUser: async (req, res) => {
    try {
      const user = await admin.auth().createUser({
        email: req.body.email,
        password: req.body.password,
        displayName: req.body.name
      });

      const dbUser = await db.User.findOneAndUpdate(
        { email: req.body.email },
        { firebaseId: user.uid, transactions: [], ...req.body },
        { new: true, upsert: true }
      );

      await res.json(dbUser);
    } catch (error) {
      await res.json(error);
    }
  },
  getUserObject: async (req, res) => {
    try {
      const userObject = await db.User.findOne({ firebaseId: `${req.body.uid}` });
      await res.json({
        mongoId: userObject.id,
        name: userObject.name,
        email: userObject.email,
        firebaseId: userObject.firebaseId,
        totalBalance: userObject.totalBalance
      });
    } catch (error) {
      console.log(error);
      await res.status(422).json(error);
    }
  }
};
