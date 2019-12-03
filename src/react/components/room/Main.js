import React from 'react';
// COMPONENTS
import Chat from './Chat';
import VideoPlayer from './VideoPlayer';
// MATERIAL UI
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';



const Room = () => {
  return (
    <React.Fragment>
      <Grid container xs={12} >
        <Grid item xs={12} md={10}>
          <VideoPlayer />
        </Grid>
        <Grid item xs={12} md={2} style={{padding: 5, paddingRight: 0}} >
         
          <Chat />
           
        </Grid>
    
      </Grid>
    </React.Fragment>
  )
}

export default Room;