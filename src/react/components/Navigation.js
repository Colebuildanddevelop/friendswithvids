import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useVisitorCollection } from '../hooks';
import * as firebase from 'firebase';
import { Route, Switch } from 'react-router-dom';
// ACTIONS
import { handleVisitor } from '../../redux/actions';
// COMPONENTS
import NavBar from './NavBar';
import Footer from './Footer';
import VideoPlayer from './room/VideoPlayer';
// MATERIAL UI
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';

const useStyles = makeStyles(theme => ({
  mainBackground: {
    backgroundColor: '#2B2B2C',
    marginTop: 56,
    marginRight: 0,
    marginLeft: 0,
    maxWidth: '100%',
    padding: 10,
    [theme.breakpoints.down('xs')]: {
      paddingTop: 0
    }
  }
}));

/***
 * Main app component
 *   - keeps a visitor count
 *   - HOC for
 *     - VideoPlayer
 *     - NavBar
 *     - Footer
 * 
 ***/ 
const Navigation = (props) => {
  const classes = useStyles();
  // get visitorData via react hook, 
  const visitorRef = firebase.firestore().collection('visitors');
  const { isVisitorsLoading, visitorData } = useVisitorCollection(visitorRef);  

  useEffect(() => {
    // non sign in visitor states : no uuid (x); uuid locally, but not in db(); uuid locally, and in db();
    // check if visitor has uid locally
    if (props.uid !== '') { 
      let inDb = false;  
      if (visitorData !== null) {
        console.log(visitorData)
        visitorData.forEach(visitor => {
          if (visitor.uuid === props.uid) {
            console.log("in DB!")
            inDb = true
          }
        })      
        if (inDb === false) {
          console.log("visitor uuid was deleted, creating and adding new one");
          generateUserData();   
        } else {
          console.log('visitor is in db')
        }
      } else {
        console.log('loading visitor data')
      }      
    } else {
      console.log('creating uuid')
      generateUserData();     
    }            
  }, [visitorData])  

  // taken from https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript Broofa's answer
  const uuidv4 = () => {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }    

  const generateUserData = async () => {
    // generate uuid add to db and local storage 
    let uuid = uuidv4()
    props.handleVisitor(uuid)    
    let currentTime = firebase.firestore.Timestamp.now().seconds;
    await firebase.firestore().collection('visitors').add({
      uuid: uuid,
      timestamp: currentTime,
      votedToSkip: false,
    }).catch(err => {
      console.error('error', err);
    })          
  }  
  
  return (
    <div>
      <React.Fragment>
        <CssBaseline />
        <Container className={classes.mainBackground}>
          <NavBar />
          <Switch>
            <Route
              exact path='/'
              render={() => <VideoPlayer/>}
            />  
          </Switch>
          <Footer />
        </Container>
      </React.Fragment>
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    uid: state.visitor.uid
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({handleVisitor}, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Navigation);

/***

<VideoPlayer />

 ***/