import { AuthState } from '@/types/auth';
import { createSlice, configureStore, PayloadAction } from '@reduxjs/toolkit'
import { User } from 'better-auth/types';



const initialState: AuthState['auth'] = {
    user: null,
    isAuthenticated: false
}

const authSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        login: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        }
    }
})

export const { login, logout } = authSlice.actions

export default authSlice.reducer