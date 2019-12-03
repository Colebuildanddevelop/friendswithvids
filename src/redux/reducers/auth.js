const initialState = {
  loggedIn: false,
}

const auth = (state=initialState, action) => {
  switch(action.type) {
    case 'LOGGED_IN': {
      return { loggedIn: action.payload }
    }
    default:
      return state;
  }
}

export default auth;