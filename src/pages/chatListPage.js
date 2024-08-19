import React, { useEffect, useState } from 'react';
import style from '../css/chatList.module.css';
import Chat from '../component/chat';
import Navbar from '../component/navbar';
import CreateGroupModal from '../component/groupchat';
import groupIcon from '../media/group icon.png';
import { useDispatch, useSelector } from 'react-redux';
import { createSingleChat, fetchAllMessages, fetchChatList, readBymessage } from '../redux/slice/chat';
import { userList } from '../redux/slice/auth';
import io from 'socket.io-client'


let ENDPOINT = 'http://localhost:8000'
var socket
const ChatList = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.chat);
  const userlist = useSelector((state) => state.auth.userList);
  const [chats, setChats] = useState([]);
  const [chatID, setChatID] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatName, setChatName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredChats, setFilteredChats] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  let userId = localStorage.getItem("userId");

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      dispatch(fetchChatList(token));
    } else {
      // Handle case where token is not available
      console.error('Token not found');
    }
  }, []);
  

  useEffect(() => {
    if (state?.chats?.length > 0) {
      setChats(state?.chats);
      setFilteredChats(state?.chats);
    }
    if (state?.messages) {
      setSelectedChat(state?.messages);
    }

    setFilteredChats(userlist);
  }, [state, userlist]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChatClick = (chat) => {
    setChatName(chat);
    setChatID(chat._id);
    setSelectedChat(chat);
    dispatch(fetchAllMessages(chat._id));
    if (chat?.latestmessage !== null && chat?.latestmessage?.sender?._id !== userId) {
      dispatch(readBymessage(chat?.latestmessage?._id))
    }

    if (windowWidth < 768) {
      setShowChatList(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.trim()) {
      dispatch(userList(term));
      setShowSuggestions(true);
    } else {
      setFilteredChats(chats);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (user) => {
    setSearchTerm('');
    dispatch(createSingleChat({ userId: user?._id }));
    setShowSuggestions(false);
  };

  const handleCreateGroup = () => {
    setShowCreateGroupModal(true);
  };

  const handleGroupCreate = (groupData) => {
    // Implement group creation logic here
  };

  const handleBackClick = () => {
    dispatch(fetchChatList());
    setShowChatList(true);
  };

  return (
    <div className={style.mainContainer}>
      <Navbar />
      {userId!==null?<>
      <div className={style.chatContainer}>
        {(windowWidth >= 800 || showChatList) && (
          <div className={style.chatList}>
            <div className={style.searchContainer}>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search chats..."
                className={style.searchInput}
              />
              <button className={style.createGroupButton} onClick={handleCreateGroup}>
                Group
              </button>
            </div>
            {showSuggestions && (
              <div className={style.suggestions}>
                {filteredChats.map((chat, index) => (
                  <div
                    key={index}
                    className={style.chatItem}
                    onClick={() => handleSuggestionClick(chat)}
                  >
                    <img
                      src={chat?.pic}
                      alt="User pic"
                      className={style.avatar}
                    />
                    <div className={style.chatDetails}>
                      <h3>{chat?.name}</h3>
                      <p>
                        {chat?.latestmessage
                          ? chat.latestmessage.content.length > 20
                            ? `${chat.latestmessage.content.substring(0, 20)}...`
                            : chat.latestmessage.content
                          : 'No messages yet'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {chats?.length > 0 &&
              chats?.map((chat, index) => (
                <div
                  key={index}
                  className={style.chatItem}
                  onClick={() => handleChatClick(chat)}
                >
                  <img
                    src={chat?.users[chat?.users?.length - 1]?.pic}
                    alt="User pic"
                    className={style.avatar}
                  />
                  <div className={style.chatDetails}>
                    <div>
                      <h3>{chat?.chatName}</h3>
                      <p style={{ color: `${chat?.readStatus ? 'white' : 'grey'}`, fontWeight: `${chat?.readStatus ? 'bold' : ''}` }} >
                        {chat?.latestmessage
                          ? chat.latestmessage.content.length > 20
                            ? `${chat.latestmessage.content.substring(0, 20)}...`
                            : chat.latestmessage.content
                          : 'No messages yet'}
                      </p>
                    </div>
                    {chat?.isGroupChat && <img src={groupIcon} className={style.groupIcon} style={{ width: '20px', height: '20px' }} />}
                  </div>
                </div>
              ))}
          </div>
        )}
        {(windowWidth >= 800 || !showChatList) && (
          <div className={style.chatBox}>
            {/* {windowWidth < 800 && !showChatList && (
              <button className={style.backButton} onClick={handleBackClick}>
                Back
              </button>
            )} */}
            {selectedChat ? (
              <Chat chat={selectedChat} chatID={chatID} chatName={chatName} backbutton={handleBackClick} />
            ) : (
              <div className={style.placeholder}>Select a chat to start messaging</div>
            )}
          </div>
        )}
      </div>
      <CreateGroupModal
        show={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onCreate={handleGroupCreate}
      /></>:""}
    </div>
  );
};

export default ChatList;
