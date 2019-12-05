
import React, { useEffect, useState } from 'react';

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