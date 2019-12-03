import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { connect } from 'react-redux';
import { useVisitorCollection, useCollectionLength, useAuth } from '../../hooks';
import * as firebase from 'firebase';
import YouTube from 'react-youtube';
// COMPONENTS 
import Chat from './Chat';
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
import ThumbUpRoundedIcon from '@material-ui/icons/ThumbUpRounded';
import ThumbDownRoundedIcon from '@material-ui/icons/ThumbDownRounded';
import Button from '@material-ui/core/Button';
import red from '@material-ui/core/colors/red';
import Fab from '@material-ui/core/Fab';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  youtubePlayer: {
    [theme.breakpoints.down('xs')]: {
      height: 200
    },    
    [theme.breakpoints.up('md')]: {
      height: 800
    },
    width: '100%',
  },
  videoInput: {
    width: '100%',
  },
  inputText: {
    backgroundColor: '#636363',
    color: 'white',
  },
  inputLabel: {
    color: 'white',
  },
  chatBox: {
    [theme.breakpoints.up('lg')]: {
      paddingTop: 10,
      paddingLeft: 10,
    },
  }, 
  syncButton: {
    
    [theme.breakpoints.down('lg')]: {
      paddingRight: 10,
      margin: 'auto',
    }
  },
  currentDj: {
    width: '100%',
    marginTop: 0,
    backgroundColor: theme.palette.primary.main,
  },
  queueUpButton: {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    width: '100%',
  },
  thumbsUpActivated: {
    color: '#19d419',
  },
  thumbsDownActivated: {
    color: 'red',
  },  
}));


