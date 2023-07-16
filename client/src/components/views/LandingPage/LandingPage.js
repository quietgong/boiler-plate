import React, { useState } from 'react';
import {useDispatch} from 'react-redux';
import {loginUser} from '../../../_actions/user_action'
function LandingPage(props) {

  const dispatch = useDispatch();

  // Props, State
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");

  const onEmailHandler = (event)=>{
    setEmail(event.currentTarget.value)
  }

  const onPasswordHandler = (event) =>{
    setPassword(event.currentTarget.value)
  }

  const onSubmitHandler = (event) =>{
    event.preventDefault(); // 잘못된 정보가 들어왔을 때 page가 refresh 되는것을 방지

    
    let body = {
      email : Email,
      password : Password
    }

    dispatch(loginUser(body))
    .then(response => {
      if(response.payload.loginSuccess){
        props.history.push('/')
      }else{
        alert('Error');
      }
    })    
  }

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      width:'100%', height:'100vh'
    }}>
      <form onSubmit={onSubmitHandler} style={{display:'flex', flexDirection:'column'}}>
        <label>Email</label>
        <input type='email' value={Email} onChange={onEmailHandler} />
        <label>Password</label>
        <input type='password' value={Password} onChange={onPasswordHandler} />
        <br/>
        <button type='submit'>
          Login
        </button>
      </form>
    </div>
  )
}

export default LandingPage