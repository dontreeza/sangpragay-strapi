import reducer from '../reducer';

describe('USERS PERMISSIONS | HOOKS | useDefaultLocales | reducer', () => {
  describe('DEFAULT_ACTION', () => {
    it('should return the initialState', () => {
      const state = {
        test: true,
      };

      expect(reducer(state, {})).toEqual(state);
    });
  });

  describe('GET_DATA', () => {
    it('should set the isLoading key to true', () => {
      const state = {
        defaultLocales: [
          {
            id: 1,
            displayName: 'french',
            code: 'en-US',
          },
        ],
        isLoading: false,
      };

      const action = {
        type: 'GET_DATA',
      };

      const expected = {
        defaultLocales: [
          {
            id: 1,
            displayName: 'french',
            code: 'en-US',
          },
        ],
        isLoading: true,
      };

      expect(reducer(state, action)).toEqual(expected);
    });
  });

  describe('GET_DATA_ERROR', () => {
    it('should set isLoading to false is an error occured', () => {
      const action = {
        type: 'GET_DATA_ERROR',
      };
      const initialState = {
        defaultLocales: [],
        isLoading: true,
      };
      const expected = {
        defaultLocales: [],
        isLoading: false,
      };

      expect(reducer(initialState, action)).toEqual(expected);
    });
  });

  describe('GET_DATA_SUCCEEDED', () => {
    it('should return the state with the role list', () => {
      const action = {
        type: 'GET_DATA_SUCCEEDED',
        data: [
          {
            id: 1,
            displayName: 'french',
            code: 'en-US',
          },
        ],
      };
      const initialState = {
        defaultLocales: [],
        isLoading: true,
      };
      const expected = {
        defaultLocales: [
          {
            id: 1,
            displayName: 'french',
            code: 'en-US',
          },
        ],
        isLoading: false,
      };

      expect(reducer(initialState, action)).toEqual(expected);
    });
  });
});
