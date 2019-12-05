import React, { useEffect, useState } from 'react';
import * as firebase from 'firebase';

// MATERIAL UI
import { makeStyles } from '@material-ui/core/styles';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import ViewListIcon from '@material-ui/icons/ViewList';
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card';
import Paper from '@material-ui/core/Paper'

const useStyles = makeStyles({
  list: {
    width: '100%',
    backgroundColor: '#3a3a3a',
    color: 'white',
    minHeight: 500,
    overflow: 'hidden',
  },

});

const Leaderboard = () => {      
  const classes = useStyles();
  const [state, setState] = useState({bottom: false});
  const [leaderboardList, setLeaderboardList] = useState([])

  useEffect(() => {
    let updatedList = [];
    setLeaderboardList([])
    firebase.firestore().collection('users').orderBy('rep', 'desc')
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          updatedList.push(doc.data())
        }) 
        setLeaderboardList(updatedList) 
      })
  }, [])
  
  const toggleDrawer = (open) => event => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }  
    console.log(leaderboardList)
    setState({bottom: open});
  };    
  


  return (
    <div>
      <IconButton>
        <ViewListIcon
          onClick={toggleDrawer(true)}
          fontSize='large'
          style={{color: 'white', padding: 0}}/>
      </IconButton> 
      <SwipeableDrawer
        anchor="bottom"
        open={state.bottom}
        onClose={toggleDrawer('bottom', false)}
        onOpen={toggleDrawer('bottom', true)}
      >
        <div
          className={classes.list}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <Paper style={{backgroundColor: '#673ab7', color: 'white'}}>
            <Typography align='center' variant='h6' style={{width: '100%'}}>
              Top Friends  
            </Typography>              
          </Paper>

          <List>
            {leaderboardList.map((leader, index) => (
              <div>
                <ListItem>
                  <ListItemText
                    primary={(index + 1) + '.'} 
                    style={{paddingRight: 20, flexGrow: 0}}	
                    
                  />
                  <ListItemAvatar>
                    <Avatar 
                      src={leader.photoUrl}
                      alt='avatar'
                    />    
                  </ListItemAvatar>
                  <ListItemText primary={leader.displayName} /> 
                  <ListItemText primary={'rep: ' + leader.rep} style={{flexGrow: 0}} /> 
  
                </ListItem>  
                <Divider style={{color: 'white', backgroundColor: 'white'}} />
              </div>


              
            ))}
          </List>
        </div>
      </SwipeableDrawer>
    </div>
  );  
}

export default Leaderboard;







