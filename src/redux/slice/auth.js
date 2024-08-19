import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'



// const BASE_URL = process.env.REACT_APP_BASE_URL;
const BASE_URL = process.env.REACT_APP_API_URL;
const token = localStorage.getItem('token'); // Adjust based on your token storage method


export const authUserSignup = createAsyncThunk('authSignup', async (data) => {
    const response = await fetch(`${BASE_URL}/user/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return response.json();
})

export const sendOtp = createAsyncThunk('auth/sendOtp', async (body) => {
    const response = await fetch(`${BASE_URL}/user/send-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error('Failed to send OTP');
    }

    return response.json();
});

export const forgetPassword = createAsyncThunk('auth/forgetPassword', async (body) => {
    const response = await fetch(`${BASE_URL}/user/forgot-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error('Failed to send password reset OTP');
    }

    return response.json();
});

export const updatePassword = createAsyncThunk('auth/updatePassword', async (body, { rejectWithValue }) => {
    try {
        const response = await fetch(`${BASE_URL}/user/update-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return rejectWithValue(errorData);
        }

        return response.json();
    } catch (error) {
        return rejectWithValue({ msg: 'Failed to verify OTP', error });
    }
});

export const authUserLogin = createAsyncThunk('authLogin', async (data) => {
    const response = await fetch(`${BASE_URL}/user/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return response.json();
}) 

export const userList = createAsyncThunk('userList',async (search) =>{
    const response = await fetch(`${BASE_URL}/user?search=${search}`,{
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        },
    })
    return response.json();
})

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        isLoading: false,
        data: null,
        isError: false,
        userList:[],
    },
    reducers: {
        logout: (state) => {
            state.isLoading = false;
            state.data = null;
            state.isError = false;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(authUserSignup.pending, (state, action) => {
            state.isLoading = true;
        });
        builder.addCase(authUserSignup.fulfilled, (state, action) => {
            state.isLoading = false;
            state.data = action.payload;
        })
        builder.addCase(authUserSignup.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
        })
        builder.addCase(authUserLogin.pending, (state, action) => {
            state.isLoading = true;
        });
        builder.addCase(authUserLogin.fulfilled, (state, action) => {
            state.isLoading = false;
            state.data = action.payload;
        })
        builder.addCase(authUserLogin.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
        })
        builder.addCase(userList.pending,(state,action)=>{
            state.isLoading = true;
        })
        builder.addCase(userList.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.userList = action.payload;

        })
        builder.addCase(userList.rejected,(state,action)=>{
            state.isLoading = false;
            state.isError = true;
        })

    }
})

export const {logout} = authSlice.actions
export default authSlice.reducer;