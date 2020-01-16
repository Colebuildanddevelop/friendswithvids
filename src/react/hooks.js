import React, { useEffect, useState } from 'react';

/**
 * @desc used to get the length of all visitors in the db
 * @param ref the firestore collection ref to read from
 * @returns {
 *   isVisitorLoading: bool, 
 *   visitorData: [Visitor],
 *   numOfVisitors: int
 * }
 */
export const useVisitorCollection = (ref) => {
  const [docState, setDocState] = useState({
    isVisitorLoading: true,
    visitorData: null
  });
  useEffect(() => {
    return ref.onSnapshot(docs => {
      let update = [];
      let counter = 0;
      docs.forEach(doc => {
        update.push(doc.data())
        counter += 1;
      })
      setDocState({
        isVisitorLoading: false,
        visitorData: update,
        numOfVisitors: counter      
      });
    });
  }, []);
  return docState;
}

/**
 * @desc use to get the current auth state for the user
 * @param function firebase.auth() 
 * @returns auth state
*/
export const useAuth = (auth) => {
  const [authState, setState] = useState({
    isLoading: true,
    user: null
  });
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(authState =>
      setState({ isLoading: false, user: authState })
    );
    return unsubscribe;
  }, [auth]);
  return authState;
}


/**
 * @desc used to get the length of a given collection
 * @param ref the firestore collection ref to read from
 * @returns {
 *   isCollectionLengthLoading: bool,
 *   collectionLength: int
 * }
  */
export const useCollectionLength = (ref) => {
  const [collectionLengthData, setCollectionLength] = useState({
    isCollectionLengthLoading: true,
    collectionLength: null
  });
  
  useEffect(() => {
    return ref.onSnapshot(docs => {
      let counter = 0;
      docs.forEach(doc => {
        counter += 1
      });
      setCollectionLength({
        isCollectionLengthLoading: false,
        collectionLength: counter
      })
    });
  }, [])
  return collectionLengthData;
}