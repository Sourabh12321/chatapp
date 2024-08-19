import React, { useEffect, useState } from 'react';
import style from './css/navbar.module.css'
import { logout, userList } from '../redux/slice/auth'
import Logo from "../media/logo.png"
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showName, setShowName] = useState(false);
    const [name, setName] = useState('');
    let Availablename = localStorage.getItem("name");

    const handleLogout = () => {
        localStorage.clear();
        dispatch(logout());
        navigate('/')
    }
    
    return (
        <nav className={style.navbar} >
            <div className={style.logo}>
                <img src={Logo} alt="Logo" />
            </div>
            {Availablename ?
                <div className={style.user}>
                    <p>{Availablename}</p>
                    <button onClick={handleLogout}>Logout</button>
                </div> : ''}
        </nav>
    );
};

export default Navbar;
