import React from 'react';
import { NavLink } from 'react-router-dom';
// COMPONENTS
import SignInScreen from './SignInUpdate';
import Leaderboard from './Leaderboard'
// MATERIAL-UI
import AppBar from '@material-ui/core/AppBar';
import MenuIcon from '@material-ui/icons/Menu';
import LocalMallOutlinedIcon from '@material-ui/icons/LocalMallOutlined';
import IconButton from '@material-ui/core/IconButton';
import ViewListIcon from '@material-ui/icons/ViewList';
import Slide from '@material-ui/core/Slide';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';


const HideOnScroll = (props) => {
  const { children, window } = props;
  const trigger = useScrollTrigger({ target: window ? window() : undefined });
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const useStyles = makeStyles(theme => ({
  appBar: {
    display: 'flex',
    backgroundColor: theme.palette.primary.main,
    color: 'white',
  },
  title: {
    flexGrow: 1,
    fontWeight: 'bold',
    padding: 12,
  },
  icon: {
    color: 'black',
  }
}));

const NavBar = () => {
  const classes = useStyles();
  return (
    <React.Fragment>
      <HideOnScroll>
        <AppBar className={classes.appBar} elevation={1}>
          <Toolbar >
            <Leaderboard />
            <Typography variant="h6" align="center" className={classes.title}>
              <NavLink style={{ textDecoration: 'none', color: 'unset' }} to="/" color="inherit">
                Friends with Vids
              </NavLink>  
            </Typography>
            <SignInScreen/>
          </Toolbar>
        </AppBar>
      </HideOnScroll>
    </React.Fragment>
  )
}

export default NavBar;