import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { fetchFaq } from '../../../services/faqService';
import type { AppDispatch, RootState } from '../../../store';
import { FaqItem, setFaqItems } from '../../../store/faqSlice';

export type FaqScreenState = 'loading' | 'list' | 'empty' | 'error';

/** The part of a React Navigation `navigation` object this hook needs. */
export interface FaqFocusSource {
  addListener(type: 'focus', listener: () => void): () => void;
}

/** Drops items without a question; a missing answer becomes empty (FR-4.4-05, FR-4.3-04). */
export function sanitizeFaqItems(raw: unknown): FaqItem[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: FaqItem[] = [];
  raw.forEach(entry => {
    if (entry && typeof entry === 'object') {
      const { question, answer } = entry as { question?: unknown; answer?: unknown };
      if (typeof question === 'string' && question.trim().length > 0) {
        out.push({ question, answer: typeof answer === 'string' ? answer : '' });
      }
    }
  });
  return out;
}

type Phase = 'pending' | 'empty' | 'error';

/**
 * FAQ data for the screen (FR-4.4-01 to FR-4.4-06, FR-4.5-01 to FR-4.5-03; BR-2 to BR-4).
 * - A stored list is shown at once; every screen focus runs one quiet refresh through `fetchFaq`.
 * - Without a stored list the state is `loading` until the request ends: `list`, `empty` or `error`.
 * - A failed or empty refresh never removes a stored list.
 */
export function useFaqData(navigation: FaqFocusSource) {
  const dispatch = useDispatch<AppDispatch>();
  const store = useStore<RootState>();
  const stored = useSelector((state: RootState) => state.faq.items);
  const items = useMemo(() => sanitizeFaqItems(stored), [stored]);
  const [phase, setPhase] = useState<Phase>('pending');
  const inFlight = useRef(false);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    if (inFlight.current) {
      return;
    }
    inFlight.current = true;
    const hadList = sanitizeFaqItems(store.getState().faq.items).length > 0;
    if (!hadList) {
      setPhase('pending');
    }
    try {
      const raw = await fetchFaq();
      if (!mounted.current) {
        return;
      }
      const fresh = sanitizeFaqItems(raw);
      if (fresh.length > 0) {
        dispatch(setFaqItems(raw));
      } else if (!hadList) {
        setPhase('empty');
      }
    } catch {
      if (mounted.current && !hadList) {
        setPhase('error');
      }
    } finally {
      inFlight.current = false;
    }
  }, [dispatch, store]);

  useEffect(() => {
    mounted.current = true;
    load();
    const unsubscribe = navigation.addListener('focus', load);
    return () => {
      mounted.current = false;
      unsubscribe();
    };
  }, [navigation, load]);

  let state: FaqScreenState;
  if (items.length > 0) {
    state = 'list';
  } else if (phase === 'empty') {
    state = 'empty';
  } else if (phase === 'error') {
    state = 'error';
  } else {
    state = 'loading';
  }

  const retry = useCallback(() => {
    load();
  }, [load]);

  return { state, items, retry };
}
