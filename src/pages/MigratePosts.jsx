import React, { useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

// Define the old team names mapped to the new slugs
const teamSlugMap = {
  'Auburn Tigers': 'auburn',
  'Florida Gators': 'florida',
  'Florida State Seminoles': 'florida_state',
  'Houston Cougars': 'houston',
  'LSU Tigers': 'lsu',
  'Miami Hurricanes': 'miami',
  'North Carolina Tarheels': 'north_carolina',
  'Notre Dame Fighting Irish': 'notre_dame',
  'Ole Miss Rebels': 'ole_miss',
  'Oregon Ducks': 'oregon',
  'Penn State Nittany Lions': 'penn_state',
  'South Carolina Gamecocks': 'south_carolina',
  'Texas Tech Red Raiders': 'texas_tech',
  'UCLA Bruins': 'ucla',
  'Washington Huskies': 'washington',
};

const MigratePosts = () => {
  useEffect(() => {
    const migrate = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'posts'));

        const updates = snapshot.docs.map(async (postDoc) => {
          const data = postDoc.data();
          const oldTeam = data.team;
          const newTeamSlug = teamSlugMap[oldTeam];

          if (newTeamSlug) {
            await updateDoc(doc(db, 'posts', postDoc.id), {
              team: newTeamSlug,
            });
            console.log(`✅ Updated post ${postDoc.id} from "${oldTeam}" to "${newTeamSlug}"`);
          } else {
            console.warn(`⚠️ No mapping for post ${postDoc.id} (team: "${oldTeam}")`);
          }
        });

        await Promise.all(updates);
        console.log('🚀 Migration complete!');
      } catch (error) {
        console.error('❌ Migration error:', error);
      }
    };

    migrate();
  }, []);

  return <div className="text-center mt-12">Running migration... Check console for updates!</div>;
};

export default MigratePosts;
