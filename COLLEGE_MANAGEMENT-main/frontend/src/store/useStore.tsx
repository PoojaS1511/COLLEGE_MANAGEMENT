import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';

type State = {
  // Add your store state properties here
};

type Action = {
  type: string;
  payload?: any;
};

type StoreContextType = {
  state: State;
  dispatch: (action: Action) => void;
};

const initialState: State = {
  // Initialize your state here
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

function reducer(state: State, action: Action): State {
  switch (action.type) {
    default:
      return state;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const contextValue = { state, dispatch };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
