import {configureStore} from '@reduxjs/toolkit'
import authSlice from './slice/auth'
import chatSlice from './slice/chat'


export const store = configureStore({
    reducer:{
        auth: authSlice,
        chat:chatSlice,
    }
});


