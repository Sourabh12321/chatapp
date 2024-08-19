import React, { useState } from 'react';
import styles from './css/groupDetails.module.css';
import Delete from '../media/deletePng.png'
import { useDispatch, useSelector } from 'react-redux';
import { addMemberToGroup, changeGroupName, removeGroupMember} from '../redux/slice/chat';
import { userList } from '../redux/slice/auth';

const GroupDetailsModal = ({ show, onClose, group }) => {
    const dispatch = useDispatch();
    const users = useSelector((state) => state.auth.userList);
    const groupDetails = useSelector((state) => state.chat.groupDetails);
    const [searchTerm, setSearchTerm] = useState('');
    const [groupName, setGroupName] = useState(group.chatName);


    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        dispatch(userList(term));
    };

    const handleAddUser = (user) => {
        dispatch(addMemberToGroup({ chatId: group._id, userId: user._id }));
    };

    const handleRemoveUser = (user) => {
        dispatch(removeGroupMember({ chatId: group._id, userId: user._id }));
    };

    const handleRenameGroup = () => {
        dispatch(changeGroupName({ chatId: group._id, chatName: groupName }));
    };

    if (!show) {
        return null;
    }

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Group Details</h2>
                <div className={styles.formGroup}>
                    <label>Group Name:</label>
                    <input
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="Enter new group name"
                    />
                    <button onClick={handleRenameGroup}>Rename Group</button>
                </div>
                <div className={styles.formGroup}>
                    <label>Group Users:</label>
                    <div className={styles.userList}>
                        {groupDetails && groupDetails?.chatName?.length>0 ? (groupDetails?.users?.map((user) => (
                            <div key={user._id} className={styles.userItem}>
                                <img src={user?.pic} alt={user.name} className={styles.avatar} />
                                {user?.name}
                                <img style={{marginLeft:'5px'}} src={Delete} onClick={() => handleRemoveUser(user)} />
                            </div>
                        ))):( group?.users?.map((user) => (
                            <div key={user._id} className={styles.userItem}>
                                <img src={user?.pic} alt={user.name} className={styles.avatar} />
                                {user?.name}
                                <img style={{marginLeft:'5px'}} src={Delete} onClick={() => handleRemoveUser(user)} />
                            </div>
                        )))}
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label>Add User:</label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearch}
                        placeholder="Search users..."
                    />
                    <div className={styles.suggestions}>
                        {users?.length>0 && users?.map((user) => (
                            <div
                                key={user?._id}
                                className={styles.suggestionItem}
                                onClick={() => handleAddUser(user)}
                            >
                                <img src={user?.pic} alt={user.name} className={styles.avatar} style={{width:'40px',height:'40px',borderRadius: '50%'}} />
                                <p>{user?.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={styles.formActions}>
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default GroupDetailsModal;
