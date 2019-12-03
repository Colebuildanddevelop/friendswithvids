import React, { useEffect, useState, useRef } from 'react';
import { useVisitorCollection, useAuth } from '../../hooks';
import * as firebase from 'firebase';
// MATERIAL UI
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import SendIcon from '@material-ui/icons/Send';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';


const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  chatDisplay: {
    flexGrow: 1,    
    width: '100%',
    position: 'relative',
    overflow: 'auto',
    [theme.breakpoints.down('xs')]: {
      maxHeight: 300,
    },
    
    [theme.breakpoints.up('lg')]: {
      maxHeight: 400,
      minHeight: 400,
    },

  },
  inputLabel: {
    color: 'white',
  },
  inputText: {
    color: 'white',
    backgroundColor: '#636363',
  },
  message: {
    color: 'white',
    backgroundColor: '#212121',
    width: '100%',
    margin: 5,
    padding: 2,
  },
}));

const Chat = () => {
  const classes = useStyles();  
  const chatDisplayRef = useRef(null);
  const { isAuthLoading, user } = useAuth(firebase.auth());  

  const [messages, addMessage] = useState([]);
  const [message, setMessage] = useState('')

  useEffect(() => {
    // loads and listens to messages  
    const query = firebase.firestore().collection('messages').orderBy('timestamp', 'asc').limit(50);
    query.onSnapshot((snapshot) => {
      let updatedMessages = [];  
      snapshot.forEach((doc) => {
        updatedMessages.push(doc.data());
      })
      addMessage(updatedMessages)
    });  
    // scroll to bottom of chat window
  }, []);  

  useEffect(() => {chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight}, [messages])

  // sends message
  const sendMessage = (messageText) => {
    if (!user) {
      alert('please sign in to chat')
      return null;
    }
    // reset message
    setMessage('')
    // Add a new message entry to the Firebase database.
    return firebase.firestore().collection('messages').add({
      name: firebase.auth().currentUser.displayName,
      text: messageText,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      photoURL: firebase.auth().currentUser.photoURL, 
    }).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });      
  }   
  
  return (
    <React.Fragment>

      <Paper style={{width: '100%', height: 40, marginBottom: 10, backgroundColor: '#673ab7'}}>
        <Typography variant='h6' align='center' style={{color: 'white'}}>
          chat
        </Typography>
      </Paper>
      <Grid container item spacing={2} className={classes.root}>
        <Grid container item xs={12} className={classes.chatDisplay} id='chat-display' ref={chatDisplayRef}>
          {messages.map(message => (
            
            <Card className={classes.message}>
              <Grid container xs={12}  direction='row'>
                <Grid item xs={2}>
                  <Avatar
                    alt='avatar'
                    src={message.photoURL}
                  />
                </Grid>
                <Grid item xs={9}>
                  <Typography style={{fontWeight: 'bold'}}>
                    {message.name}
                  </Typography>                
                  <Typography style={{display: 'inline', overflowWrap: 'break-word'}}>
                    {message.text}
                  </Typography> 
                </Grid>                
              </Grid>
            </Card >
              
          ))}
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth={true}
            multiline={true}
            
            variant="outlined"
            type='text'
            label="chat here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            InputLabelProps={{
              className: classes.inputLabel
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    aria-label="send message"
                    onClick={() => sendMessage(message)}
                  >
                    <SendIcon />
                  </IconButton>
                </InputAdornment>
              ),
              className: classes.inputText,
            }}
          />
        </Grid>
      </Grid>
  
    </React.Fragment>
  )  
}

export default Chat;

