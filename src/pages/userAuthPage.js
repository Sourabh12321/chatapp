import React, { useState } from 'react';
import style from '../css/userAuthPage.module.css';
import Navbar from '../component/navbar';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import swal from 'sweetalert';
import { authUserLogin, authUserSignup, sendOtp, updatePassword, forgetPassword } from '../redux/slice/auth';

const LoginSignupPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [signData, setSignData] = useState({ name: '', email: '', password: '', photo: null });
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [errors, setErrors] = useState({});
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [newPassword, setNewPassword] = useState({ password: '', confirmPassword: '' });

    let userId = localStorage.getItem("userId");

    const handleInputChange = (e, type) => {
        const { name, value, files } = e.target;
        if (type === 'login') {
            setLoginData({ ...loginData, [name]: value });
        } else if (type === 'signup') {
            if (name === 'photo') {
                setSignData({ ...signData, photo: files[0] });
            } else {
                setSignData({ ...signData, [name]: value });
            }
        } else if (type === 'forgotPassword') {
            if (name === 'password' || name === 'confirmPassword') {
                setNewPassword({ ...newPassword, [name]: value });
            }
        }
    };

    const validateForm = (data, type) => {
        const newErrors = {};
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (type === 'signup' && !data.name) newErrors.name = 'Username is required';
        if (!data.email) newErrors.email = 'Email is required';
        if (!emailPattern.test(data.email)) newErrors.email = 'Invalid email format';
        if (!data.password) newErrors.password = 'Password is required';
        if (type === 'signup' && !data.photo) newErrors.photo = 'Photo is required';

        return newErrors;
    };

    const handleOtpSend = () => {
        const newErrors = validateForm(signData, 'signup');
        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            setOtpSent(true);

            dispatch(sendOtp({ email: signData.email, name: signData.name }))
                .then(() => {
                    swal("OTP sent to your email");
                })
                .catch((error) => {
                    console.error('Failed to send OTP:', error);
                });
        }
    };

    const handleSubmit = (e, type) => {
        e.preventDefault();
        if (type === 'login') {
            const newErrors = validateForm(loginData, 'login');
            setErrors(newErrors);

            if (Object.keys(newErrors).length === 0) {
                dispatch(authUserLogin(loginData))
                    .then((response) => {
                        localStorage.setItem('token', response?.payload?.token);
                        localStorage.setItem('name', response?.payload?.user?.name);
                        localStorage.setItem('userId', response?.payload?.user?._id);
                        swal("User Login successfully", "success");
                        setTimeout(() => {
                            navigate('/chat');
                        }, 100);
                    })
                    .catch((error) => {
                        console.error('Login failed:', error);
                    });
            }
        } else if (type === 'signup') {
            const data = { ...signData, otp };
            const newErrors = validateForm(data, 'signup');
            setErrors(newErrors);

            if (Object.keys(newErrors).length === 0) {
                dispatch(authUserSignup(data))
                    .then((response) => {
                        let msg = response?.payload?.msg;
                        if (msg === 'Invalid or expired OTP') {
                            swal("Warning!", "Wrong OTP", "warning");
                        } else if (msg === 'User already registered') {
                            swal("Warning!", "User already registered", "warning");
                            setIsLogin(true);
                        } else if (msg === 'User registered successfully') {
                            swal("User registered successfully", "success");
                            setIsLogin(true);
                        }
                    })
                    .catch((error) => {
                        console.error('Signup failed:', error);
                    });
            }
        } else if (type === 'forgotPassword') {
            if (otpSent) {
                // Verify OTP and update password
                if (newPassword.password === newPassword.confirmPassword) {
                    dispatch(updatePassword({ email: loginData.email, otp,newPassword:newPassword?.password }))
                        .then((response) => {
                            console.log("response",response)
                            if (response?.payload?.msg == 'Invalid or expired OTP' || response?.payload?.msg == 'OTP not found or expired') {
                                swal("Warning!", "Wrong OTP", "warning");
                            } else if (response?.payload?.msg == 'Password updated successfully') {
                                swal("Password updated successfully", "success");
                                setIsLogin(true);
                            }
                        })
                        .catch((error) => {
                            console.error('Failed to verify OTP:', error);
                        });
                } else {
                    swal("Warning!", "Passwords do not match", "warning");
                }
            } else {
                dispatch(forgetPassword({ email: loginData.email }))
                    .then(() => {
                        swal("OTP sent to your email", "success");
                        setOtpSent(true);
                    })
                    .catch((error) => {
                        console.error('Failed to send OTP:', error);
                    });
            }
        }
    };

    const handleEdit = () => {
        setOtpSent(false);
        setOtp('');
    };

    return (
        <div>
            <Navbar />
            {console.log("userId",userId)}
            {userId==null?
            <div className={style.container}>
                <div className={style.formContainer}>
                    <div className={style.toggleButtons}>
                        <button className={isLogin ? style.active : ''} onClick={() => setIsLogin(true)}>Login</button>
                        <button className={!isLogin ? style.active : ''} onClick={() => setIsLogin(false)}>Signup</button>
                    </div>
                    {isLogin ? (
                        !isForgotPassword ? (
                            <form className={style.form} onSubmit={(e) => handleSubmit(e, 'login')}>
                                <h2>Login</h2>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={loginData.email}
                                    onChange={(e) => handleInputChange(e, 'login')}
                                    required
                                />
                                {errors.email && <span className={style.error}>{errors.email}</span>}
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={loginData.password}
                                    onChange={(e) => handleInputChange(e, 'login')}
                                    required
                                />
                                {errors.password && <span className={style.error}>{errors.password}</span>}
                                <button type="submit">Login</button>
                                <p style={{cursor:'pointer'}} onClick={() => setIsForgotPassword(true)}>Forgot Password?</p>
                            </form>
                        ) : (
                            <form className={style.form} onSubmit={(e) => handleSubmit(e, 'forgotPassword')}>
                                <h2>Forgot Password</h2>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={loginData.email}
                                    onChange={(e) => handleInputChange(e, 'login')}
                                    disabled={otpSent}
                                    required
                                />
                                {errors.email && <span className={style.error}>{errors.email}</span>}
                                {otpSent && (
                                    <>
                                        <input
                                            type="text"
                                            name="otp"
                                            placeholder="Enter OTP"
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            required
                                        />
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="New Password"
                                            value={newPassword.password}
                                            onChange={(e) => handleInputChange(e, 'forgotPassword')}
                                            required
                                        />
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            placeholder="Confirm New Password"
                                            value={newPassword.confirmPassword}
                                            onChange={(e) => handleInputChange(e, 'forgotPassword')}
                                            required
                                        />
                                    </>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <button type="submit">{otpSent ? 'Update Password' : 'Send OTP'}</button>
                                    {otpSent && <button type="button" onClick={handleEdit}>Edit</button>}
                                </div>
                            </form>
                        )
                    ) : (
                        <form className={style.form} onSubmit={(e) => handleSubmit(e, 'signup')}>
                            <h2>Signup</h2>
                            <input
                                type="text"
                                name="name"
                                placeholder="Username"
                                value={signData.name}
                                onChange={(e) => handleInputChange(e, 'signup')}
                                disabled={otpSent}
                                required
                            />
                            {errors.name && <span className={style.error}>{errors.name}</span>}
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={signData.email}
                                onChange={(e) => handleInputChange(e, 'signup')}
                                disabled={otpSent}
                                required
                            />
                            {errors.email && <span className={style.error}>{errors.email}</span>}
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={signData.password}
                                onChange={(e) => handleInputChange(e, 'signup')}
                                disabled={otpSent}
                                required
                            />
                            {errors.password && <span className={style.error}>{errors.password}</span>}
                            <input
                                type="file"
                                name="photo"
                                accept="image/*"
                                onChange={(e) => handleInputChange(e, 'signup')}
                                disabled={otpSent}
                                required
                            />
                            {errors.photo && <span className={style.error}>{errors.photo}</span>}
                            {otpSent && (
                                <>
                                    <input
                                        type="text"
                                        name="otp"
                                        placeholder="Enter OTP"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                    />
                                </>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                {!otpSent ? (
                                    <button type="button" onClick={handleOtpSend}>Send OTP</button>
                                ) : (
                                    <button type="submit">Verify OTP & Signup</button>
                                )}
                                {otpSent && <button type="button" onClick={handleEdit}>Edit</button>}
                            </div>
                        </form>
                    )}
                </div>
            </div>:""}
        </div>
    );
};

export default LoginSignupPage;

