import React, { useState } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import PasswordInput from '../../components/Input/PasswordInput'
import { Link } from 'react-router-dom'
import { validateEmail } from '../../utils/helper'
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const SignUp = () => {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSignUp = async(e) => {
    e.preventDefault();

    if(!validateEmail(email)){
      setError("Please enter a valid email address");
      return;
    }

    if( password !== confirmPassword){
      setError('Password and Confirm Password do not match');
      return;
    }

    setError('');

     //SignUp Api call

    try{
      const response = await axiosInstance.post("/register", {
        fullName: name,
        email: email,
        password: password,
        confirmPassword: confirmPassword
      });

      if(response.data && response.data.error){
        setError(response.data.message)
        return;
      }

      if(response.data && response.data.accessToken){
        localStorage.setItem("token", response.data.accessToken);
        navigate("/dashboard")
      }
  } catch(error){
    if(error.response && error.response.data && error.response.data.message) {
      setError(error.response.data.message)
    } else{
      setError("An Unexpected Error Occoured. Please Try again!")
    }
  }
  }

 

 
  return (
    <>
    <Navbar />

    <div className='flex items-center justify-center mt-20'>
      <div className='w-96 border rounded bg-white px-7 py-10'>
        <form onSubmit={handleSignUp}>
          <h4 className='text-2xl mb-7'>SignUp</h4>

          <input 
            type='text' 
            placeholder='What&apos;s your Name?' 
            className='input-box' 
            value={name}
            required
            onChange={(e)=> setName(e.target.value)}
            />

          <input 
            type='text' 
            placeholder='Please Enter Your Email!' 
            className='input-box' 
            required
            value={email}
            onChange={(e)=> setEmail(e.target.value)}
            />

          <PasswordInput
          placeholder='Enter a Password'
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)} />

          <PasswordInput
          value={confirmPassword}
          required
          placeholder='Confirm your Entered Password'
          onChange={(e) => setConfirmPassword(e.target.value)} />

          {error && 
          <p className='text-red-500 text-xs pb-1'>{error} </p>
          }

          <button type='submit' className='btn-primary'>
            Create Account
          </button>

          <p className='text-sm text-center mt-4'>
            Already Have an account? {""}
            <Link to="/login" className='font-medium text-primary underline'>Login Here</Link>
          </p>

        </form>
      </div>
    </div>
    </>
  )
}

export default SignUp