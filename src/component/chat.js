import React, { useEffect, useRef, useState } from 'react';
import styles from './css/chat.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessage } from '../redux/slice/chat';
import alertSoundFile from '../media/alertSound.mp3';
import { fetchChatList } from '../redux/slice/chat'
import GroupDetailsModal from './groupDetails';
import { FaArrowCircleLeft } from "react-icons/fa";
import Lottie from "react-lottie";
import animationData from "./typing.json";
import io from 'socket.io-client'


let ENDPOINT = process.env.REACT_APP_API_URL
var socket, selectedChatCompare
function Chat({ chat, chatID, chatName, backbutton }) {
    const messagesEndRef = useRef(null);
    const dispatch = useDispatch();
    const groupDetails = useSelector((state) => state.chat.groupDetails);
    const [message, setMessage] = useState('');
    const [messageList, setMessageList] = useState([]);
    const [showGroupDetails, setShowGroupDetails] = useState(false);
    const userID = localStorage.getItem("userId");
    const [selectChat, setSelectChat] = useState({});
    const [socketConnect, setSocketConnect] = useState(false)
    const [typing, setTyping] = useState(false);
    const [istyping, setIsTyping] = useState(false);
    let userId = localStorage.getItem("userId");

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    };

    useEffect(() => {
        setMessageList(chat)

        selectedChatCompare = chatName;
        setSelectChat(chatName);
    }, [chat])

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("setup", userId);
        socket.emit('join chat', chatID)
        socket.on("connected", () => setSocketConnect(true));
        socket.on('connection', () => {
            setSocketConnect(true)
        })
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));
    }, [])

    useEffect(() => {
        let userInteracted = false;

        const enableSound = () => {
            userInteracted = true;
            document.removeEventListener('click', enableSound);
        };

        const handleMessageReceived = (newMessage) => {
            dispatch(fetchChatList());

            if (Array.isArray(messageList)) {
                document.addEventListener('click', enableSound);

                if (selectedChatCompare?._id === newMessage?.chat?._id) {
                    setMessageList(prevMessages => [...prevMessages, newMessage]);

                }

                const alertSound = new Audio(alertSoundFile);
                alertSound.play();
            }
        };

        socket.on("message received", handleMessageReceived);

        return () => {
            socket.off("message received", handleMessageReceived);
        };

    });
    // Empty dependency array to run only once

    const handleSend = (e) => {
        if (e.key === "Enter" && message) {
            socket.emit("stop typing", chatID);
        }
        e.preventDefault();
        if (message.trim()) {
            const body = {
                chatId: chatID,
                content: message,
            };
            dispatch(sendMessage(body))
                .then((response) => {
                    if (response.meta.requestStatus === 'fulfilled') {
                        const sentMessage = response.payload;

                        // Emit the sent message to the server
                        const lastMessage = sentMessage?.messages[sentMessage?.messages?.length - 1]
                        socket.emit('new message', lastMessage);
                        // Optionally update the message list in the UI
                        const userIds = lastMessage.chat.users;
                        socket.emit('refresh chat list', { userIds });

                        setMessageList(prevMessages => [...prevMessages, sentMessage?.messages[sentMessage?.messages?.length - 1]]);
                        dispatch(fetchChatList());
                    }
                });
            setMessage('');
        }
    };

    const typingHandler = (e) => {
        // setNewMessage(e.target.value);
        setMessage(e.target.value)

        if (!socketConnect) return;

        if (!typing) {
            setTyping(true);
            socket.emit("typing", chatID);
        }
        let lastTypingTime = new Date().getTime();
        var timerLength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit("stop typing", chatID);
                setTyping(false);
            }
        }, timerLength);
    };
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messageList]); // Trigger the scroll every time messageList updates


    return (
        <div className={styles.chatContainer}>
            {chatName && (
                <>
                    <div className={styles.chatHeader} >
                        <div className={styles.backButton}>
                            <FaArrowCircleLeft onClick={backbutton} style={{ color: 'white', width: "30px", height: "30px", marginRight: '10px', marginTop: '10px' }} />
                        </div>
                        <img src={chatName?.users[chatName?.users?.length - 1]?.pic} alt={chatName} className={styles.chatPhoto} />
                        <div className={styles.chatInfo}>
                            <div>
                                <h3 className={styles.chatName}>{groupDetails && groupDetails?.chatName ? groupDetails?.chatName : chatName?.chatName}</h3>
                            </div>
                            {chatName?.isGroupChat && (
                                <div className={styles.groupDetailsButtonContainer}>
                                    <button
                                        className={styles.groupDetailsButton}
                                        onClick={() => setShowGroupDetails(true)}
                                    >
                                        Details
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <GroupDetailsModal
                        show={showGroupDetails}
                        onClose={() => setShowGroupDetails(false)}
                        group={chatName}
                    />
                </>
            )}
            <div className={styles.messages}>
                {messageList?.length > 0 &&
                    messageList?.map((el, i) => {
                        const isCurrentUser = el?.sender?._id === userID;
                        return (
                            <div key={i} className={isCurrentUser ? styles.messageRight : styles.messageLeft}>
                                {!isCurrentUser && <img src={el?.sender?.pic} className={styles.userPhoto} />}
                                <div className={styles.messageContent}>
                                    {!isCurrentUser && <p className={styles.userName}>{el?.sender?.name}</p>}
                                    <p className={styles.messageText}>{el?.content}</p>
                                    <p className={styles.messageTime}>{new Date(el?.updatedAt).toLocaleTimeString()}</p>
                                </div>

                            </div>
                        );
                    })}
                {istyping ? (
                    <div>
                        <Lottie
                            options={defaultOptions}
                            // height={50}
                            width={50}
                            style={{ marginBottom: 15, marginLeft: 0 }}
                        />
                    </div>
                ) : (
                    <></>
                )}
                <div ref={messagesEndRef} />
            </div>
            {chatName && (
                <form className={styles.inputContainer} onSubmit={handleSend}>
                    <input
                        type="text"
                        value={message}
                        onChange={typingHandler}
                        placeholder="Type a message..."
                        className={styles.messageInput}
                    />
                    <button type="submit" className={styles.sendButton}>Send</button>
                </form>
            )}
        </div>
    );
}

export default Chat;
