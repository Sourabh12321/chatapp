import React, { useState } from 'react';
import style from './css/groupchat.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { userList } from '../redux/slice/auth';
import { createGroupChat } from '../redux/slice/chat';

const CreateGroupModal = ({ show, onClose, onCreate }) => {
    const dispatch = useDispatch();
    const users = useSelector((state) => state.auth.userList);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [groupImage, setGroupImage] = useState(null);

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        dispatch(userList(term));
    };

    const handleUserSelect = (user) => {
        setSelectedUsers((prevSelected) =>
            prevSelected.includes(user)
                ? prevSelected.filter((u) => u !== user)
                : [...prevSelected, user]
        );
    };

    const handleGroupImageChange = (e) => {
        setGroupImage(e.target.files[0]);
    };

    const handleSubmit = () => {

        let users = [];
        selectedUsers?.forEach((el,i)=>{
            users.push(el?._id);
        })
        const groupData = {
            name:groupName,
            groupPic:groupImage,
            users: JSON.stringify(users),
        };

        dispatch(createGroupChat(groupData));
        onClose();
    };

    if (!show) {
        return null;
    }

    return (
        <div className={style.modalOverlay}>
            <div className={style.modalContent}>
                <h2>Create Group</h2>
                <div className={style.formGroup}>
                    <label>Group Name:</label>
                    <input
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="Enter group name"
                    />
                </div>
                <div className={style.formGroup}>
                    <label>Group Image:</label>
                    <input type="file" onChange={handleGroupImageChange} />
                </div>
                <div className={style.formGroup}>
                    <label>Search Users:</label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearch}
                        placeholder="Search users..."
                    />
                    <div className={style.suggestions}>
                        {users.map((user, index) => (
                            <div
                                key={index}
                                className={`${style.suggestionItem} ${selectedUsers.includes(user) ? style.selected : ''}`}
                                onClick={() => handleUserSelect(user)}
                            >
                                <img src={user.pic} alt="User" className={style.avatar} />
                                <p>{user.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
                {selectedUsers.length > 0 && (
                    <div className={style.selectedUsers}>
                        <h3>Selected Users:</h3>
                        <div className={style.selectedUserList}>
                            {selectedUsers.map((user, index) => (
                                <div key={index} className={style.selectedUserItem}>
                                    <img src={user.pic} alt="User" className={style.avatar} />
                                    {user.name}
                                    <button onClick={() => handleUserSelect(user)}>Remove</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className={style.formActions}>
                    <button onClick={handleSubmit}>Create Group</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default CreateGroupModal;
