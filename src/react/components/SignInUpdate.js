import React, { useEffect, useState } from 'react';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { useAuth } from '../hooks';
import * as firebase from 'firebase';
// MATERIAL UI
import { makeStyles } from '@material-ui/core/styles';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';

const useStyles = makeStyles(theme => ({
  signInButton: {
    backgroundColor: theme.palette.primary.light,
    color: 'white',
  },
  dialogBox: {
    margin: 'auto',
    backgroundColor: theme.palette.primary.light,
  }
}));

const SignInScreen = (props) => {
  const classes = useStyles();
  const { isAuthLoading, user } = useAuth(firebase.auth());
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  }
  const handleClickClose = () => {
    setOpen(false);
  }

  // Configure FirebaseUI.
  const uiConfig = {
    // Popup signin flow rather than redirect flow.
    signInFlow: 'popup',
    // We will display Google and Facebook as auth providers.
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
    ],
    callbacks: {
      // Avoid redirects after sign-in.
      signInSuccessWithAuthResult: () => false
    }
  };  

  useEffect(() => {
    if (user !== null) {
      let userInDb = false;
      firebase.firestore().collection('users')
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(doc => {
            if (doc.data().uid === user.uid) {
              userInDb = true
              console.log('user found in db')
              doc.ref.update({
                isActive: true,
              })
            }          
          })
          if (userInDb !== true) {
            console.log('adding user to db')
            let currentTime = firebase.firestore.Timestamp.now().seconds;
            firebase.firestore().collection('users').add({
              displayName: user.displayName,
              photoUrl: user.photoURL,
              uid: user.uid,
              votedToSkip: false,
              upVotedDj: false,      
              upVotedPlaylistIndex: null,        
              rep: 0,        
              lastSeen: currentTime, 
              isActive: true,
            });
          }
        })
        .catch(err => {
          console.log(err)   
          return null       
        });      
    } 
  }, [user])

  if (!user) {
    return (
      <React.Fragment>
        <Button variant='contained' onClick={handleClickOpen} className={classes.signInButton} >Sign In</Button>      
        <Dialog onClose={handleClickClose} open={open} PaperProps={{className: classes.dialogBox}}>
          <DialogTitle style={{color: 'white', margin: 'auto'}}>Sign in</DialogTitle>
          <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()}/>
        </Dialog>
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      <IconButton onClick={handleClickOpen}>
        <Avatar 
          alt='user-avatar'
          src={user.photoURL}
        />
      </IconButton>
      <Dialog onClose={handleClickClose} open={open} PaperProps={{className: classes.dialogBox}}>
        <DialogTitle style={{color: 'white', margin: 'auto'}}>
          Welcome! {firebase.auth().currentUser.displayName}! You are now signed-in!
        </DialogTitle>
        <Button 
          color='primary'
          variant='contained'
          style={{color: 'white'}}
          onClick={() => firebase.auth().signOut()}
        >
          Sign-out
        </Button>
      </Dialog>    
    </React.Fragment>      
  );      
}

export default SignInScreen;
