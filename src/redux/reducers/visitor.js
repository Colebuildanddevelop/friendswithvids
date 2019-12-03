const initialState = {
  uid: ''
}

const visitor = (state=initialState, action) => {
  switch(action.type) {
    case 'HANDLE_VISITOR': {
      return { uid: action.payload }; 
    }
    default: {
      return state;
    }      
  }
}

export default visitor;