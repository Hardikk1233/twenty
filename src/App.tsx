import { useEffect, useLayoutEffect } from 'react';
import { getDay } from './content';
import { isOpen } from './lib/progress';
import { navigate, useRoute } from './lib/router';
import { useKeyboardInset, useTheme } from './lib/viewport';
import { CapstoneScreen } from './screens/Capstone';
import { GlossaryScreen } from './screens/Glossary';
import { Lesson } from './screens/Lesson';
import { PathScreen } from './screens/Path';
import { DayQuiz, ReviewQuiz } from './screens/Quiz';
import { SettingsScreen } from './screens/Settings';
import { Today } from './screens/Today';
import { useAppState } from './state/store';

export function App() {
  const route = useRoute();
  const s = useAppState();
  useTheme(s.settings.theme);
  useKeyboardInset();

  // Lessons, quizzes and the capstone need written content and an open day; otherwise Today.
  const dayNumber = route.name === 'lesson' || route.name === 'quiz' || route.name === 'capstone' ? route.day : null;
  const day = dayNumber === null ? undefined : getDay(dayNumber);
  const blocked =
    dayNumber !== null && (!day || !isOpen(s, dayNumber) || (route.name === 'capstone' && !day.capstone));

  useEffect(() => {
    if (blocked) navigate({ name: 'today' }, { replace: true });
  }, [blocked]);

  // A layout effect runs before any screen's own effects, so screens that scroll to a spot
  // (the Path to your stop, the Glossary to a linked term) are not undone by this reset.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [route.name, day]);

  useEffect(() => {
    const titles: Record<string, string> = {
      path: 'Path',
      glossary: 'Glossary',
      settings: 'Settings',
      review: 'Review',
    };
    const name = day ? `Day ${day.day}: ${day.title}` : titles[route.name];
    document.title = name ? `${name} · Twenty` : 'Twenty';
  }, [route.name, day]);

  if (blocked) return null;
  switch (route.name) {
    case 'lesson':
      return <Lesson key={day!.day} day={day!} />;
    case 'quiz':
      return <DayQuiz key={day!.day} day={day!} />;
    case 'capstone':
      return <CapstoneScreen day={day!} />;
    case 'review':
      return <ReviewQuiz />;
    case 'path':
      return <PathScreen />;
    case 'glossary':
      return <GlossaryScreen slug={route.slug} />;
    case 'settings':
      return <SettingsScreen />;
    default:
      return <Today />;
  }
}
