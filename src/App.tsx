import React, { useState } from 'react';
import { User, SessionDay } from './data/types';
import { UserSelect } from './components/UserSelect';
import { SessionSelect } from './components/SessionSelect';
import { ExerciseList } from './components/ExerciseList';
import { Statistics } from './components/Statistics';
import { WeightTracker } from './components/WeightTracker';

type View = 'user' | 'session' | 'exercises' | 'stats' | 'weight';

const App: React.FC = () => {
  const [view, setView] = useState<View>('user');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentSession, setCurrentSession] = useState<SessionDay | null>(null);

  const handleUserSelect = (user: User) => {
    setCurrentUser(user);
    setView('session');
  };

  const handleSessionSelect = (session: SessionDay) => {
    setCurrentSession(session);
    setView('exercises');
  };

  const handleBack = () => {
    switch (view) {
      case 'session':
        setCurrentUser(null);
        setView('user');
        break;
      case 'exercises':
        setCurrentSession(null);
        setView('session');
        break;
      case 'stats':
      case 'weight':
        setView('session');
        break;
    }
  };

  return (
    <div className="font-sans">
      {view === 'user' && <UserSelect onSelect={handleUserSelect} />}
      {view === 'session' && currentUser && (
        <SessionSelect
          user={currentUser}
          onSelectSession={handleSessionSelect}
          onBack={handleBack}
          onStats={() => setView('stats')}
          onWeight={() => setView('weight')}
        />
      )}
      {view === 'exercises' && currentUser && currentSession && (
        <ExerciseList
          user={currentUser}
          session={currentSession}
          onBack={handleBack}
        />
      )}
      {view === 'stats' && currentUser && (
        <Statistics user={currentUser} onBack={handleBack} />
      )}
      {view === 'weight' && currentUser && (
        <WeightTracker user={currentUser} onBack={handleBack} />
      )}
    </div>
  );
};

export default App;
