import { BackHandler } from 'react-native';
import { act, renderHook } from '@testing-library/react-native';
import { useFaqBack } from '../hooks/useFaqBack';

function setup() {
  const listeners: Record<string, Array<() => void>> = {};
  const navigation = {
    navigate: jest.fn(),
    addListener: jest.fn((type: 'focus' | 'blur', cb: () => void) => {
      (listeners[type] = listeners[type] || []).push(cb);
      return () => {
        listeners[type] = (listeners[type] || []).filter(l => l !== cb);
      };
    }),
  };
  let handlers: Array<() => boolean> = [];
  const remove = jest.fn();
  const add = jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_event, handler) => {
    handlers.push(handler as () => boolean);
    return {
      remove: () => {
        remove();
        handlers = handlers.filter(h => h !== handler);
      },
    };
  });
  const hook = renderHook(() => useFaqBack(navigation));
  return {
    ...hook,
    navigation,
    add,
    remove,
    handlers: () => handlers,
    emit: (type: 'focus' | 'blur') => act(() => (listeners[type] || []).slice().forEach(cb => cb())),
  };
}

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('useFaqBack', () => {
  // Covers: FAQ_FUNC_TC_012 - back opens the NonLoggedInHome route explicitly (FR-026, P-06)
  it('opens the Home route explicitly from the header back', () => {
    const { result, navigation } = setup();
    act(() => result.current.onBack());
    expect(navigation.navigate).toHaveBeenCalledTimes(1);
    expect(navigation.navigate).toHaveBeenCalledWith('NonLoggedInHome', undefined);
  });

  it('opens the Home route from the Android hardware back and consumes the event', () => {
    const { navigation, handlers } = setup();
    expect(handlers()).toHaveLength(1);
    let consumed = false;
    act(() => {
      consumed = handlers()[0]();
    });
    expect(consumed).toBe(true);
    expect(navigation.navigate).toHaveBeenCalledTimes(1);
    expect(navigation.navigate).toHaveBeenCalledWith('NonLoggedInHome', undefined);
  });

  it('goes back once for two rapid presses', () => {
    const { result, navigation } = setup();
    act(() => {
      result.current.onBack();
      result.current.onBack();
    });
    expect(navigation.navigate).toHaveBeenCalledTimes(1);
  });

  it('goes back once for a header press followed by a hardware back', () => {
    const { result, navigation, handlers } = setup();
    act(() => {
      result.current.onBack();
      handlers()[0]();
    });
    expect(navigation.navigate).toHaveBeenCalledTimes(1);
  });

  it('removes the hardware back subscription on blur and subscribes again on focus', () => {
    const { handlers, emit, remove } = setup();
    emit('blur');
    expect(remove).toHaveBeenCalledTimes(1);
    expect(handlers()).toHaveLength(0);
    emit('focus');
    expect(handlers()).toHaveLength(1);
    emit('focus');
    expect(handlers()).toHaveLength(1);
  });

  it('removes the hardware back subscription on unmount', () => {
    const { handlers, unmount, remove } = setup();
    unmount();
    expect(remove).toHaveBeenCalledTimes(1);
    expect(handlers()).toHaveLength(0);
  });
});
