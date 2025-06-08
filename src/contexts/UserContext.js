// src/contexts/UserContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import {
  doc,
  getDoc,
  onSnapshot,
  query,
  collection,
  where,
  updateDoc
} from 'firebase/firestore';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribePredictions = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          const userData = userDocSnap.exists() ? userDocSnap.data() : {};

          const enrichedUser = {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email,
            profilePic: userData.profilePic || null,
            username: userData.username || null,
            team: userData.team || null,
            role: userData.role || null,
            correctPredictions: userData.correctPredictions || 0,
            restartOpportunities: userData.restartOpportunities || 0,
          };

          setUser(enrichedUser);

          // Start live prediction listener
          const q = query(
            collection(db, 'predictions'),
            where('userId', '==', currentUser.uid),
            where('result', '==', 'pending')
          );

          unsubscribePredictions = onSnapshot(q, async (snapshot) => {
            const updates = [];

            for (const docSnap of snapshot.docs) {
              const prediction = docSnap.data();

              if (prediction.actualWinner) {
                const isCorrect = prediction.predictedWinner?.toLowerCase() === prediction.actualWinner?.toLowerCase();

                // Mark prediction as complete
                updates.push(updateDoc(doc(db, 'predictions', docSnap.id), {
                  result: isCorrect ? 'correct' : 'wrong',
                }));

                // Fetch the latest user data
                const userRef = doc(db, 'users', currentUser.uid);
                const userSnap = await getDoc(userRef);
                const userStats = userSnap.exists() ? userSnap.data() : {};

                const currentCorrect = userStats.correctPredictions || 0;
                const currentRestarts = userStats.restartOpportunities || 0;

                const userUpdate = isCorrect
                  ? currentCorrect + 1 >= 3
                    ? {
                        correctPredictions: 0,
                        restartOpportunities: currentRestarts + 1,
                      }
                    : { correctPredictions: currentCorrect + 1 }
                  : {};

                if (Object.keys(userUpdate).length > 0) {
                  updates.push(updateDoc(userRef, userUpdate));
                  setUser((prev) => ({ ...prev, ...userUpdate }));
                }
              }
            }

            await Promise.all(updates);
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribePredictions) unsubscribePredictions();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};
