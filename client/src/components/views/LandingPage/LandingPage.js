import React, { useEffect } from 'react';
import axios from 'axios';

function LandingPage() {

  useEffect(()=>{
    axios.get('/api/hello')
    .then(response => {
      console.log(response.data);
    })
    .catch(error => {
      console.error(error);
    })
  }, [])

  return (
    <div>LandingPage 랜딩페이지입니다.</div>
  )
}

export default LandingPage