// TODO skip()
const VideoPlayer = (props) => {

  const classes = useStyles();
  
  // clsx classes
  const [thumbsUpClicked, setThumbsUpClicked] = useState(false);
  const [thumbsDownClicked, setThumbsDownClicked] = useState(false);

  const thumbsUp = clsx({ [classes.thumbsUpActivated]: thumbsUpClicked })  
  const thumbsDown = clsx({ [classes.thumbsDownActivated]: thumbsDownClicked})


  const { isAuthLoading, user } = useAuth(firebase.auth());  
  const [videoIdInput, setVideoIdInput] = useState();
  const [player, setPlayer] = useState();
  const [currVidTitle, setCurrVidTitle] = useState('');
  const [playlistData, setPlaylistData] = useState({
    playlist: [],
    djList: [],
    isLoading: true
  });
  const [currDj, setCurrDj] = useState();
  const [playerTime, setPlayerTime] = useState();
  const [videoDuration, setVideoDuration] = useState();
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [votesToSkip, setVotesToSkip] = useState(0);
  const visitorRef = firebase.firestore().collection('visitors').where('isActive', '==', true);
  const userRef = firebase.firestore().collection('users')
  const { isVisitorsLoading, visitorData } = useVisitorCollection(visitorRef);
  const { isCollectionLengthLoading, collectionLength } = useCollectionLength(userRef)

  useEffect(() => {   
    console.log(player)
    firebase.firestore().collection('playlist').orderBy('timestamp', 'asc')
      .onSnapshot(snapshot => {
        let playlistLength = 0;
        let updatedPlaylist = [];
        let updatedDjList = [];
        snapshot.forEach(doc => {
          playlistLength += 1;
          updatedPlaylist.push(doc.data().videoId)
          updatedDjList.push(doc.data().uid)
        })
        setPlaylistData({
          playlist: updatedPlaylist,
          playlistLength: playlistLength,
          djList: updatedDjList,
          isLoading: false
        });
      });
    firebase.firestore().collection('sessionInfo').doc('sessionTimes')
      .onSnapshot(doc => {
        if (doc.data().timeStarted === 0) {
          setPlayerTime(0);
        } else {
          setPlayerTime(doc.data().timeStarted.seconds);
        }
        setVideoDuration(doc.data().videoDuration)
        setPlaylistIndex(doc.data().playlistIndex)
      });     
    firebase.firestore().collection('users').where('votedToSkip', '==', true)
      .onSnapshot(snapshot => {  
        let countedVotes = 0;      
        snapshot.forEach(doc => {
          countedVotes += 1
        })
        setVotesToSkip(countedVotes)      
      }); 

      
    firebase.firestore().collection('users').where('upVotedDj', '==', true)
      .get()
      .then(querySnapshot => {       
        querySnapshot.forEach(doc => {
          
          if (doc.data().upVotedPlaylistIndex !== playlistIndex) {
            console.log('resetting user upvotes')
            console.log(doc.data().upVotedPlaylistIndex)
            console.log(playlistIndex)
            doc.ref.update({
              upVotedDj: false,
              upVotedPlaylistIndex: null,
            })
          }          
        })    
      }); 
    if (player !== undefined) {
      player.cuePlaylist(playlistData.playlist, playlistIndex)
    }     
    // reset clsx classes
    setThumbsDownClicked(false)
    setThumbsUpClicked(false)             
  }, [playlistIndex])

  const onReady = (event) => {
    console.log(playlistData.playlist) 
    setPlayer(event.target) 
    event.target.cuePlaylist(playlistData.playlist, playlistIndex)
  }

  const onStateChange = (event) => {
    // if video state changes to playing, play from current time in playlist, if no current time create the state
    // need to keep track of the index of the play list currently on
    // track start time initial, duration of video, if video over, then change set index to start from. 
    switch (event.data) {
      case 0: {
        let currentTime = firebase.firestore.Timestamp.now().seconds;            
        let videoExpires = playerTime + videoDuration            
        if (currentTime > videoExpires) {
          console.log('expired')  
          setNextVideoInDb();    
          event.target.cuePlaylist(playlistData.playlist, (playlistIndex + 1))             
          break;          
        } else {
          console.log('restarting')  
          console.log(playlistIndex)
          player.playVideoAt(playlistIndex)  
          let seekTime = currentTime - playerTime;       
          event.target.seekTo(seekTime, true);
        }
        break;
      }   
      case 1: {
        // dangerous if someone is able to skip and get the next video to play?  
        if (videoDuration !== event.target.getDuration()) {
          firebase.firestore().collection('sessionInfo').doc('sessionTimes').set({
            videoDuration: event.target.getDuration()
          }, {merge: true})  
        }
        if (currDj === undefined || currDj.uid !== playlistData.djList[playlistIndex]) {
          firebase.firestore().collection('users').where('uid', '==', playlistData.djList[playlistIndex])
            .get()
            .then(querySnapshot => {
              querySnapshot.forEach(doc => {
                setCurrDj(doc.data())
              })
            })
            .catch(err => {
              console.log(err)
            })          
        }
        setCurrVidTitle(event.target.getVideoData().title)
        break;
      }
      case 5: {
        // should be  0 if hasnt begun, or ended after vid expiry, or started(queued) after vid expiry, vid expiry = player time + video duration(set on video play....)
        if (playerTime === 0) {
          event.target.playVideo();
          console.log('setting time')
          firebase.firestore().collection('sessionInfo').doc('sessionTimes').set({
            timeStarted: firebase.firestore.FieldValue.serverTimestamp(),
          }, {merge: true});
        } else {
          let currentTime = firebase.firestore.Timestamp.now().seconds;            
          let videoExpires = playerTime + videoDuration  
          if (currentTime > videoExpires) {
            console.log('expired')  
            setNextVideoInDb();
            event.target.cuePlaylist(playlistData.playlist, (playlistIndex + 1))             
            break;
          } else {
            console.log('seeking')
            let seekTime = currentTime - playerTime;  
            event.target.seekTo(seekTime, true);
          }  
        }
        break;
      }
      default: {
        break;
      }
    }
  }

  // TODO show confirmation, and play a video if its first queued, or play video if the playlist has ran out...  
  const addToQueue = (videoUrl) => {
    if (!user) {
      alert('please sign in before using the playlist!')
      return null;
    }    
    // check if a valid youtube url     
    // I used https://gist.github.com/takien/4077195 code for YoutubeGetId(url)
    // get videoId from Url 
    const YouTubeGetID = (url) => {
      let ID = '';
      url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
      if(url[2] !== undefined) {
        ID = url[2].split(/[^0-9a-z_\-]/i);
        ID = ID[0];
      }
      else {
        ID = url;
      }
      return ID;
    }    
    // https://stackoverflow.com/questions/28735459/how-to-validate-youtube-url-in-client-side-in-text-box taken from user Manik Arora
    if (videoUrl != undefined || videoUrl != '') {     
      let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
      let match = videoUrl.match(regExp);
      // if valid
      if (match && match[2].length == 11) {
        const videoId = YouTubeGetID(videoUrl)    
        console.log(videoId)
        setVideoIdInput('')
        firebase.firestore().collection('playlist').add({
          uid: user.uid,
          videoId: videoId,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
          console.log('added to playlist')   
          console.log(playlistData.playlist)         
          // triggers use effect to refresh data
          setPlaylistIndex(1)
         
        })
        .catch((error) => {
          console.error('Error adding to queue', error);
          alert('no user found; sign in!')
        });            
      }
      else {
        // Do anything for not being valid
        alert('please enter a valid url from www.Youtube.com!')
      }
    }
  }

  const handleThumbsUp = async () => {
    if (!user) {
      alert('please sign in before giving respect')
      return null;
    }       
    // get users
    let users = [];
    let currUser = null;
    await firebase.firestore().collection('users')
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          users.push(doc.data()) 
          if (doc.data().uid === user.uid) {
            currUser = doc.data();
          }
        })
      })
    // check if user is trying to vote for themselves
    if (currUser.uid === currDj.uid) {
      alert('you can not give yourself rep!')
      return null;
    }
    // check to see if user has already voted,  
    console.log(currUser)
    if (currUser.upVotedDj === true && currUser.upVotedPlaylistIndex === playlistIndex) {
      alert('you have already given the dj respect for this video!')       
      return null;    
    } else {
      // increment the current djs reputation
      firebase.firestore().collection('users').where('uid', '==', currDj.uid)
        .get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            if (snapshot.empty) {
              console.log('snapshot empty')
              return null
            }
            let updatedRep = currDj.rep + 1;
            doc.ref.update({
              rep: updatedRep,
            })
            console.log('updated rep!')
          })
        })
        .catch(err => {
          console.log(err)
          return null;
        }) 
      console.log(user.uid)  
      firebase.firestore().collection('users').where('uid', '==', user.uid)
        .get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            if (snapshot.empty) {
              console.log('snapshot empty')
              return null
            }
            doc.ref.update({
              upVotedDj: true,
              upVotedPlaylistIndex: playlistIndex
            })
            console.log('gave dj rep!')
            // change variable for clsx styling
            setThumbsUpClicked(true)
          })
        })
        .catch(err => {
          console.log(err)
          return null;
        })  
      return null; 
    }        
  }

  const voteToSkip = async () => {
    if (!user) {
      alert('please sign in before voting to skip')
      return null;
    }       
    console.log(player.getVideoData())    
    console.log(player.getVideoData().title)    
    // find user in db, check if they have already voted
    // get users
    let users = [];
    let currUser = null;
    await firebase.firestore().collection('users')
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          users.push(doc.data()) 
          if (doc.data().uid === user.uid) {
            currUser = doc.data();
          }
        })
      })    
    if (currUser.votedToSkip === true) {
      alert('you have already voted to skip this video')
      return null;
    } 
    // update the users voted value
    await firebase.firestore().collection('users').where('uid', '==', currUser.uid)
      .get()
      .then(snapshot => {
        if (snapshot.empty) {
          console.log('no user found')
          return null;
        }
        snapshot.forEach(doc => {
          doc.ref.update({
            votedToSkip: true
          });
        });
        setThumbsDownClicked(true);
        console.log('user voted to skip');   
        let voteThreshold = ((collectionLength / 3) * 2);
        let updatedVotesToSkip = votesToSkip + 1; 
        if (updatedVotesToSkip > voteThreshold) {
          skipVideo();
        }                     
        return null;
      })
      .catch(err => {
        console.log(err)
        return null;
      });        
  
  }

  const setNextVideoInDb = () => {
    // needs to interact and change the database index, and set the time
    firebase.firestore().collection('sessionInfo').doc('sessionTimes').set({
      timeStarted: 0,  
      playlistIndex: playlistIndex + 1,
    }, {merge: true});      
  }

  const skipVideo = async () => {
    console.log('vote has passed!')
    // needs to interact and change the database index, and set the time
    await setNextVideoInDb();  
    // reset visitor skip votes
    await firebase.firestore().collection('users').where('votedToSkip', '==', true)
      .get()
      .then(snapshot => {        
        snapshot.forEach(doc => {
          doc.ref.update({
            votedToSkip: false
          })
        })     
      });   
    // re renders 
    setPlaylistIndex(1)                   
  }

  return (
    <React.Fragment>
      <Grid container>
        <Grid item container xs={12} lg={10} >
          <Grid item xs={12} style={{marginTop: 10}}>
            <YouTube
              containerClassName={classes.youtubePlayer}
              opts={{
                height: '100%',
                width: '100%',
              }}
              onReady={onReady}
              onStateChange={onStateChange}
            />
          </Grid>
          <Grid item xs={6}>
            {(playlistIndex + 1) <= playlistData.playlistLength && 
              <Typography align='left' style={{fontWeight: 'lighter', color: 'white'}}>
                playing: {playlistIndex + 1} / {playlistData.playlistLength} 
              </Typography>           
            }
            {(playlistIndex + 1) > playlistData.playlistLength &&
              <Typography align='left' style={{fontWeight: 'lighter', color: 'white'}}>
                playlist over! 
              </Typography>           
            }
          </Grid>
          <Grid item xs={6}>
            <Typography align='right' style={{fontWeight: 'lighter', color: 'white'}}>
              viewers : {collectionLength}
            </Typography>           
          </Grid>    
        </Grid>

        <Grid item container xs={12} lg={2} className={classes.chatBox} >         
          <Grid item xs={6} lg={12} className={classes.syncButton}>
            <Button
             variant='contained'
             onClick={() => player.cuePlaylist(playlistData.playlist, playlistIndex)}
             style={{color: red[500], backgroundColor: '#636363', width: '100%', height: 75, fontWeight: 'bold', fontSize: 17}}
            >
              sync
            </Button> 
          </Grid>
          <Grid item container xs={6} lg={12}  direction='column'>
            <Grid item>
              <TextField
                margin='dense'
                className={classes.videoInput}
                variant="outlined"
                type='text'
                label="video url"
                value={videoIdInput}
                onChange={(e) => setVideoIdInput(e.target.value)}
                InputLabelProps={{
                  className: classes.inputLabel
                }}
                InputProps={{
                  className: classes.inputText
                }}
              />
            </Grid>
            <Grid item>
              <Button
                className={classes.queueUpButton}         
                variant='outlined'            
                onClick={() => addToQueue(videoIdInput)}
              >
                queue up
              </Button>
            </Grid>
          </Grid>
          <Grid item container xs={12} spacing={2} style={{margin: 'auto'}}>    
            {(currDj !== undefined && (playlistIndex + 1) <= playlistData.playlistLength) && 
              <React.Fragment >
                <Typography align='left' style={{width: '50%', display: 'inline', color: 'white', fontWeight: 'lighter'}}>
                  current dj
                </Typography>        
                <Typography align='right' style={{width: '50%', display: 'inline', color: 'white', fontWeight: 'lighter'}}>
                  {votesToSkip} / {Math.ceil(collectionLength * (2 / 3))} votes to skip
                </Typography>           
                <Card className={classes.currentDj}>
                  
                  <Grid item container xs={12} style={{padding: 10}}>
                    <Grid item container direction='column' xs={4} >
                      <Grid item style={{margin: 'auto'}}>
                        <Avatar alt='reputation' style={{backgroundColor: '#670f94', color: 'white'}}>
                          {currDj.rep}  
                        </Avatar>                  
                      </Grid>
                      <Grid item >
                        <Typography align='center' style={{color: 'white'}}>
                          reputation               
                        </Typography>                  
                      </Grid>                
                    </Grid>                  
                    <Grid item container direction='column' xs={4} >
                      <Grid item style={{margin: 'auto'}}>
                        <Avatar
                          alt='avatar'
                          src={currDj.photoUrl}
                        />                  
                      </Grid>
                      <Grid item >
                        <Typography align='center' style={{fontWeight: 'bold', color: 'white'}}>
                          {currDj.displayName}                
                        </Typography>                  
                      </Grid>                
                    </Grid>
                    <Grid item xs={2} style={{padding: 8}}>
                      <IconButton
                        onClick={handleThumbsUp}
                      >
                        <ThumbUpRoundedIcon className={thumbsUp}/>
                      </IconButton>                      
                    </Grid>
                    <Grid item xs={2} style={{padding: 8}}>
                      <IconButton    
                        onClick={voteToSkip}             
                      >
                        <ThumbDownRoundedIcon className={thumbsDown}/>
                      </IconButton>
                    </Grid>
                    
                  </Grid>
                </Card>      
                     
              </React.Fragment>         
            }           
          </Grid>     
          <Grid item container xs={12} style={{paddingTop: 5}}>
            <Chat/>   
          </Grid>      
        </Grid>               
      </Grid>
    </React.Fragment>          
  )
}

const mapStateToProps = (state) => {
  return {
    uid: state.visitor.uid,
  }
}

export default connect(
  mapStateToProps,
  null,
)(VideoPlayer);


