import { BackHandler } from 'react-native';
import { act, renderHook } from '@testing-library/react-native';
import { restorePlatformOS, setPlatformOS } from '../../../testUtils/platform';
import { useExitConfirm } from '../hooks/useExitConfirm';

let handlers: Array<() => boolean>;
let exitApp: jest.SpyInstance;

function fakeNavigation() {
  const listeners: Record<string, Array<() => void>> = {};
  return {
    navigation: {
      navigate: jest.fn(),
      addListener: jest.fn((type: string, cb: () => void) => {
        (listeners[type] = listeners[type] || []).push(cb);
        return () => {
          listeners[type] = listeners[type].filter(x => x !== cb);
        };
      }),
    },
    emit: (type: string) => act(() => (listeners[type] || []).slice().forEach(cb => cb())),
  };
}

type Options = Partial<Parameters<typeof useExitConfirm>[0]>;

function setup(options: Options = {}) {
  const { navigation, emit } = fakeNavigation();
  const props = {
    navigation,
    popupOpen: false,
    closePopup: jest.fn(),
    dialogOpen: false,
    closeDialog: jest.fn(),
    blocked: false,
    ...options,
  };
  const hook = renderHook((p: typeof props) => useExitConfirm(p), { initialProps: props });
  const pressBack = () => {
    let handled = false;
    act(() => {
      handled = handlers[handlers.length - 1]();
    });
    return handled;
  };
  return { props, emit, pressBack, ...hook };
}

beforeEach(() => {
  setPlatformOS('android');
  handlers = [];
  jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_event, handler) => {
    handlers.push(handler as () => boolean);
    return {
      remove: () => {
        handlers = handlers.filter(h => h !== handler);
      },
    };
  });
  exitApp = jest.spyOn(BackHandler, 'exitApp').mockImplementation(() => undefined);
});

afterEach(() => {
  restorePlatformOS();
  jest.restoreAllMocks();
});

describe('useExitConfirm', () => {
  // Covers: FR-4.8-01, P-11, TC-501 - back with nothing open shows the dialog
  it('[TC-501] shows the exit dialog on back and exits on "Okay"', () => {
    const { result, pressBack } = setup();
    expect(pressBack()).toBe(true);
    expect(result.current.exitVisible).toBe(true);
    act(() => result.current.onOkay());
    expect(exitApp).toHaveBeenCalledTimes(1);
    expect(result.current.exitVisible).toBe(false);
  });

  // Covers: FR-4.8-02, P-12, TC-502 - "CANCEL" closes the dialog and stays
  it('[TC-502] closes the dialog on "CANCEL" without exiting', () => {
    const { result, pressBack } = setup();
    pressBack();
    act(() => result.current.onCancel());
    expect(result.current.exitVisible).toBe(false);
    expect(exitApp).not.toHaveBeenCalled();
  });

  // Covers: FR-4.8-03, BR-10, E-11, TC-503 - an open popup closes first, then the next back shows the dialog
  it('[TC-503] closes an open popup first and shows the exit dialog on the next back', () => {
    const { result, pressBack, props, rerender } = setup({ popupOpen: true });
    pressBack();
    expect(props.closePopup).toHaveBeenCalledTimes(1);
    expect(result.current.exitVisible).toBe(false);
    rerender({ ...props, popupOpen: false });
    pressBack();
    expect(result.current.exitVisible).toBe(true);
  });

  // Covers: FR-4.8-03 - an open dismissable dialog closes next
  it('closes an open dismissable dialog before showing the exit dialog', () => {
    const { result, pressBack, props } = setup({ dialogOpen: true });
    pressBack();
    expect(props.closeDialog).toHaveBeenCalledTimes(1);
    expect(result.current.exitVisible).toBe(false);
  });

  // Covers: FR-4.7-05, FR-4.7-06 - a blocking message swallows back
  it('swallows back while a blocking message is open', () => {
    const { result, pressBack, props } = setup({ blocked: true, popupOpen: true });
    expect(pressBack()).toBe(true);
    expect(result.current.exitVisible).toBe(false);
    expect(props.closePopup).not.toHaveBeenCalled();
  });

  // Covers: FR-4.8-04 - registered only while Home is focused
  it('registers only while focused and removes the handler on blur and unmount', () => {
    const { emit, unmount } = setup();
    expect(handlers).toHaveLength(1);
    emit('blur');
    expect(handlers).toHaveLength(0);
    emit('focus');
    expect(handlers).toHaveLength(1);
    unmount();
    expect(handlers).toHaveLength(0);
  });

  // Covers: FR-4.8-04 - the exit dialog is dismissed when Home loses focus
  it('hides the exit dialog when Home loses focus', () => {
    const { result, pressBack, emit } = setup();
    pressBack();
    expect(result.current.exitVisible).toBe(true);
    emit('blur');
    expect(result.current.exitVisible).toBe(false);
  });

  // Covers: FR-4.8-01 - iOS has no hardware back
  it('registers nothing on iOS', () => {
    setPlatformOS('ios');
    setup();
    expect(handlers).toHaveLength(0);
  });
});
