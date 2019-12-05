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
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import SettingsIcon from '@material-ui/icons/Settings';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles(theme => ({
  signInButton: {
    backgroundColor: theme.palette.primary.light,
    color: 'white',
    padding: 4,
  },
  dialogBox: {
    margin: 'auto',
    backgroundColor: '#1d1d1d',
  },
  profileBox: {
    width: '100%',
    margin: 0,
    paddingBottom: 50,
    backgroundColor: '#1d1d1d',

  },
}));

const SignInScreen = (props) => {
  const classes = useStyles();
  const { isAuthLoading, user } = useAuth(firebase.auth());
  const [open, setOpen] = useState(false);
  const [currUser, setCurrUser] = useState();
  const [anchorEl, setAnchorEl] = useState(null);
  const [settingsEnabled, setSettingsEnabled] = useState(false)
  const [userName, setUserName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

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
              setCurrUser(doc.data())
              console.log('user found in db')
              doc.ref.update({
                isActive: true,
              })
            }          
          })
          if (userInDb !== true) {
            // change users profile picture to the default
            firebase.auth().currentUser.updateProfile({
              photoURL: 'https://cdn.psychologytoday.com/sites/default/files/field_blog_entry_images/Happy_smiley_face.png'
            });            
            console.log('adding user to db')
            let currentTime = firebase.firestore.Timestamp.now().seconds;            
            firebase.firestore().collection('users').add({
              displayName: user.displayName,
              photoUrl: 'https://cdn.psychologytoday.com/sites/default/files/field_blog_entry_images/Happy_smiley_face.png',
              uid: user.uid,
              votedToSkip: false,
              upVotedDj: false,      
              upVotedPlaylistIndex: null,        
              rep: 0,        
              lastSeen: currentTime, 
              isActive: true,
            });
          } else {
            // user is in database, update user information
            let currentTime = firebase.firestore.Timestamp.now().seconds;            
            firebase.firestore().collection('users').where('uid', '==', user.uid)
            .get()
            .then(querySnapshot => {
              querySnapshot.forEach(doc => {
                doc.ref.update({
                  displayName: user.displayName,
                  photoUrl: user.photoURL,
                  uid: user.uid,
                  votedToSkip: false,
                  upVotedDj: false,      
                  upVotedPlaylistIndex: null,        
                  rep: 0,        
                  lastSeen: currentTime, 
                  isActive: true,
                })
              })
            })
            .catch(err => {
              console.log(err)
            })            
          }
        })
        .catch(err => {
          console.log(err)   
          return null       
        });      
    } 
  }, [user])



  const handleClickOpen = () => {
    setOpen(true);
  }
  const handleClickClose = () => {
    setOpen(false);
  }

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null);
  }

  const handleSettings = () => {
    setUserName(user.displayName)
    setAvatarUrl(user.photoURL)
    setSettingsEnabled(true)
  }

  const handleSignOut = () => {
    firebase.auth().signOut();
    setAnchorEl(null);
  }

  const handleCancelSettings = () => {
    setSettingsEnabled(false)
    setAnchorEl(null);

  }

  const handleSaveSettings = async () => {
    await firebase.auth().currentUser.updateProfile({
      displayName: userName,
      photoURL: avatarUrl
    })
    .catch(err => {
      console.log(err)
    })
    handleCancelSettings()
  }

  const handleDeleteAccount = async () => {
    let result = window.confirm("are you sure you'd like to do this?")
    if (result === true) {
      let currentUser = firebase.auth().currentUser
      await firebase.firestore().collection('users').where('uid', '==', currentUser.uid)
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(doc => {
            doc.ref.delete()
          })
        })
        .catch(err => {
          console.log(err)
        })            
      await currentUser.delete()
        .then(async () => {
          console.log('user deleted')
          // delete user in db
        })
        .catch(err => {
          alert('requires a recent authorization, please sign out and sign in again')
        })
      handleCancelSettings();  
      setOpen(false);
    }
  }

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
      <IconButton onClick={handleClickOpen} style={{paddingRight: 0}}>
        <Avatar 
          alt='user-avatar'
          src={user.photoURL}
        />
      </IconButton>
      <Dialog onClose={handleClickClose} open={open} PaperProps={{className: classes.profileBox}}>
        {settingsEnabled === false ? 
          (
            <Grid container item xs={12} style={{color: 'white'}} direction='column'>
              <Grid item container style={{width: '100%', paddingRight: 10}} justify='flex-end'>
                <IconButton
                  onClick={handleOpenMenu}
                >
                  <SettingsIcon style={{color: 'white'}} fontSize='large'/>
                </IconButton>
                <Menu
                  id="simple-menu"
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={handleCloseMenu}
                  MenuListProps={{
                    style: {backgroundColor: '#292929', color: 'white'}
                  }}              
                >
                  <MenuItem onClick={handleSettings}>Settings</MenuItem>
                  <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
                </Menu>
              </Grid>  
              <Grid item xs={10} style={{width: '100%', margin: 'auto'}}>
                <Avatar 
                  style={{margin: 'auto', width: 100, height: 100, border: 'solid'}}
                  alt='user-avatar'
                  src={user.photoURL}
                />   
                <Typography align='center' variant='h6' style={{marginTop: 10}}>
                  {user.displayName}
                </Typography>   
                <Typography align='center' style={{marginTop: 10, fontWeight: 'lighter'}}>
                  current reputation {currUser !== undefined ? currUser.rep : 0}
                </Typography>                      
              </Grid>
            </Grid>
          ) : (
            <Grid container item xs={12} style={{color: 'white'}} direction='column'>
              <Grid item container direction='row' style={{width: '100%', marginBottom: 20}}>
                <Grid item container xs={6} style={{paddingLeft: 10}}>                  
                  <Button 
                    variant='contained'
                    onClick={handleDeleteAccount}
                    style={{color: 'white', margin: 10, backgroundColor: 'red'}}
                  >
                    delete
                  </Button>
                </Grid>  
                              
                <Grid item container xs={6} style={{paddingRight: 10}} justify='flex-end'>                  
                  <Button 
                    variant='contained'
                    color='primary' 
                    onClick={handleCancelSettings}
                    style={{color: 'white', margin: 10}}
                  >
                    cancel
                  </Button>
                </Grid>  
              </Grid>

              <Grid item style={{width: '100%', margin: 'auto'}}>
                <Avatar 
                  style={{margin: 'auto', marginBottom: 20, width: 100, height: 100, border: 'solid', opacity: .7}}
                  alt='user-avatar'
                  src={user.photoURL}
                />   
                <TextField
                  autofocus={true}
                  fullWidth={true}
                  margin='dense'
                  type='text'
                  label="current avatar"
                  placeholder='avatar url'
                  value={avatarUrl !== '' ? avatarUrl : ''}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  style={{padding: 10, margin: 10, width: '95%'}}
                  InputLabelProps={{
                    style: {color: 'white'}
                  }}
                  InputProps={{
                    style: {color: 'white', backgroundColor: '#636363', padding: 10}
                  }}
                />  
     
                <TextField
                  autofocus={true}
                  fullWidth={true}
                  margin='dense'
                  type='text'
                  label="current username"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  style={{padding: 10, margin: 10, width: '95%'}}
                  InputLabelProps={{
                    style: {color: 'white'}
                  }}
                  InputProps={{
                    style: {color: 'white', backgroundColor: '#636363', padding: 10}
                  }}
                />     
                
              </Grid>
              <Grid item >
                <Button 
                  variant='contained'
                  color='primary' 
                  onClick={handleSaveSettings}
                  style={{width: '100%', color: 'white'}}
                >
                  save changes
                </Button>    
              </Grid>
            
            </Grid>
          )
        }      
      </Dialog>    
    </React.Fragment>      
  );      
}

export default SignInScreen;
