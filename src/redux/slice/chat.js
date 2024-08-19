import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// const BASE_URL = process.env.REACT_APP_BASE_URL;
const BASE_URL = process.env.REACT_APP_API_URL;
var token = localStorage.getItem('token'); // Adjust based on your token storage method

// Fetch chat list
export const fetchChatList = createAsyncThunk('chat/fetchChatList', async (tokenId) => {
    const response = await fetch(`${BASE_URL}/chat/chats`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token?token:tokenId}`
        },
    });

    if(!token){
        token = tokenId;
    }
    const data = await response.json();

    if (data.msg === "Please Log In First") {
        localStorage.clear();
    }

    return data;
});

// Create single chat
export const createSingleChat = createAsyncThunk('chat/createSingleChat', async (item) => {
    const response = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(item)
    });
    const data = await response.json();

    if (data.msg === "Please Log In First") {
        localStorage.clear();
    }

    return data;
});

// Create group chat
export const createGroupChat = createAsyncThunk('chat/createGroupChat', async (item) => {
    const response = await fetch(`${BASE_URL}/chat/create-group-chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(item)
    });
    const data = await response.json();

    if (data.msg === "Please Log In First") {
        localStorage.clear();
    }

    return data;
});

// Change group name
export const changeGroupName = createAsyncThunk('chat/changeGroupName', async (item) => {
    const response = await fetch(`${BASE_URL}/chat/group-rename`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(item)
    });
    const data = await response.json();

    if (data.msg === "Please Log In First") {
        localStorage.clear();
    }

    return data;
});

// Remove group member
export const removeGroupMember = createAsyncThunk('chat/removeGroupMember', async (item) => {
    const response = await fetch(`${BASE_URL}/chat/remove-group-member`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(item)
    });
    const data = await response.json();

    if (data.msg === "Please Log In First") {
        localStorage.clear();
    }

    return data;
});

// Add member to group
export const addMemberToGroup = createAsyncThunk('chat/addMemberToGroup', async (item) => {
    const response = await fetch(`${BASE_URL}/chat/add-to-group`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(item)
    });
    const data = await response.json();

    if (data.msg === "Please Log In First") {
        localStorage.clear();
    }

    return data;
});

// Send message
export const sendMessage = createAsyncThunk('messages/sendMessage', async (item) => {
    const response = await fetch(`${BASE_URL}/messages/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(item)
    });
    const data = await response.json();

    if (data.msg === "Please Log In First") {
        localStorage.clear();
    }

    return data;
});

// Fetch all messages
export const fetchAllMessages = createAsyncThunk('messages/fetchAllMessages', async (id) => {
    const response = await fetch(`${BASE_URL}/messages/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        },
    });
    const data = await response.json();


    if (data.msg === "Please Log In First") {
        localStorage.clear();
    }

    return data;
});


// Send message
export const readBymessage = createAsyncThunk('messages/readby', async (id) => {
    const response = await fetch(`${BASE_URL}/messages/${id}/read`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });
    const data = await response.json();

    if (data.msg === "Please Log In First") {
        localStorage.clear();
    }

    return data;
});

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        isLoading: false,
        chats: [],
        messages: [],
        msg: '',
        isError: false,
        groupDetails:{}
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchChatList.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchChatList.fulfilled, (state, action) => {
                state.isLoading = false;
                state.chats = action.payload.chats;
            })
            .addCase(fetchChatList.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            })
            .addCase(createSingleChat.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createSingleChat.fulfilled, (state, action) => {
                state.isLoading = false;
                state.msg = action.payload.msg;
                // swal(action.payload.msg);
                state.chats = action.payload.chats;
            })
            .addCase(createSingleChat.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            })
            .addCase(createGroupChat.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createGroupChat.fulfilled, (state, action) => {
                state.isLoading = false;
                state.msg = action.payload.msg;
                state.chats = action.payload.chats;
            })
            .addCase(createGroupChat.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            })
            .addCase(changeGroupName.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(changeGroupName.fulfilled, (state, action) => {
                state.isLoading = false;
                state.msg = action.payload.msg;
                state.groupDetails = action.payload.groupDetails;
                state.chats = action.payload.chats;
            })
            .addCase(changeGroupName.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            })
            .addCase(removeGroupMember.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(removeGroupMember.fulfilled, (state, action) => {
                state.isLoading = false;
                state.msg = action.payload.msg;
                state.groupDetails = action.payload.groupDetails;

            })
            .addCase(removeGroupMember.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            })
            .addCase(addMemberToGroup.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addMemberToGroup.fulfilled, (state, action) => {
                state.isLoading = false;
                state.msg = action.payload.msg;
                state.groupDetails = action.payload.groupDetails;

            })
            .addCase(addMemberToGroup.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            })
            .addCase(sendMessage.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.isLoading = false;
                state.msg = action.payload.msg;
                state.messages = action.payload.messages;
                // state.messages.push(action.payload.data);
            })
            .addCase(sendMessage.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            })
            .addCase(fetchAllMessages.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchAllMessages.fulfilled, (state, action) => {
                state.isLoading = false;
                state.messages = action.payload.messages;
            })
            .addCase(fetchAllMessages.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            })
            .addCase(readBymessage.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(readBymessage.fulfilled, (state, action) => {
                state.isLoading = false;
            })
            .addCase(readBymessage.rejected, (state) => {
                state.isLoading = false;
                state.isError = true;
            });
            
    }
});

export default chatSlice.reducer;
